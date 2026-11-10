import { useQuery } from '@tanstack/react-query';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { Branch } from '@/types/branches/branch';

export const FETCH_BRANCHES_KEY = 'fetchBranches';

/** Sedes del tenant, activas primero y por nombre (el API las ordena). Incluye las inactivas: para ofrecer opciones nuevas filtra con `getActiveBranches` o `getSelectableBranches` de `@/shared/utils/branches`. */
export function useBranchesQuery() {
  return useQuery({
    queryKey: [FETCH_BRANCHES_KEY],
    queryFn: () => ApiServiceClient(env.API.MEDICAL_RECORDS_URL).get<Branch[]>('/branches'),
    staleTime: 1000 * 60 * 5,
  });
}
