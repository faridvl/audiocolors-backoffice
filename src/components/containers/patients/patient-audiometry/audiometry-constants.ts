import { WordListType } from './speech-word-lists';

export enum Ear {
  RIGHT = 'RIGHT',
  LEFT = 'LEFT',
}

export const EARS: Ear[] = [Ear.RIGHT, Ear.LEFT];

/** Qué se marca en el audiograma. */
export enum AudiometryTool {
  AIR = 'AIR',
  BONE = 'BONE',
  /** Umbral de molestia (UCL/LDL). */
  UCL = 'UCL',
  /** Nivel de confort (MCL). */
  MCL = 'MCL',
  FREE_FIELD = 'FREE_FIELD',
}

export const AUDIOMETRY_TOOLS: AudiometryTool[] = [
  AudiometryTool.AIR,
  AudiometryTool.BONE,
  AudiometryTool.UCL,
  AudiometryTool.MCL,
  AudiometryTool.FREE_FIELD,
];

/** Herramientas que admiten la versión enmascarada del símbolo. */
export const MASKABLE_TOOLS: AudiometryTool[] = [AudiometryTool.AIR, AudiometryTool.BONE];

export enum WeberResult {
  CENTER = 'CENTER',
  RIGHT = 'RIGHT',
  LEFT = 'LEFT',
}

export const WEBER_RESULTS: WeberResult[] = [
  WeberResult.CENTER,
  WeberResult.RIGHT,
  WeberResult.LEFT,
];

export const WEBER_FREQUENCIES_HZ: number[] = [500, 1000, 2000, 4000];

// ---------------------------------------------------------------------------
// Audiograma: ejes y bandas
// ---------------------------------------------------------------------------

/** Frecuencias principales (una por octava) y las intermedias, de menor a mayor. */
export const MAIN_FREQUENCIES_HZ: number[] = [125, 250, 500, 1000, 2000, 4000, 8000];
export const INTERMEDIATE_FREQUENCIES_HZ: number[] = [1500, 3000, 6000];
export const ALL_FREQUENCIES_HZ: number[] = [...MAIN_FREQUENCIES_HZ, ...INTERMEDIATE_FREQUENCIES_HZ]
  .slice()
  .sort((first, second) => first - second);

export const MIN_FREQUENCY_HZ = MAIN_FREQUENCIES_HZ[0];
export const MAX_FREQUENCY_HZ = MAIN_FREQUENCIES_HZ[MAIN_FREQUENCIES_HZ.length - 1];

export const MIN_DB_HL = -10;
export const MAX_DB_HL = 120;

export const AUDIOMETRY_NOTES_MAX_LENGTH = 1000;

export interface AudiometryNotes {
  diagnosis: string;
  observations: string;
}

export const buildEmptyAudiometryNotes = (): AudiometryNotes => ({
  diagnosis: '',
  observations: '',
});
export const DB_GRID_STEP = 10;
export const DB_SNAP_STEP = 5;
/** Línea gruesa: el límite entre audición normal y pérdida leve. */
export const THICK_DB_LINE = 20;

export enum PtaType {
  PTA_512 = 'PTA_512',
  PTA_5124 = 'PTA_5124',
  PTA_124 = 'PTA_124',
  PTA_251 = 'PTA_251',
}

export const PTA_TYPES: PtaType[] = [
  PtaType.PTA_512,
  PtaType.PTA_5124,
  PtaType.PTA_124,
  PtaType.PTA_251,
];
export const DEFAULT_PTA_TYPE = PtaType.PTA_512;
/** Frecuencias (Hz) de vía aérea que promedia cada tipo de PTA. */
export const PTA_FREQUENCIES_HZ: Record<PtaType, number[]> = {
  [PtaType.PTA_512]: [500, 1000, 2000],
  [PtaType.PTA_5124]: [500, 1000, 2000, 4000],
  [PtaType.PTA_124]: [1000, 2000, 4000],
  [PtaType.PTA_251]: [250, 500, 1000],
};

/** El PTA se reporta en pasos de 5 dB, como el audiómetro. */
export const PTA_ROUNDING_STEP_DB = 5;

