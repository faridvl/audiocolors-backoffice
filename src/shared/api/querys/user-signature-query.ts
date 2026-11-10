import { useQuery } from '@tanstack/react-query';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { UserSignature } from '@/types/users/user';

export const FETCH_USER_SIGNATURE_KEY = 'fetchUserSignature';

/** El título y el colegiado de un profesional casi no cambian: se reusan mucho tiempo. */
const USER_SIGNATURE_STALE_TIME_MS = 1000 * 60 * 30;

/** Firma de un profesional de la clínica; la puede pedir cualquier usuario, a diferencia de `GET /users`. */
export function useUserSignatureQuery(uuid: string | null | undefined, enabled = true) {
  return useQuery({
    queryKey: [FETCH_USER_SIGNATURE_KEY, uuid],
    enabled: !!uuid && enabled,
    queryFn: () =>
      ApiServiceClient(env.API.IDENTITY_URL).get<UserSignature>(`/users/${uuid}/signature`),
    staleTime: USER_SIGNATURE_STALE_TIME_MS,
    retry: false,
  });
}
