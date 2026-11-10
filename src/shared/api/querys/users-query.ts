import { useQuery } from '@tanstack/react-query';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import {
  ManagedUser,
  PaginatedUsers,
  USERS_PAGE_LIMIT,
  USERS_STATUS_FILTER_ALL,
} from '@/types/users/user';

export const FETCH_USERS_KEY = 'fetchUsers';

/** Todos los usuarios de la clínica, activos e inactivos. */
export function useUsersQuery() {
  return useQuery({
    queryKey: [FETCH_USERS_KEY],
    queryFn: async (): Promise<ManagedUser[]> => {
      const response = await ApiServiceClient(env.API.IDENTITY_URL).get<PaginatedUsers>(
        `/users?page=1&limit=${USERS_PAGE_LIMIT}&status=${USERS_STATUS_FILTER_ALL}`,
      );
      return response.data;
    },
    staleTime: 1000 * 60,
  });
}