export enum HearingGrade {
  NORMAL = 'NORMAL',
  SLIGHT = 'SLIGHT',
  MILD = 'MILD',
  MODERATE = 'MODERATE',
  MODERATELY_SEVERE = 'MODERATELY_SEVERE',
  SEVERE = 'SEVERE',
  PROFOUND = 'PROFOUND',
  TOTAL_LOSS = 'TOTAL_LOSS',
}

export interface HearingBand {
  grade: HearingGrade;
  fromDb: number;
  toDb: number;
  /** Si es false, el nombre del grado no se dibuja junto a los audiogramas. */
  showLabel: boolean;
  /** Si es true, el grado no tiene techo: se muestra como "desde X dB o más". */
  isOpenEnded?: boolean;
}

/** Como `toDb` es inclusivo, cada banda (menos la primera) empieza un dB por encima del límite anterior. */
export const BAND_LOWER_BOUND_OFFSET_DB = 1;

export enum GradingScale {
  ASHA = 'ASHA',
  BIAP = 'BIAP',
}

export const GRADING_SCALES: GradingScale[] = [GradingScale.ASHA, GradingScale.BIAP];
export const DEFAULT_GRADING_SCALE = GradingScale.ASHA;

export interface GradingScaleConfig {
  bands: HearingBand[];
  /** Tipo de PTA con el que se clasifica el grado de pérdida. */
  ptaType: PtaType;
}

/** ASHA (Clark, 1981): `toDb` es inclusivo, así que un umbral en el borde cae en la banda de abajo. */
const ASHA_BANDS: HearingBand[] = [
  { grade: HearingGrade.NORMAL, fromDb: -10, toDb: 15, showLabel: true },
  { grade: HearingGrade.SLIGHT, fromDb: 15, toDb: 25, showLabel: false },
  { grade: HearingGrade.MILD, fromDb: 25, toDb: 40, showLabel: true },
  { grade: HearingGrade.MODERATE, fromDb: 40, toDb: 55, showLabel: true },
  { grade: HearingGrade.MODERATELY_SEVERE, fromDb: 55, toDb: 70, showLabel: true },
  { grade: HearingGrade.SEVERE, fromDb: 70, toDb: 90, showLabel: true },
  { grade: HearingGrade.PROFOUND, fromDb: 90, toDb: 120, showLabel: true },
];

/**
 * BIAP, recomendación 02/1 (1996), solo grados principales. La cofosis (120 dB o más) queda como
 * una franja de 1 dB al pie del audiograma, que llega hasta MAX_DB_HL.
 */
const BIAP_BANDS: HearingBand[] = [
  { grade: HearingGrade.NORMAL, fromDb: -10, toDb: 20, showLabel: true },
  { grade: HearingGrade.MILD, fromDb: 20, toDb: 40, showLabel: true },
  { grade: HearingGrade.MODERATE, fromDb: 40, toDb: 70, showLabel: true },
  { grade: HearingGrade.SEVERE, fromDb: 70, toDb: 90, showLabel: true },
  { grade: HearingGrade.PROFOUND, fromDb: 90, toDb: 119, showLabel: true },
  { grade: HearingGrade.TOTAL_LOSS, fromDb: 119, toDb: 120, showLabel: true, isOpenEnded: true },
];

export const GRADING_SCALE_CONFIG: Record<GradingScale, GradingScaleConfig> = {
  [GradingScale.ASHA]: { bands: ASHA_BANDS, ptaType: PtaType.PTA_512 },
  [GradingScale.BIAP]: { bands: BIAP_BANDS, ptaType: PtaType.PTA_5124 },
};

/** Dimensiones del audiograma en unidades del viewBox del SVG. */
export const AUDIOGRAM_LAYOUT = {
  plotWidth: 280,
  plotHeight: 234,
  marginLeft: 34,
  marginTop: 32,
  marginBottom: 8,
  // Media etiqueta "8000" centrada en el borde derecho del gráfico.
  marginRight: 16,
};

// ---------------------------------------------------------------------------
// Símbolos
// ---------------------------------------------------------------------------

