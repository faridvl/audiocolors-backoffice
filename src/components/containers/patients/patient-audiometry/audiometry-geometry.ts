import type React from 'react';
import {
  ALL_FREQUENCIES_HZ,
  AUDIOGRAM_LAYOUT,
  DB_SNAP_STEP,
  GRADING_SCALE_CONFIG,
  GradingScale,
  HearingBand,
  MAX_DB_HL,
  MAX_FREQUENCY_HZ,
  MIN_DB_HL,
  MIN_FREQUENCY_HZ,
  NORMAL_SPEECH_CURVE_POINTS,
  NORMAL_SPEECH_CURVE_SAMPLE_STEP_DB,
  SPEECH_DB_STEP,
  SPEECH_LAYOUT,
  SPEECH_MAX_DB,
  SPEECH_MAX_PERCENT,
  SPEECH_MIN_DB,
  SPEECH_MIN_PERCENT,
} from './audiometry-constants';
import { sampleMonotoneCurve } from './audiometry-curve';

export interface ViewBoxPoint {
  x: number;
  y: number;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const snapTo = (value: number, step: number): number => Math.round(value / step) * step;

/** Posición de un clic dentro del viewBox del SVG, sin importar a qué tamaño se dibuje. */
export function getViewBoxPoint(
  event: React.MouseEvent<SVGSVGElement>,
  viewBoxWidth: number,
  viewBoxHeight: number,
): ViewBoxPoint {
  const rect = event.currentTarget.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * viewBoxWidth,
    y: ((event.clientY - rect.top) / rect.height) * viewBoxHeight,
  };
}

export const getDistance = (first: ViewBoxPoint, second: ViewBoxPoint): number =>
  Math.hypot(first.x - second.x, first.y - second.y);

// --- Audiograma ---

const { plotWidth, plotHeight, marginLeft, marginTop, marginBottom, marginRight } =
  AUDIOGRAM_LAYOUT;

export const AUDIOGRAM_VIEW_WIDTH = marginLeft + plotWidth + marginRight;
export const AUDIOGRAM_VIEW_HEIGHT = marginTop + plotHeight + marginBottom;

const OCTAVES_SPAN = Math.log2(MAX_FREQUENCY_HZ / MIN_FREQUENCY_HZ);

/** Eje logarítmico: las octavas quedan equiespaciadas. */
export const getFrequencyX = (frequencyHz: number): number =>
  marginLeft + (Math.log2(frequencyHz / MIN_FREQUENCY_HZ) / OCTAVES_SPAN) * plotWidth;

export const getDbY = (db: number): number =>
  marginTop + ((db - MIN_DB_HL) / (MAX_DB_HL - MIN_DB_HL)) * plotHeight;

export const AUDIOGRAM_PLOT_RIGHT = marginLeft + plotWidth;
export const AUDIOGRAM_PLOT_BOTTOM = marginTop + plotHeight;

export const isInsideAudiogramPlot = ({ x, y }: ViewBoxPoint): boolean =>
  x >= marginLeft && x <= AUDIOGRAM_PLOT_RIGHT && y >= marginTop && y <= AUDIOGRAM_PLOT_BOTTOM;

/** Frecuencia más cercana al clic y dB ajustado al múltiplo de 5 más próximo. */
export function snapAudiogramPoint({ x, y }: ViewBoxPoint): {
  frequencyHz: number;
  thresholdDb: number;
} {
  const frequencyHz = ALL_FREQUENCIES_HZ.reduce((nearest, candidate) =>
    Math.abs(getFrequencyX(candidate) - x) < Math.abs(getFrequencyX(nearest) - x)
      ? candidate
      : nearest,
  );
  const rawDb = MIN_DB_HL + ((y - marginTop) / plotHeight) * (MAX_DB_HL - MIN_DB_HL);
  return {
    frequencyHz,
    thresholdDb: clamp(snapTo(rawDb, DB_SNAP_STEP), MIN_DB_HL, MAX_DB_HL),
  };
}

export const findBand = (db: number, gradingScale: GradingScale): HearingBand => {
  const { bands } = GRADING_SCALE_CONFIG[gradingScale];
  return bands.find((band) => db <= band.toDb) ?? bands[bands.length - 1];
};

// --- Logoaudiometría ---

