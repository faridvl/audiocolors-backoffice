import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { Branch, CreateBranchPayload } from '@/types/branches/branch';

export function useCreateBranchMutation() {
  const { mutate: executeCreateBranch, isPending } = useApiMutation<Branch, CreateBranchPayload>({
    mutationKey: ['createBranch'],
    mutationFn: (payload) =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).post<Branch>('/branches', payload),
  });

  return { executeCreateBranch, isPending };
}
