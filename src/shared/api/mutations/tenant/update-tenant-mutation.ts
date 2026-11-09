import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { Tenant, UpdateTenantPayload } from '@/types/tenant/tenant';

export function useUpdateTenantMutation() {
  const { mutate: executeUpdateTenant, isPending } = useApiMutation<Tenant, UpdateTenantPayload>({
    mutationKey: ['updateTenant'],
    mutationFn: (changes) =>
      ApiServiceClient(env.API.IDENTITY_URL).patch<Tenant>('/tenants/current', changes),
  });

  return { executeUpdateTenant, isPending };
}
