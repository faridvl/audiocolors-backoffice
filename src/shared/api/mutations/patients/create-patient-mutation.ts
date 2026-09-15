import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { CreatePatientPayload, Patient } from '@/types/patients/patient';

export function useCreatePatientMutation() {
  const { mutate: executeCreatePatient, isPending } = useApiMutation<
    Patient,
    CreatePatientPayload
  >({
    mutationKey: ['createPatient'],
    mutationFn: (payload) =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).post<Patient>('/patients', payload),
  });

  return { executeCreatePatient, isPending };
}
