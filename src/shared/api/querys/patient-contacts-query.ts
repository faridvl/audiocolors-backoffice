import { useQuery } from '@tanstack/react-query';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { PatientContact } from '@/types/patients/patient-contact';

export const FETCH_PATIENT_CONTACTS_KEY = 'fetchPatientContacts';

export function usePatientContactsQuery(patientUuid: string) {
  return useQuery({
    queryKey: [FETCH_PATIENT_CONTACTS_KEY, patientUuid],
    queryFn: () =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).get<PatientContact[]>(
        `/patients/${patientUuid}/contacts`,
      ),
    enabled: !!patientUuid,
    staleTime: 1000 * 60 * 2,
  });
}
