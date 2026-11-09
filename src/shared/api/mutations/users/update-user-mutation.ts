import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { ManagedUser, UpdateUserPayload } from '@/types/users/user';

interface UpdateUserVariables {
  userUuid: string;
  changes: UpdateUserPayload;
}

export function useUpdateUserMutation() {
  const { mutate: executeUpdateUser, isPending } = useApiMutation<ManagedUser, UpdateUserVariables>(
    {
      mutationKey: ['updateUser'],
      mutationFn: ({ userUuid, changes }) =>
        ApiServiceClient(env.API.IDENTITY_URL).patch<ManagedUser>(`/users/${userUuid}`, changes),
    },
  );

  return { executeUpdateUser, isPending };
}
