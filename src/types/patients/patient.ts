export enum PatientGender {
  MALE = 'male',
  FEMALE = 'female',
}

export const GENDER_LABELS: Record<PatientGender, string> = {
  [PatientGender.MALE]: 'Masculino',
  [PatientGender.FEMALE]: 'Femenino',
};

/**
 * Estado del paciente para la clínica. No confundir con `isActive`, que es el
 * borrado lógico ("registro eliminado") y no se puede revertir.
 */
export enum PatientStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DECEASED = 'DECEASED',
}

export const PATIENT_STATUS_LABELS: Record<PatientStatus, string> = {
  [PatientStatus.ACTIVE]: 'Activo',
  [PatientStatus.INACTIVE]: 'Inactivo',
  [PatientStatus.DECEASED]: 'Fallecido',
};

export enum DocumentType {
  NATIONAL = 'national',
  DIMEX = 'dimex',
  PASSPORT = 'passport',
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  [DocumentType.NATIONAL]: 'Cédula nacional',
  [DocumentType.DIMEX]: 'DIMEX',
  [DocumentType.PASSPORT]: 'Pasaporte',
};

export const MAINTENANCE_NUMBERS = [1, 2, 3, 4] as const;
export type MaintenanceNumber = (typeof MAINTENANCE_NUMBERS)[number];

/** Largo máximo de una nota de mantenimiento (el API la rechaza si lo pasa). */
export const MAINTENANCE_NOTE_MAX_LENGTH = 500;

/** Cómo quedó un mantenimiento; el API siempre devuelve uno de los tres. */
export enum MaintenanceStatus {
  UNMARKED = 'UNMARKED',
  ATTENDED = 'ATTENDED',
  MISSED = 'MISSED',
}

type MaintenanceStatusField =
  'maintenance1Status' | 'maintenance2Status' | 'maintenance3Status' | 'maintenance4Status';

export const MAINTENANCE_STATUS_FIELDS: Record<MaintenanceNumber, MaintenanceStatusField> = {
  1: 'maintenance1Status',
  2: 'maintenance2Status',
  3: 'maintenance3Status',
  4: 'maintenance4Status',
};

/** Si el campo falta (API viejo o expediente sin cargar), cuenta como sin marcar. */
export function getMaintenanceStatus(
  patient: Patient,
  maintenanceNumber: MaintenanceNumber,
): MaintenanceStatus {
  return patient[MAINTENANCE_STATUS_FIELDS[maintenanceNumber]] ?? MaintenanceStatus.UNMARKED;
}

export interface Patient {
  uuid: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  /** Indicadores (ver `PatientFlag`): desde cuándo (ISO) están prendidos, null si no. */
  hearingAidsInLabSince?: string | null;
  warrantyActiveSince?: string | null;
  videoCandidateSince?: string | null;
  /** Estado de los mantenimientos 1 a 4 (sus notas se piden aparte, ver `PatientMaintenance`). */
  maintenance1Status?: MaintenanceStatus;
  maintenance2Status?: MaintenanceStatus;
  maintenance3Status?: MaintenanceStatus;
  maintenance4Status?: MaintenanceStatus;
  warrantyExpiredSince?: string | null;
  renewPrescriptionSince?: string | null;
  prioritySince?: string | null;
  /** Por qué se marcó la prioridad; el API lo exige al marcarla. */
  priorityReason?: string | null;
  /** Quién la marcó; puede faltar si esa persona ya no existe. */
  priorityByName?: string | null;
  /** Documento (categoría WARRANTY) elegido como el de la garantía. */
  warrantyDocumentUuid?: string | null;
  birthDate?: string | null;
  email?: string;
  gender?: string;
  documentId?: string;
  /** Sede principal: la primera de `branchUuids`. */
  branchUuid?: string | null;
  /** Todas las sedes del paciente, la principal primero; un API viejo no la manda. */
  branchUuids?: string[];
  isActive: boolean;
  /** Estado para la clínica. Los pacientes previos al campo llegan como ACTIVE. */
  status?: PatientStatus;
  /** Motivo libre al pasar a inactivo o fallecido. */
  statusReason?: string | null;
  /** Fecha de fallecimiento (ISO), si se conoce. */
  statusDate?: string | null;
  createdAt: string;
  updatedAt?: string;
  /** Fecha ISO de la próxima cita CONFIRMED, o null si no tiene ninguna. */
  nextAppointmentAt?: string | null;
  /** Nombre del tipo de la próxima cita CONFIRMED (Cita, Control, Mantenimiento). */
  nextAppointmentType?: string | null;
  /** Sede de la próxima cita CONFIRMED, aunque el paciente ya no la tenga. */
  nextAppointmentBranchUuid?: string | null;
  /**
   * Mes tentativo de la próxima cita ("YYYY-MM"), cuando la clínica anotó el
   * mes pero el paciente todavía no confirmó el día. Excluyente con
   * `nextAppointmentAt`: confirmar un día lo limpia, y anotar un mes cancela
   * la cita que hubiera.
   */
  tentativeAppointmentMonth?: string | null;
  /** UUID del tipo anotado junto al mes tentativo, para precargarlo al confirmar. */
  tentativeAppointmentTypeUuid?: string | null;
  /** Nombre de ese tipo (Cita, Control, Mantenimiento), listo para mostrar. */
  tentativeAppointmentTypeName?: string | null;
}

