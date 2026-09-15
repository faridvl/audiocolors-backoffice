import { useQuery } from '@tanstack/react-query';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { PatientDocument } from '@/types/documents/document.types';

export const FETCH_PATIENT_DOCUMENTS_KEY = 'fetchPatientDocuments';

export function usePatientDocumentsQuery(patientUuid: string) {
  return useQuery({
    queryKey: [FETCH_PATIENT_DOCUMENTS_KEY, patientUuid],
    queryFn: () =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).get<PatientDocument[]>(
        `/patients/${patientUuid}/documents`,
      ),
    enabled: !!patientUuid,
    staleTime: 1000 * 60 * 2,
  });
}
