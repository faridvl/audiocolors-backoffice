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
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
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
}

export type UpdatePatientPayload = Partial<CreatePatientPayload>;
