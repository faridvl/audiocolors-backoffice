import { useQuery } from '@tanstack/react-query';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { CalendarFeedStatus } from '@/types/calendar-feed/calendar-feed';

export const FETCH_CALENDAR_FEED_KEY = 'fetchCalendarFeed';

/**
 * El enlace del usuario y qué calendarios lee su teléfono. Se vuelve a pedir
 * al volver a la app: tras agregar uno en Calendario, la ficha ya lo muestra.
 */
export function useCalendarFeedQuery({ isEnabled = true }: { isEnabled?: boolean } = {}) {
  return useQuery({
    queryKey: [FETCH_CALENDAR_FEED_KEY],
    queryFn: () =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).get<CalendarFeedStatus>('/calendar-feed'),
    enabled: isEnabled,
    refetchOnWindowFocus: true,
  });
}