/** Sedes del paciente, con la principal primero; un paciente de un API viejo solo trae `branchUuid`. */
export function getPatientBranchUuids(
  patient: Pick<Patient, 'branchUuid' | 'branchUuids'>,
): string[] {
  if (patient.branchUuids?.length) return patient.branchUuids;
  return patient.branchUuid ? [patient.branchUuid] : [];
}

/** La sede preferida si el paciente la tiene; si no, su principal. */
export function pickPatientBranchUuid(
  patient: Pick<Patient, 'branchUuid' | 'branchUuids'>,
  preferredBranchUuid?: string | null,
): string | undefined {
  const branchUuids = getPatientBranchUuids(patient);
  if (preferredBranchUuid && branchUuids.includes(preferredBranchUuid)) return preferredBranchUuid;
  return branchUuids[0];
}

export interface CreatePatientContactPayload {
  name: string;
  phone: string;
}

export interface CreatePatientPayload {
  firstName: string;
  lastName: string;
  phone?: string;
  birthDate?: string;
  address?: string;
  email?: string;
  gender?: string;
  documentId?: string;
  /** La primera es la principal; el API acepta omitirla o mandar `[]`. */
  branchUuids?: string[];
  contacts?: CreatePatientContactPayload[];
}

export type UpdatePatientPayload = Partial<CreatePatientPayload> & {
  /** null lo limpia. */
  warrantyDocumentUuid?: string | null;
};

/** Indicadores que se prenden y apagan desde el expediente. El valor es la clave del API. */
/** Máximo de caracteres del motivo de prioridad (lo mismo que valida el API). */
export const PATIENT_PRIORITY_REASON_MAX_LENGTH = 500;

/** Código con el que el API avisa que el paciente ya estaba marcado como prioridad. */
export const PATIENT_ALREADY_PRIORITY_ERROR_CODE = 'PATIENT_ALREADY_PRIORITY';

export enum PatientFlag {
  HEARING_AIDS_IN_LAB = 'hearingAidsInLab',
  ACTIVE_WARRANTY = 'hasActiveWarranty',
  VIDEO_CANDIDATE = 'isVideoCandidate',
  WARRANTY_EXPIRED = 'warrantyExpired',
  RENEW_PRESCRIPTION = 'renewPrescription',
  PRIORITY = 'isPriority',
}

/** Campo del paciente que guarda desde cuándo está prendido cada indicador. */
export const PATIENT_FLAG_SINCE_FIELDS: Record<
  PatientFlag,
  | 'hearingAidsInLabSince'
  | 'warrantyActiveSince'
  | 'videoCandidateSince'
  | 'warrantyExpiredSince'
  | 'renewPrescriptionSince'
  | 'prioritySince'
> = {
  [PatientFlag.HEARING_AIDS_IN_LAB]: 'hearingAidsInLabSince',
  [PatientFlag.ACTIVE_WARRANTY]: 'warrantyActiveSince',
  [PatientFlag.VIDEO_CANDIDATE]: 'videoCandidateSince',
  [PatientFlag.WARRANTY_EXPIRED]: 'warrantyExpiredSince',
  [PatientFlag.RENEW_PRESCRIPTION]: 'renewPrescriptionSince',
  [PatientFlag.PRIORITY]: 'prioritySince',
};
