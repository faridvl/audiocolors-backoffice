import {
  AUDIOMETRY_TOOLS,
  AudiogramMarks,
  AudiometryTool,
  AudiometryNotes,
  AudiometryPoint,
  DEFAULT_PRESENTED_WORDS_TYPE,
  EARS,
  Ear,
  FailedWordsValues,
  GradingScale,
  MASKABLE_TOOLS,
  PRESENTED_WORDS_BY_LIST_TYPE,
  PtaType,
  SPEECH_FIELD_RANGES,
  ScreeningResult,
  SPEECH_FAILED_WORDS_MIN,
  SPEECH_FIELDS,
  SpeechField,
  SpeechFieldValues,
  SpeechMarks,
  WEBER_FREQUENCIES_HZ,
  WeberResult,
  buildEmptyWeber,
  buildEmptyFailedWordsValues,
  buildEmptyMarks,
  buildEmptySpeechFieldValues,
  buildEmptySpeechMarks,
} from './audiometry-constants';
import { EarSummary } from './audiometry-calculations';
import { WordListType } from './speech-word-lists';
import {
  AudiometryEarSummaryPayload,
  AudiometryPayload,
  AudiometryToneMarksPayload,
  ScreeningPayload,
} from './audiometry-payload';

/** Lo que se guarda de una audiometría: todo el estado menos lo transitorio de la pantalla. */
export interface AudiometryFormState {
  marks: AudiogramMarks;
  weber: Record<number, WeberResult>;
  speechMarks: SpeechMarks;
  speechFieldValues: SpeechFieldValues;
  failedWords: FailedWordsValues;
  wordListType: WordListType | null;
  wordListId: string | null;
  presentedWords: number;
  ptaType: PtaType;
  gradingScale: GradingScale;
  notes: AudiometryNotes;
}

/** Lo que se guarda de un rastreo; el resultado es null mientras no se elija. */
export interface ScreeningFormState {
  marks: AudiogramMarks;
  result: ScreeningResult | null;
  notes: AudiometryNotes;
}

const INTEGER_TEXT_PATTERN = /^-?\d+$/;

/** El resumen se edita como texto: "", "-" o un valor fuera de rango no son un dato guardable. */
const parseIntegerText = (text: string, min: number, max: number): number | null => {
  if (!INTEGER_TEXT_PATTERN.test(text)) return null;
  const value = Number(text);
  return value >= min && value <= max ? value : null;
};

/** Con una lista elegida las palabras presentadas son las de ese tipo; sin ella, las del estado. */
const resolvePresentedWords = (state: AudiometryFormState): number =>
  state.wordListType ? PRESENTED_WORDS_BY_LIST_TYPE[state.wordListType] : state.presentedWords;

const marksToPayload = (marks: AudiogramMarks): AudiometryToneMarksPayload => {
  const payload = buildEmptyMarks() as unknown as AudiometryToneMarksPayload;
  AUDIOMETRY_TOOLS.forEach((tool) => {
    EARS.forEach((ear) => {
      const points: Partial<Record<string, AudiometryPoint>> = {};
      Object.entries(marks[tool][ear]).forEach(([frequency, point]) => {
        if (!point) return;
        // El enmascarado solo existe en vía aérea y ósea.
        points[frequency] = {
          ...point,
          isMasked: point.isMasked && MASKABLE_TOOLS.includes(tool),
        };
      });
      payload[tool][ear] = points;
    });
  });
  return payload;
};

const marksFromPayload = (payload: AudiometryToneMarksPayload): AudiogramMarks => {
  const marks = buildEmptyMarks();
  AUDIOMETRY_TOOLS.forEach((tool) => {
    EARS.forEach((ear) => {
      Object.entries(payload[tool]?.[ear] ?? {}).forEach(([frequency, point]) => {
        if (point) marks[tool][ear][Number(frequency)] = { ...point } as AudiometryPoint;
      });
    });
  });
  return marks;
};

const speechMarksToPayload = (speechMarks: SpeechMarks): Record<Ear, Record<string, number>> => {
  const payload = {} as Record<Ear, Record<string, number>>;
  EARS.forEach((ear) => {
    payload[ear] = {};
    Object.entries(speechMarks[ear]).forEach(([intensity, percent]) => {
      if (percent !== undefined) payload[ear][intensity] = percent;
    });
  });
  return payload;
};

const speechMarksFromPayload = (payload: Record<Ear, Record<string, number>>): SpeechMarks => {
  const speechMarks = buildEmptySpeechMarks();
  EARS.forEach((ear) => {
    Object.entries(payload[ear] ?? {}).forEach(([intensity, percent]) => {
      speechMarks[ear][Number(intensity)] = percent;
    });
  });
  return speechMarks;
};

const buildEarSummaryPayload = (
  state: AudiometryFormState,
  ear: Ear,
  summary: EarSummary,
): AudiometryEarSummaryPayload => {
  const failedWords = parseIntegerText(
    state.failedWords[ear],
    SPEECH_FAILED_WORDS_MIN,
    resolvePresentedWords(state),
  );
  const speechField = (field: SpeechField) =>
    parseIntegerText(
      state.speechFieldValues[ear][field],
      SPEECH_FIELD_RANGES[field].min,
      SPEECH_FIELD_RANGES[field].max,
    );
  return {
    pta: summary.pta,
    grade: summary.grade,
    speechThresholdDb: speechField(SpeechField.THRESHOLD),
    maxDiscriminationPercent: speechField(SpeechField.MAX_DISCRIMINATION),
    failedWords,
  };
};

