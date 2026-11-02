import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { OtoscopyEntry, OtoscopyEntryPayload } from '@/types/patients/otoscopy-entry';

interface CreateOtoscopyEntryVariables {
  patientUuid: string;
  entry: OtoscopyEntryPayload;
}

export function useCreateOtoscopyEntryMutation() {
  const { mutate: executeCreateEntry, isPending } = useApiMutation<
    OtoscopyEntry,
    CreateOtoscopyEntryVariables
  >({
    mutationKey: ['createOtoscopyEntry'],
    mutationFn: ({ patientUuid, entry }) =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).post<OtoscopyEntry>(
        `/patients/${patientUuid}/otoscopy-entries`,
        entry,
      ),
  });

  return { executeCreateEntry, isPending };
}
