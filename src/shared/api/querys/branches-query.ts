import { useQuery } from '@tanstack/react-query';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { Branch } from '@/types/branches/branch';

export const FETCH_BRANCHES_KEY = 'fetchBranches';

/** Catalogo de sedes activas del tenant, ya ordenado por nombre por el API. */
export function useBranchesQuery() {
  return useQuery({
    queryKey: [FETCH_BRANCHES_KEY],
    queryFn: () => ApiServiceClient(env.API.MEDICAL_RECORDS_URL).get<Branch[]>('/branches'),
    staleTime: 1000 * 60 * 5,
  });
}
