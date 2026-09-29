import { DocumentCategory } from '@/types/documents/document.types';

/** Acciones de la bitácora. Mismo catálogo que el API (`PatientActivityAction`). */
export enum PatientActivityAction {
  PATIENT_CREATED = 'PATIENT_CREATED',
  PATIENT_UPDATED = 'PATIENT_UPDATED',
  CONTACT_ADDED = 'CONTACT_ADDED',
  CONTACT_UPDATED = 'CONTACT_UPDATED',
  CONTACT_REMOVED = 'CONTACT_REMOVED',
  NOTE_ADDED = 'NOTE_ADDED',
  DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED',
  DOCUMENT_RENAMED = 'DOCUMENT_RENAMED',
  DOCUMENT_DELETED = 'DOCUMENT_DELETED',
  APPOINTMENT_TENTATIVE = 'APPOINTMENT_TENTATIVE',
  APPOINTMENT_CONFIRMED = 'APPOINTMENT_CONFIRMED',
}

export const APPOINTMENT_ACTIONS = [
  PatientActivityAction.APPOINTMENT_TENTATIVE,
  PatientActivityAction.APPOINTMENT_CONFIRMED,
];

export interface PatientFieldChange {
  field: string;
  before: string | null;
  after: string | null;
}

/**
 * `detail` llega como JSON libre según la acción (ver ENDPOINTS.md del API).
 * Todas las claves son opcionales aquí: se lee lo que haya y lo que falte
 * se muestra como "—".
 */
export interface PatientActivityDetail {
  changes?: PatientFieldChange[];
  name?: string;
  phone?: string;
  before?: string | { name: string; phone: string };
  after?: string;
  category?: DocumentCategory;
  excerpt?: string;
  documentUuid?: string;
  originalName?: string;
  month?: string;
  date?: string;
  typeUuid?: string | null;
  typeName?: string | null;
  appointmentUuid?: string;
}

export interface PatientActivity {
  uuid: string;
  patientUuid: string;
  patientName: string;
  patientBranchUuid: string | null;
  actorUuid: string;
  actorName: string | null;
  action: PatientActivityAction;
  detail: PatientActivityDetail | null;
  createdAt: string;
}

export interface PatientActivityActor {
  uuid: string;
  fullName: string | null;
}

export interface PatientActivitySummary {
  total: number;
  byAction: Partial<Record<PatientActivityAction, number>>;
  byActor: { actorUuid: string; actorName: string | null; count: number }[];
}

export interface PatientActivityFilters {
  page: number;
  limit: number;
  search?: string;
  actorUuid?: string;
  actions?: PatientActivityAction[];
  from?: string;
  to?: string;
}
