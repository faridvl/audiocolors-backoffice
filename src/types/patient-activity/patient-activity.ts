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
  DOCUMENT_CATEGORY_CHANGED = 'DOCUMENT_CATEGORY_CHANGED',
  DOCUMENT_DELETED = 'DOCUMENT_DELETED',
  APPOINTMENT_TENTATIVE = 'APPOINTMENT_TENTATIVE',
  APPOINTMENT_CONFIRMED = 'APPOINTMENT_CONFIRMED',
  /** Marcado desde la agenda: el paciente llegó (cita en sala). */
  APPOINTMENT_ARRIVED = 'APPOINTMENT_ARRIVED',
  /** Marcado desde la agenda: la cita se dio por atendida. */
  APPOINTMENT_COMPLETED = 'APPOINTMENT_COMPLETED',
  STATUS_CHANGED = 'STATUS_CHANGED',
  HEARING_AIDS_LAB_CHANGED = 'HEARING_AIDS_LAB_CHANGED',
  HEARING_AIDS_DELIVERED = 'HEARING_AIDS_DELIVERED',
  WARRANTY_CHANGED = 'WARRANTY_CHANGED',
  VIDEO_CANDIDATE_CHANGED = 'VIDEO_CANDIDATE_CHANGED',
  WARRANTY_EXPIRED_CHANGED = 'WARRANTY_EXPIRED_CHANGED',
  RENEW_PRESCRIPTION_CHANGED = 'RENEW_PRESCRIPTION_CHANGED',
  MAINTENANCE_CHANGED = 'MAINTENANCE_CHANGED',
  CONTACT_ATTEMPTS_CHANGED = 'CONTACT_ATTEMPTS_CHANGED',
  MAINTENANCE_CHECK_CHANGED = 'MAINTENANCE_CHECK_CHANGED',
  MAINTENANCE_NOTE_CHANGED = 'MAINTENANCE_NOTE_CHANGED',
  MAINTENANCE_NOTE_ADDED = 'MAINTENANCE_NOTE_ADDED',
  CLINICAL_HISTORY_CREATED = 'CLINICAL_HISTORY_CREATED',
  CLINICAL_HISTORY_UPDATED = 'CLINICAL_HISTORY_UPDATED',
  PHYSICAL_EXAM_UPDATED = 'PHYSICAL_EXAM_UPDATED',
  /** Se llenó una sección propia de Preguntas; el detalle trae solo el nombre, nunca las respuestas. */
  QUESTIONNAIRE_FILLED = 'QUESTIONNAIRE_FILLED',
  /** Se corrigió un registro de una sección propia el mismo día; el detalle trae solo el nombre. */
  QUESTIONNAIRE_CORRECTED = 'QUESTIONNAIRE_CORRECTED',
}

export const APPOINTMENT_ACTIONS = [
  PatientActivityAction.APPOINTMENT_TENTATIVE,
  PatientActivityAction.APPOINTMENT_CONFIRMED,
  PatientActivityAction.APPOINTMENT_ARRIVED,
  PatientActivityAction.APPOINTMENT_COMPLETED,
];

export interface PatientFieldChange {
  field: string;
  before: string | null;
  after: string | null;
}

/**
 * `detail` llega como JSON libre según la acción (ver ENDPOINTS.md del API).
 * Todas las claves son opcionales aquí: se lee lo que haya y lo que falte
 * queda en blanco.
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
  /** STATUS_CHANGED: motivo libre. */
  reason?: string | null;
  /** Indicadores (audífonos, garantía): true al prenderlo, false al apagarlo. */
  isOn?: boolean;
  /** Audífonos en laboratorio: día de envío (`date`) y el anterior si se corrigió (`previousDate`). */
  previousDate?: string;
  /** HEARING_AIDS_DELIVERED: true si la entrega trajo nota (el texto no se guarda en la bitácora). */
  hasNote?: boolean;
  /** Mantenimientos: cuál es (1 a 4). */
  number?: number;
  /** MAINTENANCE_CHECK_CHANGED: true al marcarlo, false al desmarcarlo. */
  done?: boolean;
  /** MAINTENANCE_CHANGED: cómo quedó, null = sin marcar. */
  status?: string | null;
  /** CONTACT_ATTEMPTS_CHANGED (registros viejos): intentos de contacto ahora y antes. */
  count?: number;
  previousCount?: number;
  /** QUESTIONNAIRE_FILLED y QUESTIONNAIRE_CORRECTED: la sección. */
  templateName?: string;
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
  branchUuid?: string;
  appointmentTypeUuid?: string;
}