export const SPEECH_VIEW_WIDTH =
  SPEECH_LAYOUT.marginLeft + SPEECH_LAYOUT.plotWidth + SPEECH_LAYOUT.marginRight;
export const SPEECH_VIEW_HEIGHT =
  SPEECH_LAYOUT.marginTop + SPEECH_LAYOUT.plotHeight + SPEECH_LAYOUT.marginBottom;
export const SPEECH_PLOT_RIGHT = SPEECH_LAYOUT.marginLeft + SPEECH_LAYOUT.plotWidth;
export const SPEECH_PLOT_BOTTOM = SPEECH_LAYOUT.marginTop + SPEECH_LAYOUT.plotHeight;

export const getSpeechX = (intensityDb: number): number =>
  SPEECH_LAYOUT.marginLeft +
  ((intensityDb - SPEECH_MIN_DB) / (SPEECH_MAX_DB - SPEECH_MIN_DB)) * SPEECH_LAYOUT.plotWidth;

/** El 100 % va arriba. */
export const getSpeechY = (percent: number): number =>
  SPEECH_LAYOUT.marginTop +
  (1 - (percent - SPEECH_MIN_PERCENT) / (SPEECH_MAX_PERCENT - SPEECH_MIN_PERCENT)) *
    SPEECH_LAYOUT.plotHeight;

export const isInsideSpeechPlot = ({ x, y }: ViewBoxPoint): boolean =>
  x >= SPEECH_LAYOUT.marginLeft &&
  x <= SPEECH_PLOT_RIGHT &&
  y >= SPEECH_LAYOUT.marginTop &&
  y <= SPEECH_PLOT_BOTTOM;

export function snapSpeechPoint(
  { x, y }: ViewBoxPoint,
  intensityStepDb: number,
  percentStep: number,
): { intensityDb: number; percent: number } {
  const rawDb =
    SPEECH_MIN_DB +
    ((x - SPEECH_LAYOUT.marginLeft) / SPEECH_LAYOUT.plotWidth) * (SPEECH_MAX_DB - SPEECH_MIN_DB);
  const rawPercent =
    SPEECH_MAX_PERCENT -
    ((y - SPEECH_LAYOUT.marginTop) / SPEECH_LAYOUT.plotHeight) *
      (SPEECH_MAX_PERCENT - SPEECH_MIN_PERCENT);
  return {
    intensityDb: clamp(snapTo(rawDb, intensityStepDb), SPEECH_MIN_DB, SPEECH_MAX_DB),
    percent: clamp(snapTo(rawPercent, percentStep), SPEECH_MIN_PERCENT, SPEECH_MAX_PERCENT),
  };
}

const NORMAL_SPEECH_CURVE = sampleMonotoneCurve(
  NORMAL_SPEECH_CURVE_POINTS.map(([intensityDb, percent]) => ({ intensityDb, percent })),
  NORMAL_SPEECH_CURVE_SAMPLE_STEP_DB,
);

/** Puntos (en unidades del viewBox) de la curva normal de discriminación, suavizada. */
export function buildNormalSpeechCurvePoints(): string {
  return NORMAL_SPEECH_CURVE.map(
    ({ intensityDb, percent }) => `${getSpeechX(intensityDb)},${getSpeechY(percent)}`,
  ).join(' ');
}

/** Intensidad (dB) donde la curva normal cruza el 50 %, interpolada entre sus muestras. */
export function getNormalSpeechHalfDb(): number {
  const half = (SPEECH_MIN_PERCENT + SPEECH_MAX_PERCENT) / 2;
  const index = NORMAL_SPEECH_CURVE.findIndex(({ percent }) => percent >= half);
  if (index <= 0) return NORMAL_SPEECH_CURVE[Math.max(index, 0)].intensityDb;
  const from = NORMAL_SPEECH_CURVE[index - 1];
  const to = NORMAL_SPEECH_CURVE[index];
  return (
    from.intensityDb +
    ((half - from.percent) / (to.percent - from.percent)) * (to.intensityDb - from.intensityDb)
  );
}

/** Casilla de la escala de pérdida (de 5 dB) donde cae el 0: la del cruce de la curva normal. */
export function getSpeechLossZeroCell(): number {
  return Math.floor(getNormalSpeechHalfDb() / SPEECH_DB_STEP);
}