export enum SymbolShape {
  CIRCLE = 'CIRCLE',
  CROSS = 'CROSS',
  TRIANGLE = 'TRIANGLE',
  SQUARE = 'SQUARE',
  ANGLE_LEFT = 'ANGLE_LEFT',
  ANGLE_RIGHT = 'ANGLE_RIGHT',
  BRACKET_LEFT = 'BRACKET_LEFT',
  BRACKET_RIGHT = 'BRACKET_RIGHT',
  LETTER_U = 'LETTER_U',
  LETTER_M = 'LETTER_M',
  LETTER_S = 'LETTER_S',
}

/** Letra que se dibuja para las formas que son una letra. */
export const SYMBOL_LETTERS: Partial<Record<SymbolShape, string>> = {
  [SymbolShape.LETTER_U]: 'U',
  [SymbolShape.LETTER_M]: 'M',
  [SymbolShape.LETTER_S]: 'S',
};

export enum ConnectorStyle {
  NONE = 'NONE',
  SOLID = 'SOLID',
  DOTTED = 'DOTTED',
}

export interface EarSymbol {
  unmasked: SymbolShape;
  masked: SymbolShape;
  /** Desplazamiento horizontal respecto a la línea de la frecuencia (unidades del viewBox). */
  offsetX: number;
}

export interface ToolSymbols {
  symbols: Record<Ear, EarSymbol>;
  connector: ConnectorStyle;
}

const BONE_OFFSET = 7;

/** Catálogo de símbolos por herramienta, oído y si va enmascarado (ASHA 1990 + extensión). */
export const SYMBOL_CATALOG: Record<AudiometryTool, ToolSymbols> = {
  [AudiometryTool.AIR]: {
    connector: ConnectorStyle.SOLID,
    symbols: {
      [Ear.RIGHT]: {
        unmasked: SymbolShape.CIRCLE,
        masked: SymbolShape.TRIANGLE,
        offsetX: 0,
      },
      [Ear.LEFT]: {
        unmasked: SymbolShape.CROSS,
        masked: SymbolShape.SQUARE,
        offsetX: 0,
      },
    },
  },
  [AudiometryTool.BONE]: {
    connector: ConnectorStyle.DOTTED,
    symbols: {
      [Ear.RIGHT]: {
        unmasked: SymbolShape.ANGLE_LEFT,
        masked: SymbolShape.BRACKET_LEFT,
        offsetX: -BONE_OFFSET,
      },
      [Ear.LEFT]: {
        unmasked: SymbolShape.ANGLE_RIGHT,
        masked: SymbolShape.BRACKET_RIGHT,
        offsetX: BONE_OFFSET,
      },
    },
  },
  [AudiometryTool.UCL]: {
    connector: ConnectorStyle.DOTTED,
    symbols: {
      [Ear.RIGHT]: {
        unmasked: SymbolShape.LETTER_U,
        masked: SymbolShape.LETTER_U,
        offsetX: 0,
      },
      [Ear.LEFT]: {
        unmasked: SymbolShape.LETTER_U,
        masked: SymbolShape.LETTER_U,
        offsetX: 0,
      },
    },
  },
  [AudiometryTool.MCL]: {
    connector: ConnectorStyle.DOTTED,
    symbols: {
      [Ear.RIGHT]: {
        unmasked: SymbolShape.LETTER_M,
        masked: SymbolShape.LETTER_M,
        offsetX: 0,
      },
      [Ear.LEFT]: {
        unmasked: SymbolShape.LETTER_M,
        masked: SymbolShape.LETTER_M,
        offsetX: 0,
      },
    },
  },
  [AudiometryTool.FREE_FIELD]: {
    connector: ConnectorStyle.NONE,
    symbols: {
      [Ear.RIGHT]: {
        unmasked: SymbolShape.LETTER_S,
        masked: SymbolShape.LETTER_S,
        offsetX: 0,
      },
      [Ear.LEFT]: {
        unmasked: SymbolShape.LETTER_S,
        masked: SymbolShape.LETTER_S,
        offsetX: 0,
      },
    },
  },
};

export const CONNECTOR_DASH_ARRAYS: Record<ConnectorStyle, string | undefined> = {
  [ConnectorStyle.NONE]: undefined,
  [ConnectorStyle.SOLID]: undefined,
  [ConnectorStyle.DOTTED]: '2 3',
};

