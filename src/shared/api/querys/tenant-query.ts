import { useQuery } from '@tanstack/react-query';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { Tenant } from '@/types/tenant/tenant';

export const FETCH_TENANT_KEY = 'fetchCurrentTenant';

/** Datos de contacto de la clínica actual. */
export function useTenantQuery(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: [FETCH_TENANT_KEY],
    queryFn: () => ApiServiceClient(env.API.IDENTITY_URL).get<Tenant>('/tenants/current'),
    staleTime: 1000 * 60 * 5,
    ...options,
  });
}
