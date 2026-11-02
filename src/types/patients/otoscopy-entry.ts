export interface OtoscopyEntry {
  uuid: string;
  patientUuid: string;
  otoscopyRight: string | null;
  otoscopyLeft: string | null;
  createdAt: string;
  createdByUuid: string | null;
  createdByName: string | null;
  /** Cuándo se corrigió; null si nunca. */
  updatedAt: string | null;
  updatedByUuid: string | null;
  updatedByName: string | null;
  /** Lo calcula el API (mismo día en hora de Costa Rica): el front no recalcula la fecha. */
  canEdit: boolean;
}

export interface OtoscopyEntryPayload {
  otoscopyRight: string | null;
  otoscopyLeft: string | null;
}

export const OTOSCOPY_TEXT_MAX_LENGTH = 1000;
