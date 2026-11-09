import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { ManagedUser, UserStatus } from '@/types/users/user';

interface UpdateUserStatusVariables {
  userUuid: string;
  status: UserStatus;
}

export function useUpdateUserStatusMutation() {
  const { mutate: executeUpdateUserStatus, isPending } = useApiMutation<
    ManagedUser,
    UpdateUserStatusVariables
  >({
    mutationKey: ['updateUserStatus'],
    mutationFn: ({ userUuid, status }) =>
      ApiServiceClient(env.API.IDENTITY_URL).patch<ManagedUser>(`/users/${userUuid}/status`, {
        status,
      }),
  });

  return { executeUpdateUserStatus, isPending };
}
