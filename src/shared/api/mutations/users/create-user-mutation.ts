import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { CreateUserPayload, ManagedUser } from '@/types/users/user';

export function useCreateUserMutation() {
  const { mutate: executeCreateUser, isPending } = useApiMutation<ManagedUser, CreateUserPayload>({
    mutationKey: ['createUser'],
    mutationFn: (payload) =>
      ApiServiceClient(env.API.IDENTITY_URL).post<ManagedUser>('/users', payload),
  });

  return { executeCreateUser, isPending };
}
