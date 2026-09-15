import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { LoginPayload, LoginResponse } from '@/types/auth/auth';

export function useLoginMutation() {
  const { mutate: executeLogin, isPending, error } = useApiMutation<LoginResponse, LoginPayload>({
    mutationKey: ['login'],
    mutationFn: (payload) =>
      ApiServiceClient(env.API.IDENTITY_URL).post<LoginResponse>('/auth/login', payload),
  });

  return { executeLogin, isPending, error };
}
