import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { CreatePatientContactPayload, PatientContact } from '@/types/patients/patient-contact';

interface CreatePatientContactVariables extends CreatePatientContactPayload {
  patientUuid: string;
}

export function useCreatePatientContactMutation() {
  const { mutate: executeCreatePatientContact, isPending } = useApiMutation<
    PatientContact,
    CreatePatientContactVariables
  >({
    mutationKey: ['createPatientContact'],
    mutationFn: ({ patientUuid, ...payload }) =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).post<PatientContact>(
        `/patients/${patientUuid}/contacts`,
        payload,
      ),
  });

  return { executeCreatePatientContact, isPending };
}
