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
  /** Cuándo se corrigió; null si nunca. */
  updatedAt?: string | null;
  updatedByUuid?: string | null;
  updatedByName?: string | null;
  /** Lo calcula el API (mismo día en hora de Costa Rica): el front no recalcula la fecha. */
  canEdit: boolean;
}

export interface CreateQuestionnaireEntryPayload {
  templateUuid: string;
  answers: Record<string, ClinicalAnswer>;
}

export interface UpdateQuestionnaireEntryPayload {
  answers: Record<string, ClinicalAnswer>;
}
