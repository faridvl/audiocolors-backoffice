import type { TFunction } from 'i18next';
import { TEXT } from '@/static/texts/i18n';
import {
  AudiometryTool,
  Ear,
  GradingScale,
  HearingGrade,
  PtaType,
  ScreeningResult,
  WeberResult,
} from './audiometry-constants';

const AUDIOMETRY_TEXT = TEXT.PATIENTS.DETAIL.AUDIOMETRY;

export const EAR_LABEL_KEYS: Record<Ear, string> = {
  [Ear.RIGHT]: AUDIOMETRY_TEXT.EARS.RIGHT,
  [Ear.LEFT]: AUDIOMETRY_TEXT.EARS.LEFT,
};

export const EAR_SHORT_LABEL_KEYS: Record<Ear, string> = {
  [Ear.RIGHT]: AUDIOMETRY_TEXT.EARS_SHORT.RIGHT,
  [Ear.LEFT]: AUDIOMETRY_TEXT.EARS_SHORT.LEFT,
};

export const TOOL_LABEL_KEYS: Record<AudiometryTool, string> = {
  [AudiometryTool.AIR]: AUDIOMETRY_TEXT.TOOLS.AIR,
  [AudiometryTool.BONE]: AUDIOMETRY_TEXT.TOOLS.BONE,
  [AudiometryTool.UCL]: AUDIOMETRY_TEXT.TOOLS.UCL,
  [AudiometryTool.MCL]: AUDIOMETRY_TEXT.TOOLS.MCL,
  [AudiometryTool.FREE_FIELD]: AUDIOMETRY_TEXT.TOOLS.FREE_FIELD,
};

export const GRADE_LABEL_KEYS: Record<HearingGrade, string> = {
  [HearingGrade.NORMAL]: AUDIOMETRY_TEXT.GRADES.NORMAL,
  [HearingGrade.SLIGHT]: AUDIOMETRY_TEXT.GRADES.SLIGHT,
  [HearingGrade.MILD]: AUDIOMETRY_TEXT.GRADES.MILD,
  [HearingGrade.MODERATE]: AUDIOMETRY_TEXT.GRADES.MODERATE,
  [HearingGrade.MODERATELY_SEVERE]: AUDIOMETRY_TEXT.GRADES.MODERATELY_SEVERE,
  [HearingGrade.SEVERE]: AUDIOMETRY_TEXT.GRADES.SEVERE,
  [HearingGrade.PROFOUND]: AUDIOMETRY_TEXT.GRADES.PROFOUND,
  [HearingGrade.TOTAL_LOSS]: AUDIOMETRY_TEXT.GRADES.TOTAL_LOSS,
};

/** Solo los grados cuyo nombre completo no cabe en la columna entre los audiogramas. */
export const GRADE_SHORT_LABEL_KEYS: Partial<Record<HearingGrade, string>> = {
  [HearingGrade.MODERATELY_SEVERE]: AUDIOMETRY_TEXT.GRADES_SHORT.MODERATELY_SEVERE,
};

export const GRADING_SCALE_LABEL_KEYS: Record<GradingScale, string> = {
  [GradingScale.ASHA]: AUDIOMETRY_TEXT.SUMMARY.GRADE_SCALE_ASHA,
  [GradingScale.BIAP]: AUDIOMETRY_TEXT.SUMMARY.GRADE_SCALE_BIAP,
};

/** Nota de fuente del popover de grados: cita la escala y el PTA con el que se calcula. */
export const GRADING_SCALE_SOURCE_KEYS: Record<GradingScale, string> = {
  [GradingScale.ASHA]: AUDIOMETRY_TEXT.SUMMARY.GRADE_INFO_SOURCE_ASHA,
  [GradingScale.BIAP]: AUDIOMETRY_TEXT.SUMMARY.GRADE_INFO_SOURCE_BIAP,
};

export const WEBER_LABEL_KEYS: Record<WeberResult, string> = {
  [WeberResult.CENTER]: AUDIOMETRY_TEXT.WEBER.CENTER,
  [WeberResult.RIGHT]: AUDIOMETRY_TEXT.WEBER.RIGHT,
  [WeberResult.LEFT]: AUDIOMETRY_TEXT.WEBER.LEFT,
};

export const PTA_TYPE_LABEL_KEYS: Record<PtaType, string> = {
  [PtaType.PTA_512]: AUDIOMETRY_TEXT.PTA_TYPES.PTA_512,
  [PtaType.PTA_5124]: AUDIOMETRY_TEXT.PTA_TYPES.PTA_5124,
  [PtaType.PTA_124]: AUDIOMETRY_TEXT.PTA_TYPES.PTA_124,
  [PtaType.PTA_251]: AUDIOMETRY_TEXT.PTA_TYPES.PTA_251,
};

export const SCREENING_RESULT_LABEL_KEYS: Record<ScreeningResult, string> = {
  [ScreeningResult.PASS]: AUDIOMETRY_TEXT.SCREENING.PASS,
  [ScreeningResult.REFER]: AUDIOMETRY_TEXT.SCREENING.REFER,
};

const MISSING_PTA_DASH = '–';

/** Fecha de la audiometría con el PTA de cada oído, para distinguir dos de la misma hora. */
export const buildEntryWithPtaLabel =
  (t: TFunction): ((date: string, ptaRight: number | null, ptaLeft: number | null) => string) =>
  (date, ptaRight, ptaLeft) =>
    t(AUDIOMETRY_TEXT.ENTRY_WITH_PTA, {
      date,
      right: ptaRight ?? MISSING_PTA_DASH,
      left: ptaLeft ?? MISSING_PTA_DASH,
    });
