export enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  DOCTOR = 'DOCTOR',
  STAFF = 'STAFF',
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
  avatarUrl?: string;
  phoneNumber?: string;
}

export interface SessionTenant {
  uuid: string;
  businessName: string;
  businessType?: string;
  logoUrl?: string;
}

export interface UserSessionResponse {
  user: SessionUser;
  tenant: SessionTenant;
}
