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

/** Cómo quedó un mantenimiento. Sin marcar es null en el API. */
export enum MaintenanceStatus {
  ATTENDED = 'ATTENDED',
  MISSED = 'MISSED',
}

/** Opciones que ve el personal por mantenimiento: las dos del API más "sin marcar". */
export enum MaintenanceChoice {
  UNMARKED = 'UNMARKED',
  ATTENDED = 'ATTENDED',
  MISSED = 'MISSED',
}

export const MAINTENANCE_NUMBERS = [1, 2, 3, 4] as const;
export type MaintenanceNumber = (typeof MAINTENANCE_NUMBERS)[number];

export const MAINTENANCE_STATUS_FIELDS: Record<
  MaintenanceNumber,
  'maintenance1Status' | 'maintenance2Status' | 'maintenance3Status' | 'maintenance4Status'
> = {
  1: 'maintenance1Status',
  2: 'maintenance2Status',
  3: 'maintenance3Status',
  4: 'maintenance4Status',
};

export function getMaintenanceChoice(
  patient: Patient,
  maintenanceNumber: MaintenanceNumber,
): MaintenanceChoice {
  const status = patient[MAINTENANCE_STATUS_FIELDS[maintenanceNumber]];
  return status ? MaintenanceChoice[status] : MaintenanceChoice.UNMARKED;
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
  /** Mantenimientos 1 a 4: marcados a mano; undefined (API viejo) o null es sin marcar. */
  maintenance1Status?: MaintenanceStatus | null;
  maintenance2Status?: MaintenanceStatus | null;
  maintenance3Status?: MaintenanceStatus | null;
  maintenance4Status?: MaintenanceStatus | null;
  warrantyExpiredSince?: string | null;
  renewPrescriptionSince?: string | null;
  /** Documento (categoría WARRANTY) elegido como el de la garantía. */
  warrantyDocumentUuid?: string | null;
  birthDate?: string | null;
  email?: string;
  gender?: string;
  documentId?: string;
  branchUuid?: string | null;
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
  branchUuid?: string | null;
  contacts?: CreatePatientContactPayload[];
}

export type UpdatePatientPayload = Partial<CreatePatientPayload> & {
  /** null lo limpia. */
  warrantyDocumentUuid?: string | null;
};

/** Indicadores que se prenden y apagan desde el expediente. El valor es la clave del API. */
export enum PatientFlag {
  HEARING_AIDS_IN_LAB = 'hearingAidsInLab',
  ACTIVE_WARRANTY = 'hasActiveWarranty',
  VIDEO_CANDIDATE = 'isVideoCandidate',
  WARRANTY_EXPIRED = 'warrantyExpired',
  RENEW_PRESCRIPTION = 'renewPrescription',
}

/** Campo del paciente que guarda desde cuándo está prendido cada indicador. */
export const PATIENT_FLAG_SINCE_FIELDS: Record<
  PatientFlag,
  | 'hearingAidsInLabSince'
  | 'warrantyActiveSince'
  | 'videoCandidateSince'
  | 'warrantyExpiredSince'
  | 'renewPrescriptionSince'
> = {
  [PatientFlag.HEARING_AIDS_IN_LAB]: 'hearingAidsInLabSince',
  [PatientFlag.ACTIVE_WARRANTY]: 'warrantyActiveSince',
  [PatientFlag.VIDEO_CANDIDATE]: 'videoCandidateSince',
  [PatientFlag.WARRANTY_EXPIRED]: 'warrantyExpiredSince',
  [PatientFlag.RENEW_PRESCRIPTION]: 'renewPrescriptionSince',
};
