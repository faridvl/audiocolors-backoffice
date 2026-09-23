export enum PatientGender {
  MALE = 'male',
  FEMALE = 'female',
}

export const GENDER_LABELS: Record<PatientGender, string> = {
  [PatientGender.MALE]: 'Masculino',
  [PatientGender.FEMALE]: 'Femenino',
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
  birthDate: string;
  email?: string;
  gender?: string;
  documentId?: string;
  branchUuid?: string | null;
  isActive: boolean;
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