/** Estado de la pantalla -> cuerpo que valida el API. `summaries` son el PTA y el grado calculados. */
export function stateToPayload(
  state: AudiometryFormState,
  summaries: Record<Ear, EarSummary>,
): AudiometryPayload {
  const weber: AudiometryPayload['weber'] = {};
  WEBER_FREQUENCIES_HZ.forEach((frequency) => {
    const result = state.weber[frequency];
    if (result) weber[String(frequency)] = result;
  });

  return {
    marks: marksToPayload(state.marks),
    weber,
    speech: {
      marks: speechMarksToPayload(state.speechMarks),
      wordListType: state.wordListType,
      wordListId: state.wordListType ? state.wordListId : null,
      presentedWords: resolvePresentedWords(state),
    },
    summary: {
      ptaType: state.ptaType,
      gradingScale: state.gradingScale,
      ears: {
        [Ear.RIGHT]: buildEarSummaryPayload(state, Ear.RIGHT, summaries[Ear.RIGHT]),
        [Ear.LEFT]: buildEarSummaryPayload(state, Ear.LEFT, summaries[Ear.LEFT]),
      },
    },
    notes: {
      diagnosis: state.notes.diagnosis.trim(),
      observations: state.notes.observations.trim(),
    },
  };
}

const toText = (value: number | null): string => (value === null ? '' : String(value));

/** Cuerpo guardado -> estado de la pantalla. El PTA y el grado no se leen: se recalculan de las marcas. */
export function payloadToState(payload: AudiometryPayload): AudiometryFormState {
  const speechFieldValues = buildEmptySpeechFieldValues();
  const failedWords = buildEmptyFailedWordsValues();
  EARS.forEach((ear) => {
    const summary = payload.summary.ears[ear];
    speechFieldValues[ear][SpeechField.THRESHOLD] = toText(summary.speechThresholdDb);
    speechFieldValues[ear][SpeechField.MAX_DISCRIMINATION] = toText(
      summary.maxDiscriminationPercent,
    );
    failedWords[ear] = toText(summary.failedWords);
  });

  const weber = buildEmptyWeber();
  Object.entries(payload.weber).forEach(([frequency, result]) => {
    if (result) weber[Number(frequency)] = result;
  });

  return {
    marks: marksFromPayload(payload.marks),
    weber,
    speechMarks: speechMarksFromPayload(payload.speech.marks),
    speechFieldValues,
    failedWords,
    wordListType: payload.speech.wordListType,
    wordListId: payload.speech.wordListId,
    presentedWords: payload.speech.presentedWords,
    ptaType: payload.summary.ptaType,
    gradingScale: payload.summary.gradingScale,
    notes: { ...payload.notes },
  };
}

/** Tipo de lista que explica cuántas palabras se presentaron; sin él el hook usa el de por defecto. */
export function resolveListTypeFromPresentedWords(
  wordListType: WordListType | null,
  presentedWords: number,
): WordListType | null {
  if (wordListType) return wordListType;
  const types = Object.keys(PRESENTED_WORDS_BY_LIST_TYPE) as WordListType[];
  const match = types.find((type) => PRESENTED_WORDS_BY_LIST_TYPE[type] === presentedWords);
  return match && match !== DEFAULT_PRESENTED_WORDS_TYPE ? match : null;
}

/** Hay algo que guardar: una marca, un dato del resumen, una lista elegida o una nota. */
export function hasAudiometryData(state: AudiometryFormState): boolean {
  const hasToneMarks = AUDIOMETRY_TOOLS.some((tool) =>
    EARS.some((ear) => Object.keys(state.marks[tool][ear]).length > 0),
  );
  const hasSpeechMarks = EARS.some((ear) => Object.keys(state.speechMarks[ear]).length > 0);
  const hasSummaryData = EARS.some(
    (ear) =>
      state.failedWords[ear] !== '' ||
      SPEECH_FIELDS.some((field) => state.speechFieldValues[ear][field] !== ''),
  );
  const hasNotes = state.notes.diagnosis.trim() !== '' || state.notes.observations.trim() !== '';
  return (
    hasToneMarks || hasSpeechMarks || hasSummaryData || hasNotes || state.wordListType !== null
  );
}

/** Estado del rastreo -> cuerpo del API; null mientras falte el resultado, que es obligatorio. */
export function screeningStateToPayload(state: ScreeningFormState): ScreeningPayload | null {
  if (!state.result) return null;
  const airMarks = marksToPayload(state.marks)[AudiometryTool.AIR];
  const marks = {} as ScreeningPayload['marks'][AudiometryTool.AIR];
  EARS.forEach((ear) => {
    const points: Partial<Record<string, AudiometryPoint>> = {};
    Object.entries(airMarks[ear]).forEach(([frequency, point]) => {
      if (point) points[frequency] = { ...point, isMasked: false };
    });
    marks[ear] = points;
  });
  return {
    marks: { [AudiometryTool.AIR]: marks },
    result: state.result,
    notes: { observations: state.notes.observations.trim() },
  };
}

/** Cuerpo guardado de un rastreo -> estado de la pantalla. */
export function screeningPayloadToState(payload: ScreeningPayload): ScreeningFormState {
  return {
    marks: marksFromPayload(payload.marks as AudiometryToneMarksPayload),
    result: payload.result,
    notes: { diagnosis: '', observations: payload.notes.observations },
  };
}

/** Hay algo que guardar en el rastreo: el resultado es lo único obligatorio. */
export const hasScreeningResult = (state: ScreeningFormState): boolean => state.result !== null;