export const SYMBOL_RADIUS = 5.5;
export const SYMBOL_STROKE_WIDTH = 1.6;
export const NO_RESPONSE_ARROW_LENGTH = 9;
export const NO_RESPONSE_ARROW_HEAD = 3;
/** Distancia (unidades del viewBox) a la que un clic cuenta como "sobre el punto". */
export const POINT_HIT_RADIUS = 10;
export const SYMBOL_FONT_SIZE = 11;

// ---------------------------------------------------------------------------
// Logoaudiometría
// ---------------------------------------------------------------------------

export const SPEECH_MIN_DB = 0;
export const SPEECH_MAX_DB = 100;
export const SPEECH_DB_STEP = 5;
export const SPEECH_MIN_PERCENT = 0;
export const SPEECH_MAX_PERCENT = 100;
export const SPEECH_PERCENT_GRID_STEP = 10;
export const SPEECH_PERCENT_SNAP_STEP = 5;

/** Campos de logoaudiometría que la audióloga escribe a mano, uno por oído. */
export enum SpeechField {
  THRESHOLD = 'THRESHOLD',
  MAX_DISCRIMINATION = 'MAX_DISCRIMINATION',
}

export const SPEECH_FIELDS: SpeechField[] = [SpeechField.THRESHOLD, SpeechField.MAX_DISCRIMINATION];

export const SPEECH_FIELD_RANGES: Record<SpeechField, { min: number; max: number }> = {
  [SpeechField.THRESHOLD]: { min: -10, max: 120 },
  [SpeechField.MAX_DISCRIMINATION]: { min: SPEECH_MIN_PERCENT, max: SPEECH_MAX_PERCENT },
};

export const SPEECH_FAILED_WORDS_MIN = 0;

/** Palabras que se leen por oído; en Tato solo se muestran (y se leen) las primeras de cada lista. */
export const TATO_DISPLAYED_WORDS = 10;
export const ROSENBLUT_PRESENTED_WORDS = 25;
export const DEFAULT_PRESENTED_WORDS_TYPE = WordListType.MONOSYLLABLE;

export const PRESENTED_WORDS_BY_LIST_TYPE: Record<WordListType, number> = {
  [WordListType.BISYLLABLE]: TATO_DISPLAYED_WORDS,
  [WordListType.MONOSYLLABLE]: ROSENBLUT_PRESENTED_WORDS,
};

/** Porcentaje de discriminación entero: (presentadas - falladas) / presentadas. */
export const calculateDiscriminationPercent = (presented: number, failed: number): number =>
  Math.round(((presented - failed) / presented) * SPEECH_MAX_PERCENT);

export type FailedWordsValues = Record<Ear, string>;

export const buildEmptyFailedWordsValues = (): FailedWordsValues => ({
  [Ear.RIGHT]: '',
  [Ear.LEFT]: '',
});

export type SpeechFieldValues = Record<Ear, Record<SpeechField, string>>;

export const buildEmptySpeechFieldValues = (): SpeechFieldValues => ({
  [Ear.RIGHT]: { [SpeechField.THRESHOLD]: '', [SpeechField.MAX_DISCRIMINATION]: '' },
  [Ear.LEFT]: { [SpeechField.THRESHOLD]: '', [SpeechField.MAX_DISCRIMINATION]: '' },
});

/**
 * Nodos de la curva normal de discriminación (dB, %): la curva suave pasa por ellos y es casi
 * vertical entre 50 y 90 %.
 */
export const NORMAL_SPEECH_CURVE_POINTS: ReadonlyArray<readonly [number, number]> = [
  [2, 0],
  [4, 3],
  [6, 7],
  [7.5, 10],
  [9, 15],
  [10, 20],
  [11, 31],
  [12, 42],
  [12.5, 50],
  [13, 70],
  [13.5, 90],
  [15, 97],
  [17, 100],
];
export const NORMAL_SPEECH_CURVE_SAMPLE_STEP_DB = 0.25;

/** Franja de pérdida para la palabra: ocupa la fila entre el 50 % y el 60 %. */
export const SPEECH_LOSS_BAND_BOTTOM_PERCENT = 50;
export const SPEECH_LOSS_BAND_TOP_PERCENT = 60;
export const SPEECH_AXIS_SYMBOL_PERCENT = '%';
export const SPEECH_AXIS_SYMBOL_DB = 'dB';

