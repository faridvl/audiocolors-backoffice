import { useQuery } from '@tanstack/react-query';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { Patient } from '@/types/patients/patient';

export const FETCH_PATIENT_KEY = 'fetchPatient';

export function usePatientQuery(uuid: string) {
  return useQuery({
    queryKey: [FETCH_PATIENT_KEY, uuid],
    queryFn: () =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).get<Patient>(`/patients/${uuid}`),
    enabled: !!uuid,
    staleTime: 1000 * 60 * 5,
  });
}
