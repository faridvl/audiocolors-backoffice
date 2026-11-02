import { ClinicalAnswer, ClinicalField } from '@/types/clinical-templates/clinical-template';

export interface QuestionnaireEntry {
  uuid: string;
  patientUuid: string;
  templateUuid: string;
  /** Las preguntas tal como estaban al llenar el registro. */
  templateSnapshot: { name: string; fields: ClinicalField[] };
  answers: Record<string, ClinicalAnswer>;
  createdAt: string;
  createdByUuid: string;
  createdByName?: string | null;
}

export interface CreateQuestionnaireEntryPayload {
  templateUuid: string;
  answers: Record<string, ClinicalAnswer>;
}
