import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useCreateAudiometryEntryMutation } from '@/shared/api/mutations/audiometry/create-audiometry-entry-mutation';
import { useInvalidateAudiometryEntryMutation } from '@/shared/api/mutations/audiometry/invalidate-audiometry-entry-mutation';
import {
  FETCH_AUDIOMETRY_ENTRY_KEY,
  useAudiometryEntriesQuery,
  useAudiometryTypesQuery,
  useAudiometryEntryQuery,
} from '@/shared/api/querys/patient-audiometry-entries-query';
import { useEquipmentQuery } from '@/shared/api/querys/equipment-query';
import { formatEquipmentName, getActiveEquipment } from '@/shared/utils/equipment';
import { usePatientQuery } from '@/shared/api/querys/get-patient-query';
import { calculateAge, formatCalendarDate, formatDateTime } from '@/shared/utils/formatters';
import { useResolveAuthorLabel } from '@/hooks/use-resolve-author-label';
import { usePermissions } from '@/hooks/use-permissions';
import { useSession } from '@/hooks/use-session';
import { Permission } from '@/shared/auth/permissions';
import { printWithFileName, waitForImages } from '@/shared/utils/print-document';
import { buildPrintFileName } from '@/shared/utils/print-file-name';
import { TEXT } from '@/static/texts/i18n';
import { AUDIOMETRY_ENTRY_QUERY_PARAM } from './audiometry-entry-link';
import {
  AudiogramMarks,
  AudiometryNotes,
  AudiometryTool,
  AudiometryTypeCode,
  DEFAULT_AUDIOMETRY_TYPE,
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
  ScreeningResult,
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
import { buildEntryDateLabels } from './audiometry-entry-date-labels';
import { SCREENING_RESULT_LABEL_KEYS, buildEntryWithPtaLabel } from './audiometry-labels';
import {
  AudiometryFormState,
  hasAudiometryData,
  payloadToState,
  resolveListTypeFromPresentedWords,
  screeningPayloadToState,
  screeningStateToPayload,
  stateToPayload,
} from './audiometry-payload-mapper';

const AUDIOMETRY_TEXT = TEXT.PATIENTS.DETAIL.AUDIOMETRY;

export const NEW_ENTRY_OPTION_VALUE = 'new';

/** Quién marcó la audiometría como mal hecha, cuándo y por qué. */
export interface AudiometryInvalidationNotice {
  author: string;
  date: string;
  reason: string;
}

/** Datos del paciente y de la clínica que el informe impreso muestra en su encabezado. */
export interface PrintReportHeader {
  clinicName: string;
  clinicLogoUrl: string | null;
  patientName: string;
  patientDocumentId: string;
  patientAge: number | null;
  patientBirthDate: string;
}

export const buildEmptyFormState = (): AudiometryFormState => ({
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
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const router = useRouter();
  const resolveAuthorLabel = useResolveAuthorLabel();
  const entriesQuery = useAudiometryEntriesQuery(patientUuid);
  const typesQuery = useAudiometryTypesQuery();
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [wordListType, setWordListType] = useState<WordListType | null>(null);
  const [wordListId, setWordListId] = useState<string | null>(null);
  // No se borra al ocultar el panel: define cuántas palabras se presentaron por oído.
  const [lastWordListType, setLastWordListType] = useState<WordListType | null>(null);
  const [notes, setNotes] = useState<AudiometryNotes>(buildEmptyAudiometryNotes);
  const [chosenType, setChosenType] = useState<AudiometryTypeCode>(DEFAULT_AUDIOMETRY_TYPE);
  const [screeningResult, setScreeningResult] = useState<ScreeningResult | null>(null);
  const [isResultMissing, setIsResultMissing] = useState(false);
  const [chosenEquipmentUuid, setChosenEquipmentUuid] = useState<string | null>(null);
  const [isEquipmentMissing, setIsEquipmentMissing] = useState(false);
  const equipmentQuery = useEquipmentQuery();
  const activeEquipment = getActiveEquipment(equipmentQuery.data);
  // Con un solo equipo activo no hay nada que elegir.
  const equipmentUuid =
    chosenEquipmentUuid ?? (activeEquipment.length === 1 ? activeEquipment[0].uuid : null);
  const equipmentOptions = activeEquipment.map((item) => ({
    value: item.uuid,
    label: formatEquipmentName(item),
  }));
  const handleEquipmentChange = (uuid: string) => {
    setChosenEquipmentUuid(uuid);
    setIsEquipmentMissing(false);
  };
  const [pendingType, setPendingType] = useState<AudiometryTypeCode | null>(null);

  const presentedWords = presentedWordsOf(lastWordListType);

  const entries = entriesQuery.data ?? [];
  const selectedEntryUuid =
    chosenEntryUuid === undefined ? (entries[0]?.uuid ?? null) : chosenEntryUuid;
  const { can } = usePermissions();
  // Verlas no exige Audiología; crear o invalidar sí.
  const canEdit = can(Permission.EDIT_AUDIOLOGY_TESTS);
  const isReadOnly = selectedEntryUuid !== null || !canEdit;
  const entryQuery = useAudiometryEntryQuery(patientUuid, selectedEntryUuid);
  const loadedEntry = entryQuery.data;
  const selectedEntry = entries.find((entry) => entry.uuid === selectedEntryUuid);
  // Guardada: manda el tipo de la audiometría; nueva: el que se eligió en el selector.
  const activeType = isReadOnly
    ? (loadedEntry?.typeCode ?? selectedEntry?.typeCode ?? DEFAULT_AUDIOMETRY_TYPE)
    : chosenType;
  const isScreening = activeType === AudiometryTypeCode.SCREENING;
  const canMask = !isScreening && MASKABLE_TOOLS.includes(activeTool);

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
    if (!loadedEntry) return;
    if (loadedEntry.typeCode === AudiometryTypeCode.SCREENING) {
      const state = screeningPayloadToState(loadedEntry.payload);
      applyFormState({
        ...buildEmptyFormState(),
        marks: state.marks,
        notes: state.notes,
      });
      setScreeningResult(state.result);
      return;
    }
    applyFormState(payloadToState(loadedEntry.payload));
  }, [loadedEntry, applyFormState]);

  const resetForm = (type: AudiometryTypeCode) => {
    setChosenType(type);
    applyFormState(buildEmptyFormState());
    setScreeningResult(null);
    setIsResultMissing(false);
    setActiveTool(AudiometryTool.AIR);
    setIsMasked(false);
    setHasNoResponse(false);
  };

  const handleSelectEntry = (value: string) => {
    setSavedEntryUuid(null);
    if (requestedEntryUuid) {
      // Sin esto el parámetro volvería a imponer la audiometría de la URL.
      const { [AUDIOMETRY_ENTRY_QUERY_PARAM]: _removed, ...restOfQuery } = router.query;
      lastOpenedUuidRef.current = null;
      void router.replace({ pathname: router.pathname, query: restOfQuery }, undefined, {
        shallow: true,
        scroll: false,
      });
    }
    if (value !== NEW_ENTRY_OPTION_VALUE) {
      setChosenEntryUuid(value);
      return;
    }
    setChosenEntryUuid(null);
    resetForm(DEFAULT_AUDIOMETRY_TYPE);
  };

  const handlePlaceMark = (ear: Ear, frequencyHz: number, thresholdDb: number) => {
    const tool = isScreening ? AudiometryTool.AIR : activeTool;
    setMarks((current) => ({
      ...current,
      [tool]: {
        ...current[tool],
        [ear]: {
          ...current[tool][ear],
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
    setSpeechFieldValues((current) => ({
      ...current,
      [ear]: { ...current[ear], [field]: text },
    }));
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

  const scrollToAccordion = useCallback(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    accordionRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  }, []);

  // Tras guardar el formulario pasa a solo lectura y la página queda lejos del encabezado.
  useEffect(() => {
    if (!savedEntryUuid) return;
    scrollToAccordion();
  }, [savedEntryUuid, scrollToAccordion]);

  // Un enlace (la nota de Evolución, una URL compartida) pide una audiometría por la URL.
  const requestedParam = router.query[AUDIOMETRY_ENTRY_QUERY_PARAM];
  const requestedEntryUuid = typeof requestedParam === 'string' ? requestedParam : null;
  const historyEntries = entriesQuery.data;

  const lastOpenedUuidRef = useRef<string | null>(null);

  const openEntryFromLink = useCallback(
    (entryUuid: string | null) => {
      // Un uuid que fuera del historial se ignora: queda la vista normal.
      if (!entryUuid || !historyEntries?.some((entry) => entry.uuid === entryUuid)) return;
      lastOpenedUuidRef.current = entryUuid;
      setSavedEntryUuid(null);
      setChosenEntryUuid(entryUuid);
      setIsExpanded(true);
      scrollToAccordion();
    },
    [historyEntries, scrollToAccordion],
  );

  // Al cargar o recargar con el parámetro; no se repite cuando el historial se refresca.
  useEffect(() => {
    if (requestedEntryUuid === lastOpenedUuidRef.current) return;
    openEntryFromLink(requestedEntryUuid);
  }, [requestedEntryUuid, openEntryFromLink]);

  // Tocar otra vez la misma nota no cambia la URL: el cambio de ruta la vuelve a abrir.
  useEffect(() => {
    const handleRouteChange = (url: string) =>
      openEntryFromLink(
        new URL(url, window.location.origin).searchParams.get(AUDIOMETRY_ENTRY_QUERY_PARAM),
      );
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => router.events.off('routeChangeComplete', handleRouteChange);
  }, [router.events, openEntryFromLink]);

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
  // El rastreo se puede intentar guardar sin marcas: lo que falta se avisa, es el resultado.
  const canSave = !isReadOnly && !isSaving && (isScreening || hasAudiometryData(formState));

  const hasDataToLose = isScreening
    ? screeningResult !== null ||
      notes.observations.trim() !== '' ||
      Object.values(marks[AudiometryTool.AIR]).some((points) => Object.keys(points).length > 0)
    : hasAudiometryData(formState);
  const handleTypeChange = (type: AudiometryTypeCode) => {
    if (type === activeType) return;
    if (hasDataToLose) {
      setPendingType(type);
      return;
    }
    resetForm(type);
  };
  const handleConfirmTypeChange = () => {
    if (pendingType) resetForm(pendingType);
    setPendingType(null);
  };
  const handleCancelTypeChange = () => setPendingType(null);
  const handleScreeningResultChange = (result: ScreeningResult) => {
    setScreeningResult(result);
    setIsResultMissing(false);
  };

  const [isInvalidateModalOpen, setIsInvalidateModalOpen] = useState(false);
  const { executeInvalidateEntry, isPending: isInvalidating } =
    useInvalidateAudiometryEntryMutation({
      onInvalidated: () => setIsInvalidateModalOpen(false),
    });
  const handleOpenInvalidateModal = () => setIsInvalidateModalOpen(true);
  const handleCloseInvalidateModal = () => {
    if (!isInvalidating) setIsInvalidateModalOpen(false);
  };
  const handleInvalidate = (reason: string) => {
    if (!canInvalidate || !selectedEntryUuid || isInvalidating) return;
    executeInvalidateEntry({
      patientUuid,
      entryUuid: selectedEntryUuid,
      reason,
    });
  };

  const handleSave = () => {
    if (!canSave) return;
    if (activeEquipment.length > 0 && !equipmentUuid) {
      setIsEquipmentMissing(true);
      return;
    }
    if (isScreening) {
      const screeningPayload = screeningStateToPayload({
        marks,
        result: screeningResult,
        notes,
      });
      if (!screeningPayload) {
        setIsResultMissing(true);
        return;
      }
      executeCreateEntry({
        patientUuid,
        typeCode: AudiometryTypeCode.SCREENING,
        payload: screeningPayload,
        equipmentUuid: equipmentUuid ?? undefined,
      });
      return;
    }
    executeCreateEntry({
      patientUuid,
      typeCode: AudiometryTypeCode.CLINICAL,
      payload: stateToPayload(formState, summaries),
      equipmentUuid: equipmentUuid ?? undefined,
    });
  };

  const entryLabels = buildEntryDateLabels(entries, formatDateTime, buildEntryWithPtaLabel(t));
  const typeOptions = (typesQuery.data ?? []).map((type) => ({
    value: type.code,
    label: type.name,
  }));
  const buildEntryLabel = (entry: (typeof entries)[number]) => {
    const date = entryLabels.get(entry.uuid) ?? formatDateTime(entry.createdAt);
    if (entry.typeCode !== AudiometryTypeCode.SCREENING) {
      return t(AUDIOMETRY_TEXT.ENTRY_TYPED, { date, type: entry.typeName });
    }
    return t(AUDIOMETRY_TEXT.ENTRY_SCREENING, {
      date,
      type: entry.typeName,
      result: entry.screeningResult ? t(SCREENING_RESULT_LABEL_KEYS[entry.screeningResult]) : '',
    });
  };
  // Una lista vieja o en caché puede no traer la marca: `!= null` cubre null y undefined.
  const entryOptions = entries.map((entry) => ({
    value: entry.uuid,
    label: buildEntryLabel(entry),
    isMuted: entry.invalidatedAt != null,
    badge:
      entry.invalidatedAt != null ? t(TEXT.PATIENTS.DETAIL.AUDIOMETRY.INVALIDATE.TAG) : undefined,
  }));
  const invalidationNotice: AudiometryInvalidationNotice | null = selectedEntry?.invalidatedAt
    ? {
        author: resolveAuthorLabel(
          selectedEntry.invalidatedByUuid ?? '',
          selectedEntry.invalidatedByName,
        ),
        date: formatDateTime(selectedEntry.invalidatedAt),
        reason: selectedEntry.invalidationReason ?? '',
      }
    : null;
  // Solo se marca una audiometría guardada que aún no está marcada.
  const canInvalidate =
    canEdit && selectedEntry !== undefined && selectedEntry.invalidatedAt == null;
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
  const handlePrint = async () => {
    // El logo de la clínica debe estar cargado antes de abrir la impresión.
    await waitForImages(document);
    printWithFileName(
      buildPrintFileName({
        type: t(TEXT.PATIENTS.CLINICAL_SUMMARY.FILE_TYPE.AUDIOMETRY),
        clinic: printReportHeader.clinicName,
        patient: printReportHeader.patientName,
        documentId: printReportHeader.patientDocumentId,
      }),
    );
  };

  return {
    accordionRef,
    isJustSaved: savedEntryUuid !== null && savedEntryUuid === selectedEntryUuid,
    isReadOnly,
    activeType,
    typeOptions,
    isScreening,
    screeningResult,
    isResultMissing,
    equipmentOptions,
    equipmentUuid,
    isEquipmentMissing,
    handleEquipmentChange,
    handleScreeningResultChange,
    pendingType,
    handleTypeChange,
    handleConfirmTypeChange,
    handleCancelTypeChange,
    printReportHeader,
    handlePrint,
    isSaving,
    canSave,
    canEdit,
    handleSave,
    formVersion,
    entryOptions,
    selectedEntryValue: selectedEntryUuid ?? NEW_ENTRY_OPTION_VALUE,
    selectedEntry,
    selectedEntryAuthor,
    invalidationNotice,
    canInvalidate,
    isInvalidateModalOpen,
    isInvalidating,
    handleOpenInvalidateModal,
    handleCloseInvalidateModal,
    handleInvalidate,
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
