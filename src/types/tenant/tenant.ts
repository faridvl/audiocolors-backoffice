/** La clínica actual, tal como la devuelve identity en `/tenants/current`. */
export interface Tenant {
  businessName: string;
  logoUrl: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
}

/** Lo que se puede cambiar de la clínica; un texto vacío deja sin ese dato (el nombre no puede ir vacío). */
export type UpdateTenantPayload = Partial<Pick<Tenant, 'phone' | 'email' | 'address'>> & {
  name?: string;
};

export const TENANT_ADDRESS_MAX_LENGTH = 300;
export const TENANT_EMAIL_MAX_LENGTH = 254;

export const TENANT_NAME_MAX_LENGTH = 100;
export const TENANT_LOGO_MAX_BYTES = 2 * 1024 * 1024;
export const TENANT_LOGO_ACCEPTED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/svg+xml',
] as const;
