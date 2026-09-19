import { useQuery } from '@tanstack/react-query';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { PatientNote } from '@/types/patients/patient-note';

export const FETCH_PATIENT_NOTES_KEY = 'fetchPatientNotes';

/** El API ya devuelve las notas ordenadas por fecha descendente (mas reciente primero). */
export function usePatientNotesQuery(patientUuid: string) {
  return useQuery({
    queryKey: [FETCH_PATIENT_NOTES_KEY, patientUuid],
    queryFn: () =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).get<PatientNote[]>(
        `/patients/${patientUuid}/notes`,
      ),
    enabled: !!patientUuid,
    staleTime: 1000 * 60 * 2,
  });
}
