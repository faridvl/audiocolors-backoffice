import {
  AudiogramMarks,
  AudiometryTool,
  Ear,
  HearingGrade,
  DEFAULT_GRADING_SCALE,
  DEFAULT_PTA_TYPE,
  GRADING_SCALE_CONFIG,
  GradingScale,
  PTA_FREQUENCIES_HZ,
  PTA_ROUNDING_STEP_DB,
  PtaType,
  SPEECH_MIN_DB,
  SPEECH_MIN_PERCENT,
  SpeechPoints,
} from './audiometry-constants';
import { findBand } from './audiometry-geometry';
import { SpeechCurvePoint, sampleMonotoneCurve } from './audiometry-curve';

export interface EarSummary {
  /** PTA de vía aérea del tipo elegido, en múltiplos de 5 dB; vacío si falta una frecuencia. */
  pta: number | null;
  grade: HearingGrade | null;
}

export function calculatePta(
  marks: AudiogramMarks,
  ear: Ear,
  ptaType: PtaType = DEFAULT_PTA_TYPE,
): number | null {
  const airPoints = marks[AudiometryTool.AIR][ear];
  const thresholds: number[] = [];
  for (const frequencyHz of PTA_FREQUENCIES_HZ[ptaType]) {
    const point = airPoints[frequencyHz];
    if (!point || point.hasNoResponse) return null;
    thresholds.push(point.thresholdDb);
  }
  const average = thresholds.reduce((sum, threshold) => sum + threshold, 0) / thresholds.length;
  return Math.round(average / PTA_ROUNDING_STEP_DB) * PTA_ROUNDING_STEP_DB;
}

const CURVE_SAMPLE_STEP_DB = 1;
const MIN_FOOT_RISE_DB = 10;
const MAX_FOOT_RISE_DB = 40;

function getSortedSpeechPoints(speechPoints: SpeechPoints): SpeechCurvePoint[] {
  return Object.keys(speechPoints)
    .map(Number)
    .sort((first, second) => first - second)
    .map((intensityDb) => ({
      intensityDb,
      percent: speechPoints[intensityDb] ?? 0,
    }));
}

/**
 * Pie de la "S": la curva de rendimiento-intensidad arranca en 0 %, así que si la primera
 * medición ya está arriba se agrega un punto en 0 % siguiendo la pendiente inicial.
 */
function addZeroFoot(points: SpeechCurvePoint[]): SpeechCurvePoint[] {
  const [first, second] = points;
  if (!first || !second || first.percent <= SPEECH_MIN_PERCENT) return points;
  const slope = (second.percent - first.percent) / (second.intensityDb - first.intensityDb);
  const rawRise = slope > 0 ? first.percent / slope : MAX_FOOT_RISE_DB;
  const rise = Math.min(MAX_FOOT_RISE_DB, Math.max(MIN_FOOT_RISE_DB, rawRise));
  const footDb = Math.max(SPEECH_MIN_DB, first.intensityDb - rise);
  if (footDb >= first.intensityDb) return points;
  return [{ intensityDb: footDb, percent: SPEECH_MIN_PERCENT }, ...points];
}

/** Curva suave de logoaudiometría de un oído; vacía si hay menos de dos mediciones. */
export function buildSpeechCurve(speechPoints: SpeechPoints): SpeechCurvePoint[] {
  const measured = getSortedSpeechPoints(speechPoints);
  if (measured.length < 2) return [];
  const nodes = addZeroFoot(measured);
  return sampleMonotoneCurve(nodes, CURVE_SAMPLE_STEP_DB);
}

export function buildEarSummary(
  marks: AudiogramMarks,
  ear: Ear,
  ptaType: PtaType = DEFAULT_PTA_TYPE,
  gradingScale: GradingScale = DEFAULT_GRADING_SCALE,
): EarSummary {
  const pta = calculatePta(marks, ear, ptaType);
  // El grado se clasifica con el PTA de su escala, sea cual sea el tipo mostrado.
  const gradePta = calculatePta(marks, ear, GRADING_SCALE_CONFIG[gradingScale].ptaType);
  return {
    pta,
    grade: gradePta === null ? null : findBand(gradePta, gradingScale).grade,
  };
}
