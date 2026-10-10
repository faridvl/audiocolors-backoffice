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
  birthDate: string;
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
  birthDate: string;
  address?: string;
  email?: string;
  gender?: string;
  documentId?: string;
  branchUuid?: string | null;
  contacts?: CreatePatientContactPayload[];
}

export type UpdatePatientPayload = Partial<CreatePatientPayload>;

/** Indicadores que se prenden y apagan desde el expediente. El valor es la clave del API. */
export enum PatientFlag {
  HEARING_AIDS_IN_LAB = 'hearingAidsInLab',
  ACTIVE_WARRANTY = 'hasActiveWarranty',
  VIDEO_CANDIDATE = 'isVideoCandidate',
}

/** Campo del paciente que guarda desde cuándo está prendido cada indicador. */
export const PATIENT_FLAG_SINCE_FIELDS: Record<
  PatientFlag,
  'hearingAidsInLabSince' | 'warrantyActiveSince' | 'videoCandidateSince'
> = {
  [PatientFlag.HEARING_AIDS_IN_LAB]: 'hearingAidsInLabSince',
  [PatientFlag.ACTIVE_WARRANTY]: 'warrantyActiveSince',
  [PatientFlag.VIDEO_CANDIDATE]: 'videoCandidateSince',
};
