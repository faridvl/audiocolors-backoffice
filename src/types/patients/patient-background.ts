/** Antecedentes de la historia clínica: cada uno es Sí / No. Mismos nombres que el API. */
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

/** Grupos de la hoja en papel, en su orden. */
export enum BackgroundSection {
  INFECTIONS = 'infections',
  SURGERIES = 'surgeries',
  CONDITIONS = 'conditions',
  SYMPTOMS = 'symptoms',
}

interface BackgroundSectionConfig {
  section: BackgroundSection;
  /** Infecciones de oído va suelta en la hoja, sin título de grupo. */
  hasTitle: boolean;
  conditions: BackgroundCondition[];
}

export const BACKGROUND_SECTIONS: BackgroundSectionConfig[] = [
  {
    section: BackgroundSection.INFECTIONS,
    hasTitle: false,
    conditions: [BackgroundCondition.EAR_INFECTIONS],
  },
  {
    section: BackgroundSection.SURGERIES,
    hasTitle: true,
    conditions: [
      BackgroundCondition.NASAL_SURGERY,
      BackgroundCondition.THROAT_SURGERY,
      BackgroundCondition.EAR_SURGERY,
    ],
  },
  {
    section: BackgroundSection.CONDITIONS,
    hasTitle: true,
    conditions: [
      BackgroundCondition.DIABETES,
      BackgroundCondition.CHOLESTEROL,
      BackgroundCondition.HIGH_PRESSURE,
    ],
  },
  {
    section: BackgroundSection.SYMPTOMS,
    hasTitle: true,
    conditions: [
      BackgroundCondition.ALLERGIES,
      BackgroundCondition.RHINITIS,
      BackgroundCondition.VERTIGO,
      BackgroundCondition.DIZZINESS,
      BackgroundCondition.HEADACHE_NOISE,
      BackgroundCondition.CLOGGED_EAR,
      BackgroundCondition.TINNITUS,
    ],
  },
];

export type BackgroundConditions = Record<BackgroundCondition, boolean>;

export interface PatientBackgroundTexts {
  tinnitusTone: string | null;
  otoscopyRight: string | null;
  otoscopyLeft: string | null;
  notes: string | null;
}

export type SavePatientBackgroundPayload = BackgroundConditions & PatientBackgroundTexts;

export interface PatientBackground extends SavePatientBackgroundPayload {
  createdAt: string;
  updatedAt: string;
  createdByUuid: string | null;
  updatedByUuid: string | null;
}

export const BACKGROUND_TONE_MAX_LENGTH = 120;
export const BACKGROUND_OTOSCOPY_MAX_LENGTH = 1000;