export const SPEECH_LAYOUT = {
  plotWidth: 360,
  plotHeight: 200,
  marginLeft: 46,
  marginTop: 28,
  marginBottom: 30,
  marginRight: 34,
};

// ---------------------------------------------------------------------------
// Datos de ejemplo
// ---------------------------------------------------------------------------

export interface AudiometryPoint {
  thresholdDb: number;
  isMasked: boolean;
  hasNoResponse: boolean;
}

/** Un punto por frecuencia (Hz). */
export type FrequencyPoints = Partial<Record<number, AudiometryPoint>>;
export type AudiogramMarks = Record<AudiometryTool, Record<Ear, FrequencyPoints>>;

/** Un punto por intensidad (dB): el porcentaje de discriminación. */
export type SpeechPoints = Partial<Record<number, number>>;
export type SpeechMarks = Record<Ear, SpeechPoints>;

const point = (
  thresholdDb: number,
  flags: Partial<Omit<AudiometryPoint, 'thresholdDb'>> = {},
): AudiometryPoint => ({
  thresholdDb,
  isMasked: flags.isMasked ?? false,
  hasNoResponse: flags.hasNoResponse ?? false,
});

export const buildEmptyMarks = (): AudiogramMarks => ({
  [AudiometryTool.AIR]: { [Ear.RIGHT]: {}, [Ear.LEFT]: {} },
  [AudiometryTool.BONE]: { [Ear.RIGHT]: {}, [Ear.LEFT]: {} },
  [AudiometryTool.UCL]: { [Ear.RIGHT]: {}, [Ear.LEFT]: {} },
  [AudiometryTool.MCL]: { [Ear.RIGHT]: {}, [Ear.LEFT]: {} },
  [AudiometryTool.FREE_FIELD]: { [Ear.RIGHT]: {}, [Ear.LEFT]: {} },
});

export const buildEmptySpeechMarks = (): SpeechMarks => ({
  [Ear.RIGHT]: {},
  [Ear.LEFT]: {},
});

/** Pérdida leve a moderada, descendente, con ejemplos de cada tipo de símbolo. */
export const buildSampleMarks = (): AudiogramMarks => ({
  [AudiometryTool.AIR]: {
    [Ear.RIGHT]: {
      125: point(20),
      250: point(20),
      500: point(25),
      1000: point(30),
      2000: point(35),
      3000: point(40),
      4000: point(45),
      6000: point(50),
      8000: point(55),
    },
    [Ear.LEFT]: {
      125: point(25),
      250: point(25),
      500: point(30),
      1000: point(35),
      2000: point(45),
      3000: point(50, { isMasked: true }),
      4000: point(55),
      6000: point(60),
      8000: point(90, { hasNoResponse: true }),
    },
  },
  [AudiometryTool.BONE]: {
    [Ear.RIGHT]: {
      500: point(20),
      1000: point(25),
      2000: point(30, { isMasked: true }),
      4000: point(35),
    },
    [Ear.LEFT]: {
      500: point(25),
      1000: point(30),
      2000: point(40),
      4000: point(45),
    },
  },
  [AudiometryTool.UCL]: {
    [Ear.RIGHT]: { 500: point(95), 1000: point(100), 2000: point(100) },
    [Ear.LEFT]: { 500: point(95), 1000: point(100), 2000: point(105) },
  },
  [AudiometryTool.MCL]: {
    [Ear.RIGHT]: { 500: point(55), 1000: point(60) },
    [Ear.LEFT]: { 500: point(60), 1000: point(65) },
  },
  [AudiometryTool.FREE_FIELD]: { [Ear.RIGHT]: {}, [Ear.LEFT]: {} },
});

export const buildSampleSpeechMarks = (): SpeechMarks => ({
  [Ear.RIGHT]: { 20: 10, 30: 40, 40: 70, 50: 90, 60: 96, 70: 96 },
  [Ear.LEFT]: { 25: 10, 35: 30, 45: 60, 55: 88, 65: 92 },
});

export const buildDefaultWeber = (): Record<number, WeberResult> =>
  Object.fromEntries(WEBER_FREQUENCIES_HZ.map((frequency) => [frequency, WeberResult.CENTER]));
