import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useCreateAudiometryEntryMutation } from '@/shared/api/mutations/audiometry/create-audiometry-entry-mutation';
import {
  FETCH_AUDIOMETRY_ENTRY_KEY,
  useAudiometryEntriesQuery,
  useAudiometryEntryQuery,
} from '@/shared/api/querys/patient-audiometry-entries-query';
import { usePatientQuery } from '@/shared/api/querys/get-patient-query';
import { calculateAge, formatCalendarDate, formatDateTime } from '@/shared/utils/formatters';
import { useResolveAuthorLabel } from '@/hooks/use-resolve-author-label';
import { useSession } from '@/hooks/use-session';
import { printWithFileName } from '@/shared/utils/print-document';
import { buildPrintFileName } from '@/shared/utils/print-file-name';
import { TEXT } from '@/static/texts/i18n';
import {
  AudiogramMarks,
  AudiometryNotes,
  AudiometryTool,
  DEFAULT_GRADING_SCALE,
  DEFAULT_PRESENTED_WORDS_TYPE,
  DEFAULT_PTA_TYPE,
  EARS,
  Ear,
  FailedWordsValues,
  GradingScale,
  MASKABLE_TOOLS,
  PRESENTED_WORDS_BY_LIST_TYPE,
  PtaType,
  SPEECH_FAILED_WORDS_MIN,
  SPEECH_FIELD_RANGES,
  SpeechField,
  SpeechFieldValues,
  SpeechMarks,
  WeberResult,
  buildDefaultWeber,
  buildEmptyFailedWordsValues,
  buildEmptyAudiometryNotes,
  buildEmptyMarks,
  buildEmptySpeechFieldValues,
  buildEmptySpeechMarks,
  calculateDiscriminationPercent,
} from './audiometry-constants';
import { WordListType } from './speech-word-lists';
import { buildEarSummaries, presentedWordsOf } from './audiometry-report-data';
import {
  AudiometryFormState,
  hasAudiometryData,
  payloadToState,
  resolveListTypeFromPresentedWords,
  stateToPayload,
} from './audiometry-payload-mapper';

export const NEW_ENTRY_OPTION_VALUE = 'new';

/** Datos del paciente y de la clínica que el informe impreso muestra en su encabezado. */
export interface PrintReportHeader {
  clinicName: string;
  clinicLogoUrl: string | null;
  patientName: string;
  patientDocumentId: string;
  patientAge: number | null;
  patientBirthDate: string;
}

const buildEmptyFormState = (): AudiometryFormState => ({
  marks: buildEmptyMarks(),
  weber: buildDefaultWeber(),
  speechMarks: buildEmptySpeechMarks(),
  speechFieldValues: buildEmptySpeechFieldValues(),
  failedWords: buildEmptyFailedWordsValues(),
  wordListType: null,
  wordListId: null,
  presentedWords: PRESENTED_WORDS_BY_LIST_TYPE[DEFAULT_PRESENTED_WORDS_TYPE],
  ptaType: DEFAULT_PTA_TYPE,
  gradingScale: DEFAULT_GRADING_SCALE,
  notes: buildEmptyAudiometryNotes(),
});

const SPEECH_FIELD_INPUT_PATTERN = /^-?\d{0,3}$/;
const FAILED_WORDS_INPUT_PATTERN = /^\d{1,3}$/;

const isFailedWordsInRange = (text: string, presented: number): boolean =>
  FAILED_WORDS_INPUT_PATTERN.test(text) &&
  Number(text) >= SPEECH_FAILED_WORDS_MIN &&
  Number(text) <= presented;

/** Acepta el texto parcial que se va escribiendo ("", "-", "-1") siempre que no se salga del rango. */
const isSpeechFieldInputValid = (field: SpeechField, text: string): boolean => {
  if (text === '') return true;
  const { min, max } = SPEECH_FIELD_RANGES[field];
  if (!SPEECH_FIELD_INPUT_PATTERN.test(text) || (text.startsWith('-') && min >= 0)) return false;
  if (text === '-') return true;
  const value = Number(text);
  return value >= min && value <= max;
};

