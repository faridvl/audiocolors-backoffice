import { useQuery } from '@tanstack/react-query';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { CalendarFeedStatus } from '@/types/calendar-feed/calendar-feed';

export const FETCH_CALENDAR_FEED_KEY = 'fetchCalendarFeed';

/** Si el usuario ya tiene enlace de calendario suscrito (y cuál). */
export function useCalendarFeedQuery() {
  return useQuery({
    queryKey: [FETCH_CALENDAR_FEED_KEY],
    queryFn: () =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).get<CalendarFeedStatus>('/calendar-feed'),
  });
}
