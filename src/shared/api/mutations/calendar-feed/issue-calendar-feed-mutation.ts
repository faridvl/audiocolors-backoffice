import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { CalendarFeedStatus } from '@/types/calendar-feed/calendar-feed';

/** Crea el enlace de calendario, o lo regenera: el anterior deja de funcionar. */
export function useIssueCalendarFeedMutation() {
  const { mutate: executeIssueCalendarFeed, isPending } = useApiMutation<CalendarFeedStatus, void>({
    mutationKey: ['issueCalendarFeed'],
    mutationFn: () =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).post<CalendarFeedStatus>('/calendar-feed', {}),
  });

  return { executeIssueCalendarFeed, isPending };
}
