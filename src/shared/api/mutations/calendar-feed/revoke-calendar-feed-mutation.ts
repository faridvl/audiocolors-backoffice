import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';

/** Desconecta el calendario: el teléfono queda sin citas en su próxima actualización. */
export function useRevokeCalendarFeedMutation() {
  const { mutate: executeRevokeCalendarFeed, isPending } = useApiMutation<unknown, void>({
    mutationKey: ['revokeCalendarFeed'],
    mutationFn: () => ApiServiceClient(env.API.MEDICAL_RECORDS_URL).delete('/calendar-feed'),
  });

  return { executeRevokeCalendarFeed, isPending };
}
