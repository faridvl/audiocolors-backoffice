import { UserRole } from '../auth/auth';

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

/** Usuario de la clínica tal como lo devuelve `GET /users`. */
export interface ManagedUser {
  uuid: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  specialty: string | null;
  phoneNumber: string | null;
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
  specialty?: string;
  phoneNumber?: string;
}

export interface UpdateUserPayload {
  fullName?: string;
  phoneNumber?: string;
  specialty?: string;
  role?: UserRole;
}

/** El API pide todos los estados con `status=ALL`; el límite cubre cualquier clínica real. */
export const USERS_STATUS_FILTER_ALL = 'ALL';
export const USERS_PAGE_LIMIT = 200;

export const USER_FULL_NAME_MAX_LENGTH = 120;
export const USER_EMAIL_MAX_LENGTH = 160;
export const USER_SPECIALTY_MAX_LENGTH = 120;
export const USER_PASSWORD_MIN_LENGTH = 8;
export const USER_PASSWORD_MAX_LENGTH = 72;
export const USER_PASSWORD_UPPERCASE_PATTERN = /[A-Z]/;
export const USER_PASSWORD_DIGIT_PATTERN = /\d/;

export const ASSIGNABLE_USER_ROLES: UserRole[] = [
  UserRole.OWNER,
  UserRole.ADMIN,
  UserRole.DOCTOR,
  UserRole.STAFF,
];
