import { ClinicalAnswer, ClinicalField } from '@/types/clinical-templates/clinical-template';

/**
 * Antecedentes con columna propia en el API: los de la lista estándar. Una
 * historia sin `answers` (llenada antes de las preguntas configurables) se lee
 * de estas columnas. Los valores son a la vez el id de la pregunta estándar.
 */
export enum BackgroundCondition {
  EAR_INFECTIONS = 'earInfections',
  NASAL_SURGERY = 'nasalSurgery',
  THROAT_SURGERY = 'throatSurgery',
  EAR_SURGERY = 'earSurgery',
  DIABETES = 'diabetes',
  CHOLESTEROL = 'cholesterol',
  HIGH_PRESSURE = 'highPressure',
  ALLERGIES = 'allergies',
  RHINITIS = 'rhinitis',
  VERTIGO = 'vertigo',
  DIZZINESS = 'dizziness',
  HEADACHE_NOISE = 'headacheNoise',
  CLOGGED_EAR = 'cloggedEar',
  TINNITUS = 'tinnitus',
}

/** Textos con columna propia: también son id de pregunta estándar. */
export enum BackgroundText {
  OTOSCOPY_RIGHT = 'otoscopyRight',
  OTOSCOPY_LEFT = 'otoscopyLeft',
}

export type BackgroundConditions = Record<BackgroundCondition, boolean>;

export interface PatientBackgroundTexts {
  tinnitusTone: string | null;
  /** Legado: la otoscopia ahora es la exploración física, aparte de la historia. */
  otoscopyRight: string | null;
  otoscopyLeft: string | null;
  notes: string | null;
}

/** La otoscopia se manda tal como vino, solo para que un API anterior no la borre. */
export interface SavePatientBackgroundPayload
  extends
    BackgroundConditions,
    Omit<PatientBackgroundTexts, 'otoscopyRight' | 'otoscopyLeft'>,
    Partial<Pick<PatientBackgroundTexts, 'otoscopyRight' | 'otoscopyLeft'>> {
  answers: Record<string, ClinicalAnswer>;
  templateSnapshot: ClinicalField[];
}

export interface PatientBackground extends BackgroundConditions, PatientBackgroundTexts {
  answers: Record<string, ClinicalAnswer> | null;
  templateSnapshot: ClinicalField[] | null;
  createdAt: string;
  updatedAt: string;
  createdByUuid: string | null;
  updatedByUuid: string | null;
}

export const BACKGROUND_DETAIL_MAX_LENGTH = 120;
export const BACKGROUND_TEXT_MAX_LENGTH = 1000;
