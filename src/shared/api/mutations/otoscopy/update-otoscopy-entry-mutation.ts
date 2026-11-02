import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { OtoscopyEntry, OtoscopyEntryPayload } from '@/types/patients/otoscopy-entry';

interface UpdateOtoscopyEntryVariables {
  patientUuid: string;
  entryUuid: string;
  changes: OtoscopyEntryPayload;
}

export function useUpdateOtoscopyEntryMutation() {
  const { mutate: executeUpdateEntry, isPending } = useApiMutation<
    OtoscopyEntry,
    UpdateOtoscopyEntryVariables
  >({
    mutationKey: ['updateOtoscopyEntry'],
    mutationFn: ({ patientUuid, entryUuid, changes }) =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).patch<OtoscopyEntry>(
        `/patients/${patientUuid}/otoscopy-entries/${entryUuid}`,
        changes,
      ),
  });

  return { executeUpdateEntry, isPending };
}
