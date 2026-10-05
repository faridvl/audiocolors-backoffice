import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { CalendarFeedStatus } from '@/types/calendar-feed/calendar-feed';

interface SetCalendarFeedBranchVariables {
  branchUuid: string;
  isRemoved: boolean;
}

/** Quita una sede del calendario del teléfono (queda vacía) o la vuelve a agregar. */
export function useSetCalendarFeedBranchMutation() {
  const { mutate: executeSetCalendarFeedBranch, isPending } = useApiMutation<
    CalendarFeedStatus,
    SetCalendarFeedBranchVariables
  >({
    mutationKey: ['setCalendarFeedBranch'],
    mutationFn: ({ branchUuid, isRemoved }) => {
      const client = ApiServiceClient(env.API.MEDICAL_RECORDS_URL);
      const path = `/calendar-feed/branches/${branchUuid}`;
      return isRemoved
        ? client.delete<CalendarFeedStatus>(path)
        : client.put<CalendarFeedStatus>(path, {});
    },
  });

  return { executeSetCalendarFeedBranch, isPending };
}
