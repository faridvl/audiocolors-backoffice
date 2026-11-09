/** Nivel de acceso, acumulativo: Recepción < Administración < Propietario. */
export enum UserRole {
  RECEPTION = 'RECEPTION',
  ADMIN = 'ADMIN',
  OWNER = 'OWNER',
}

/** Catálogo fijo de la plataforma: se elige de una lista, sin texto libre. */
export enum ClinicalSpecialty {
  AUDIOLOGY = 'AUDIOLOGY',
  ENT = 'ENT',
  SPEECH_THERAPY = 'SPEECH_THERAPY',
  GENERAL_MEDICINE = 'GENERAL_MEDICINE',
}

export enum ProfessionalTitle {
  LIC = 'LIC',
  LICDA = 'LICDA',
  MSC = 'MSC',
  DR = 'DR',
  DRA = 'DRA',
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    name: string;
    email: string;
    tenantUuid: string;
  };
}

export interface SessionUser {
  uuid: string;
  fullName: string;
  email: string;
  role: UserRole;
  /** Única puerta al expediente clínico y a los archivos del paciente. */
  attendsPatients: boolean;
  specialties: ClinicalSpecialty[];
  professionalTitle: ProfessionalTitle | null;
  licenseNumber: string | null;
  avatarUrl?: string;
  phoneNumber?: string;
}

export interface SessionTenant {
  uuid: string;
  businessName: string;
  businessType?: string;
  logoUrl?: string | null;
}

export interface UserSessionResponse {
  user: SessionUser;
  tenant: SessionTenant;
}
