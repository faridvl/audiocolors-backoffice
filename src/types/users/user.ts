import { ClinicalSpecialty, ProfessionalTitle, UserRole } from '../auth/auth';

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

/** Usuario de la clínica tal como lo devuelve `GET /users`. */
export interface ManagedUser {
  uuid: string;
  email: string;
  fullName: string;
  /** Un usuario viejo puede traer USER, MEDICO o vacío: por eso no es solo `UserRole`. */
  role: string | null;
  status: UserStatus;
  phoneNumber: string | null;
  attendsPatients: boolean;
  specialties: ClinicalSpecialty[];
  professionalTitle: ProfessionalTitle | null;
  licenseNumber: string | null;
  createdAt: string;
}

export interface PaginatedUsers {
  data: ManagedUser[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface CreateUserPayload {
  email: string;
  fullName: string;
  password: string;
  role: UserRole;
  phoneNumber?: string;
  attendsPatients?: boolean;
  specialties?: ClinicalSpecialty[];
}

export interface UpdateUserPayload {
  fullName?: string;
  phoneNumber?: string;
  role?: UserRole;
  attendsPatients?: boolean;
  specialties?: ClinicalSpecialty[];
  professionalTitle?: ProfessionalTitle;
  licenseNumber?: string;
}

/** El API pide todos los estados con `status=ALL`; el límite es el máximo que acepta el API. */
export const USERS_STATUS_FILTER_ALL = 'ALL';
export const USERS_PAGE_LIMIT = 100;

export const USER_FULL_NAME_MAX_LENGTH = 120;
export const USER_EMAIL_MAX_LENGTH = 160;
/** El API responde 400 con estos códigos al cambiar la propia contraseña. */
export const INVALID_CURRENT_PASSWORD_ERROR_CODE = 'INVALID_CURRENT_PASSWORD';
export const SAME_PASSWORD_ERROR_CODE = 'SAME_PASSWORD';
export const USER_PASSWORD_MIN_LENGTH = 8;
export const USER_PASSWORD_MAX_LENGTH = 72;
export const USER_PASSWORD_UPPERCASE_PATTERN = /[A-Z]/;
export const USER_PASSWORD_DIGIT_PATTERN = /\d/;

/** Niveles que asigna un ADMIN; el OWNER asigna además OWNER (el API manda `adminAssignableRoles`). */
export const ASSIGNABLE_USER_ROLES: UserRole[] = [UserRole.RECEPTION, UserRole.ADMIN];
export const OWNER_ASSIGNABLE_USER_ROLES: UserRole[] = [
  UserRole.RECEPTION,
  UserRole.ADMIN,
  UserRole.OWNER,
];

export const USER_LICENSE_NUMBER_MAX_LENGTH = 30;

/** Catálogos de `GET /users/catalogs`: solo códigos; los nombres salen de es.json. */
export interface UserCatalogs {
  roles: UserRole[];
  adminAssignableRoles: UserRole[];
  specialties: ClinicalSpecialty[];
  professionalTitles: ProfessionalTitle[];
}

export enum UserAuditField {
  ROLE = 'ROLE',
  ATTENDS_PATIENTS = 'ATTENDS_PATIENTS',
  SPECIALTIES = 'SPECIALTIES',
  PASSWORD = 'PASSWORD',
}

/** Una fila de `GET /users/audit`. */
export interface UserAuditEntry {
  uuid?: string;
  actorName: string;
  targetName: string;
  field: UserAuditField;
  before: string | null;
  after: string | null;
  createdAt: string;
}

export interface PaginatedUserAudit {
  data: UserAuditEntry[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}
