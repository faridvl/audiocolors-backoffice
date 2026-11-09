import { useQuery } from '@tanstack/react-query';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { UserCatalogs } from '@/types/users/user';

export const FETCH_USER_CATALOGS_KEY = 'fetchUserCatalogs';

export function useUserCatalogsQuery() {
  return useQuery({
    queryKey: [FETCH_USER_CATALOGS_KEY],
    queryFn: () => ApiServiceClient(env.API.IDENTITY_URL).get<UserCatalogs>('/users/catalogs'),
    staleTime: Infinity,
  });
}
