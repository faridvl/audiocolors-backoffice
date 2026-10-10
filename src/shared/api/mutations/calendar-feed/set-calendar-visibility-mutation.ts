import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { CalendarFeedStatus } from '@/types/calendar-feed/calendar-feed';

interface SetCalendarVisibilityVariables {
  branchUuid: string;
  typeUuid?: string;
  isRemoved: boolean;
}

/** Quita un calendario (queda vacío en el teléfono) o lo vuelve a mostrar. */
export function useSetCalendarVisibilityMutation() {
  const { mutate: executeSetCalendarVisibility, mutateAsync: executeSetCalendarVisibilityAsync } =
    useApiMutation<CalendarFeedStatus, SetCalendarVisibilityVariables>({
      mutationKey: ['setCalendarVisibility'],
      mutationFn: (payload) =>
        ApiServiceClient(env.API.MEDICAL_RECORDS_URL).patch<CalendarFeedStatus>(
          '/calendar-feed/calendars',
          payload,
        ),
    });

  return { executeSetCalendarVisibility, executeSetCalendarVisibilityAsync };
}
