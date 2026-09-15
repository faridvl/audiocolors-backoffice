import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { Patient, UpdatePatientPayload } from '@/types/patients/patient';

interface UpdatePatientVariables {
  uuid: string;
  payload: UpdatePatientPayload;
}

export function useUpdatePatientMutation() {
  const { mutate: executeUpdatePatient, isPending } = useApiMutation<
    Patient,
    UpdatePatientVariables
  >({
    mutationKey: ['updatePatient'],
    mutationFn: ({ uuid, payload }) =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).patch<Patient>(`/patients/${uuid}`, payload),
  });

  return { executeUpdatePatient, isPending };
}
