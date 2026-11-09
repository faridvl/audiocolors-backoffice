import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';

interface SetUserPasswordVariables {
  userUuid: string;
  password: string;
}

export function useSetUserPasswordMutation() {
  const { mutate: executeSetUserPassword, isPending } = useApiMutation<
    null,
    SetUserPasswordVariables
  >({
    mutationKey: ['setUserPassword'],
    mutationFn: ({ userUuid, password }) =>
      ApiServiceClient(env.API.IDENTITY_URL).put<null>(`/users/${userUuid}/password`, { password }),
  });

  return { executeSetUserPassword, isPending };
}
