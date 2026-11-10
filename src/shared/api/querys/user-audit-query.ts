import { useQuery } from '@tanstack/react-query';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { PaginatedUserAudit } from '@/types/users/user';

export const FETCH_USER_AUDIT_KEY = 'fetchUserAudit';
const USER_AUDIT_PAGE_LIMIT = 20;

/** Cambios de acceso de la clínica; con `targetUuid`, solo los de esa persona. */
export function useUserAuditQuery(targetUuid?: string) {
  return useQuery({
    queryKey: [FETCH_USER_AUDIT_KEY, targetUuid ?? null],
    queryFn: async () => {
      const target = targetUuid ? `&targetUuid=${targetUuid}` : '';
      const response = await ApiServiceClient(env.API.IDENTITY_URL).get<PaginatedUserAudit>(
        `/users/audit?page=1&limit=${USER_AUDIT_PAGE_LIMIT}${target}`,
      );
      return response.data;
    },
    staleTime: 1000 * 30,
  });
}
