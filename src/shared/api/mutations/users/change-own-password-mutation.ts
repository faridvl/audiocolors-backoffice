import { ApiError, ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { INVALID_CURRENT_PASSWORD_ERROR_CODE, SAME_PASSWORD_ERROR_CODE } from '@/types/users/user';

interface ChangeOwnPasswordVariables {
  currentPassword: string;
  newPassword: string;
}

export function isInvalidCurrentPasswordError(error: unknown): boolean {
  return error instanceof ApiError && error.code === INVALID_CURRENT_PASSWORD_ERROR_CODE;
}

export function isSamePasswordError(error: unknown): boolean {
  return error instanceof ApiError && error.code === SAME_PASSWORD_ERROR_CODE;
}

/** Cambia la contraseña de quien tiene la sesión abierta; el API responde 204 y la sesión sigue. */
export function useChangeOwnPasswordMutation() {
  const { mutateAsync: executeChangeOwnPassword, isPending } = useApiMutation<
    null,
    ChangeOwnPasswordVariables
  >({
    mutationKey: ['changeOwnPassword'],
    // Las contraseñas viajan como variables: no deben quedar en el caché de mutaciones.
    gcTime: 0,
    mutationFn: (variables) =>
      ApiServiceClient(env.API.IDENTITY_URL).put<null>('/users/me/password', variables),
  });

  return { executeChangeOwnPassword, isPending };
}
