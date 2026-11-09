import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { Tenant } from '@/types/tenant/tenant';

export function useDeleteTenantLogoMutation() {
  const { mutate: executeDeleteTenantLogo, isPending } = useApiMutation<Tenant, void>({
    mutationKey: ['deleteTenantLogo'],
    mutationFn: () =>
      ApiServiceClient(env.API.IDENTITY_URL).delete<Tenant>('/tenants/current/logo'),
  });

  return { executeDeleteTenantLogo, isPending };
}
