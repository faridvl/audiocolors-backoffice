/** La clínica actual, tal como la devuelve identity en `/tenants/current`. */
export interface Tenant {
  businessName: string;
  logoUrl: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
}

/** Lo que se puede cambiar de la clínica; un texto vacío la deja sin ese dato. */
export type UpdateTenantPayload = Partial<Pick<Tenant, 'phone' | 'email' | 'address'>>;

export const TENANT_ADDRESS_MAX_LENGTH = 300;
export const TENANT_EMAIL_MAX_LENGTH = 120;
