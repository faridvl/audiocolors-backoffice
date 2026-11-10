import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { Branch, UpdateBranchPayload } from '@/types/branches/branch';

interface UpdateBranchVariables {
  branchUuid: string;
  changes: UpdateBranchPayload;
}

export function useUpdateBranchMutation() {
  const { mutate: executeUpdateBranch, isPending } = useApiMutation<Branch, UpdateBranchVariables>(
    {
      mutationKey: ['updateBranch'],
      mutationFn: ({ branchUuid, changes }) =>
        ApiServiceClient(env.API.MEDICAL_RECORDS_URL).patch<Branch>(
          `/branches/${branchUuid}`,
          changes,
        ),
    },
  );

  return { executeUpdateBranch, isPending };
}
