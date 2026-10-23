/** Tipos de pregunta que usa la historia clínica. Mismos valores que el API. */
export enum ClinicalFieldType {
  /** Sí / No; con `detailLabel` pide además un texto cuando es Sí. */
  BOOLEAN = 'boolean',
  TEXT = 'text',
  TEXTAREA = 'textarea',
}

export interface ClinicalField {
  id: string;
  label: string;
  fieldType: ClinicalFieldType;
  required: boolean;
  order: number;
  /** Grupo en que se muestra (p. ej. "Cirugías"); sin grupo va suelto. */
  section?: string;
  detailLabel?: string;
}

export interface ClinicalTemplate {
  uuid: string;
  name: string;
  speciality: string;
  fields: ClinicalField[];
}

export type SaveClinicalTemplatePayload = Pick<ClinicalTemplate, 'name' | 'speciality' | 'fields'>;

/** La plantilla con las preguntas de la historia clínica de la clínica. */
export const CLINICAL_HISTORY_SPECIALITY = 'CLINICAL_HISTORY';

export type ClinicalAnswer = boolean | string | { value: boolean; detail?: string | null };

export const CLINICAL_FIELD_LABEL_MAX_LENGTH = 120;
export const CLINICAL_SECTION_MAX_LENGTH = 60;
export const CLINICAL_TEMPLATE_MAX_FIELDS = 100;
