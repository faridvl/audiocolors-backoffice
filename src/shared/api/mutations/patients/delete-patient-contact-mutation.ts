import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';

interface DeletePatientContactVariables {
  patientUuid: string;
  contactUuid: string;
}

export function useDeletePatientContactMutation() {
  const { mutate: executeDeletePatientContact, isPending } = useApiMutation<
    null,
    DeletePatientContactVariables
  >({
    mutationKey: ['deletePatientContact'],
    mutationFn: ({ patientUuid, contactUuid }) =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).delete<null>(
        `/patients/${patientUuid}/contacts/${contactUuid}`,
      ),
  });

  return { executeDeletePatientContact, isPending };
}