/** Estado de la audiometría del paciente: una nueva editable o una guardada en solo lectura. */
export function useAudiometryPoc(patientUuid: string) {
  const queryClient = useQueryClient();
  const resolveAuthorLabel = useResolveAuthorLabel();
  const entriesQuery = useAudiometryEntriesQuery(patientUuid);
  // undefined: el usuario aún no eligió; se abre la más reciente si hay historial.
  const [chosenEntryUuid, setChosenEntryUuid] = useState<string | null | undefined>(undefined);
  // La recién guardada: mientras siga seleccionada se muestra la franja de confirmación.
  const [savedEntryUuid, setSavedEntryUuid] = useState<string | null>(null);
  const accordionRef = useRef<HTMLDivElement>(null);
  const [formVersion, setFormVersion] = useState(0);

  const [marks, setMarks] = useState<AudiogramMarks>(buildEmptyMarks);
  const [speechMarks, setSpeechMarks] = useState<SpeechMarks>(buildEmptySpeechMarks);
  const [speechFieldValues, setSpeechFieldValues] = useState<SpeechFieldValues>(
    buildEmptySpeechFieldValues,
  );
  const [failedWords, setFailedWords] = useState<FailedWordsValues>(buildEmptyFailedWordsValues);
  const [weber, setWeber] = useState<Record<number, WeberResult>>(buildDefaultWeber);
  const [ptaType, setPtaType] = useState<PtaType>(DEFAULT_PTA_TYPE);
  const [gradingScale, setGradingScale] = useState<GradingScale>(DEFAULT_GRADING_SCALE);
  const [activeTool, setActiveTool] = useState<AudiometryTool>(AudiometryTool.AIR);
  const [isMasked, setIsMasked] = useState(false);
  const [hasNoResponse, setHasNoResponse] = useState(false);
  const [speechEar, setSpeechEar] = useState<Ear>(Ear.RIGHT);
  const [isExpanded, setIsExpanded] = useState(true);
  const [wordListType, setWordListType] = useState<WordListType | null>(null);
  const [wordListId, setWordListId] = useState<string | null>(null);
  // No se borra al ocultar el panel: define cuántas palabras se presentaron por oído.
  const [lastWordListType, setLastWordListType] = useState<WordListType | null>(null);
  const [notes, setNotes] = useState<AudiometryNotes>(buildEmptyAudiometryNotes);

  const presentedWords = presentedWordsOf(lastWordListType);

  const canMask = MASKABLE_TOOLS.includes(activeTool);

  const entries = entriesQuery.data ?? [];
  const selectedEntryUuid =
    chosenEntryUuid === undefined ? (entries[0]?.uuid ?? null) : chosenEntryUuid;
  const isReadOnly = selectedEntryUuid !== null;
  const entryQuery = useAudiometryEntryQuery(patientUuid, selectedEntryUuid);
  const loadedEntry = entryQuery.data;

  const applyFormState = useCallback((state: AudiometryFormState) => {
    setMarks(state.marks);
    setWeber(state.weber);
    setSpeechMarks(state.speechMarks);
    setSpeechFieldValues(state.speechFieldValues);
    setFailedWords(state.failedWords);
    setWordListType(state.wordListType);
    setWordListId(state.wordListId);
    setLastWordListType(
      resolveListTypeFromPresentedWords(state.wordListType, state.presentedWords),
    );
    setPtaType(state.ptaType);
    setGradingScale(state.gradingScale);
    setNotes(state.notes);
    // El formulario de notas guarda su propio estado: se remonta para mostrar lo cargado.
    setFormVersion((current) => current + 1);
  }, []);

  useEffect(() => {
    if (loadedEntry) applyFormState(payloadToState(loadedEntry.payload));
  }, [loadedEntry, applyFormState]);

  const handleSelectEntry = (value: string) => {
    setSavedEntryUuid(null);
    if (value !== NEW_ENTRY_OPTION_VALUE) {
      setChosenEntryUuid(value);
      return;
    }
    setChosenEntryUuid(null);
    applyFormState(buildEmptyFormState());
  };

  const handlePlaceMark = (ear: Ear, frequencyHz: number, thresholdDb: number) => {
    setMarks((current) => ({
      ...current,
      [activeTool]: {
        ...current[activeTool],
        [ear]: {
          ...current[activeTool][ear],
          [frequencyHz]: {
            thresholdDb,
            isMasked: canMask && isMasked,
            hasNoResponse,
          },
        },
      },
    }));
  };

  const handleRemoveMark = (ear: Ear, tool: AudiometryTool, frequencyHz: number) => {
    setMarks((current) => {
      const { [frequencyHz]: _removed, ...rest } = current[tool][ear];
      return { ...current, [tool]: { ...current[tool], [ear]: rest } };
    });
  };

  const handleClearAudiogram = () => setMarks(buildEmptyMarks());

  const handlePlaceSpeech = (ear: Ear, intensityDb: number, percent: number) => {
    setSpeechMarks((current) => ({
      ...current,
      [ear]: { ...current[ear], [intensityDb]: percent },
    }));
  };

  const handleRemoveSpeech = (ear: Ear, intensityDb: number) => {
    setSpeechMarks((current) => {
      const { [intensityDb]: _removed, ...rest } = current[ear];
      return { ...current, [ear]: rest };
    });
  };

  const handleClearSpeech = () => setSpeechMarks(buildEmptySpeechMarks());

  const handleSpeechFieldChange = (ear: Ear, field: SpeechField, text: string) => {
    if (!isSpeechFieldInputValid(field, text)) return;
    setSpeechFieldValues((current) => ({ ...current, [ear]: { ...current[ear], [field]: text } }));
  };

  const handleFailedWordsChange = (ear: Ear, text: string) => {
    if (text !== '' && !isFailedWordsInRange(text, presentedWords)) return;
    setFailedWords((current) => ({ ...current, [ear]: text }));
    if (text === '') return;
    const percent = String(calculateDiscriminationPercent(presentedWords, Number(text)));
    setSpeechFieldValues((current) => ({
      ...current,
      [ear]: { ...current[ear], [SpeechField.MAX_DISCRIMINATION]: percent },
    }));
  };

  const handleWordListTypeChange = (type: WordListType) => {
    const presented = PRESENTED_WORDS_BY_LIST_TYPE[type];
    setWordListType(type);
    setLastWordListType(type);
    setWordListId(null);
    // Con una lista de menos palabras, las falladas no pueden quedar por encima del nuevo tope.
    const nextFailedWords = { ...failedWords };
    EARS.forEach((ear) => {
      if (/^\d+$/.test(failedWords[ear]) && Number(failedWords[ear]) > presented) {
        nextFailedWords[ear] = String(presented);
      }
    });
    setFailedWords(nextFailedWords);
    setSpeechFieldValues((current) => {
      const next = { ...current };
      EARS.forEach((ear) => {
        const text = nextFailedWords[ear];
        if (text === '' || !isFailedWordsInRange(text, presented)) return;
        next[ear] = {
          ...current[ear],
          [SpeechField.MAX_DISCRIMINATION]: String(
            calculateDiscriminationPercent(presented, Number(text)),
          ),
        };
      });
      return next;
    });
  };

  const handleHideWordList = () => {
    setWordListType(null);
    setWordListId(null);
  };

  const handleWeberChange = (frequencyHz: number, result: WeberResult) =>
    setWeber((current) => ({ ...current, [frequencyHz]: result }));

  const handleToggleExpanded = () => setIsExpanded((current) => !current);
  const handleToggleMasked = () => setIsMasked((current) => !current);
  const handleToggleNoResponse = () => setHasNoResponse((current) => !current);

  const summaries = useMemo(
    () => buildEarSummaries(marks, ptaType, gradingScale),
    [marks, ptaType, gradingScale],
  );

  const { executeCreateEntry, isPending: isSaving } = useCreateAudiometryEntryMutation({
    onCreated: (entry) => {
      // Se siembra el detalle para no volver a pedir lo que se acaba de guardar.
      queryClient.setQueryData([FETCH_AUDIOMETRY_ENTRY_KEY, patientUuid, entry.uuid], entry);
      setChosenEntryUuid(entry.uuid);
      setSavedEntryUuid(entry.uuid);
    },
  });

  // Tras guardar el formulario pasa a solo lectura y la página queda lejos del encabezado.
  useEffect(() => {
    if (!savedEntryUuid) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    accordionRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  }, [savedEntryUuid]);

  const formState: AudiometryFormState = {
    marks,
    weber,
    speechMarks,
    speechFieldValues,
    failedWords,
    wordListType,
    wordListId,
    presentedWords,
    ptaType,
    gradingScale,
    notes,
  };
  const canSave = !isReadOnly && !isSaving && hasAudiometryData(formState);

  const handleSave = () => {
    if (!canSave) return;
    executeCreateEntry({ patientUuid, payload: stateToPayload(formState, summaries) });
  };

  const entryOptions = entries.map((entry) => ({
    value: entry.uuid,
    label: formatDateTime(entry.createdAt),
  }));
  const selectedEntry = entries.find((entry) => entry.uuid === selectedEntryUuid);
  const selectedEntryAuthor = selectedEntry
    ? resolveAuthorLabel(selectedEntry.createdByUuid ?? '', selectedEntry.createdByName)
    : null;

  // Ya viene en caché desde el detalle del paciente y la sesión; solo alimentan el informe impreso.
  const { data: patient } = usePatientQuery(patientUuid);
  const { tenant } = useSession();
  const printReportHeader: PrintReportHeader = {
    clinicName: tenant?.businessName ?? '',
    clinicLogoUrl: tenant?.logoUrl ?? null,
    patientName: patient ? `${patient.firstName} ${patient.lastName}`.trim() : '',
    patientDocumentId: patient?.documentId ?? '',
    patientAge: calculateAge(patient?.birthDate),
    patientBirthDate: formatCalendarDate(patient?.birthDate),
  };
  const { t } = useTranslation();
  const handlePrint = () =>
    printWithFileName(
      buildPrintFileName({
        type: t(TEXT.PATIENTS.CLINICAL_SUMMARY.FILE_TYPE.AUDIOMETRY),
        clinic: printReportHeader.clinicName,
        patient: printReportHeader.patientName,
        documentId: printReportHeader.patientDocumentId,
      }),
    );

  return {
    accordionRef,
    isJustSaved: savedEntryUuid !== null && savedEntryUuid === selectedEntryUuid,
    isReadOnly,
    printReportHeader,
    handlePrint,
    isSaving,
    canSave,
    handleSave,
    formVersion,
    entryOptions,
    selectedEntryValue: selectedEntryUuid ?? NEW_ENTRY_OPTION_VALUE,
    selectedEntry,
    selectedEntryAuthor,
    handleSelectEntry,
    isLoadingEntry: entriesQuery.isLoading || (isReadOnly && entryQuery.isLoading),
    isExpanded,
    marks,
    speechMarks,
    weber,
    speechFieldValues,
    failedWords,
    presentedWords,
    handleFailedWordsChange,
    wordListType,
    wordListId,
    setWordListId,
    handleWordListTypeChange,
    handleHideWordList,
    notes,
    setNotes,
    activeTool,
    isMasked,
    canMask,
    hasNoResponse,
    speechEar,
    summaries,
    ptaType,
    setPtaType,
    gradingScale,
    setGradingScale,
    setActiveTool,
    setSpeechEar,
    handleToggleExpanded,
    handleToggleMasked,
    handleToggleNoResponse,
    handlePlaceMark,
    handleRemoveMark,
    handleClearAudiogram,
    handlePlaceSpeech,
    handleRemoveSpeech,
    handleClearSpeech,
    handleWeberChange,
    handleSpeechFieldChange,
  };
}
