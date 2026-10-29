import { useQuery } from '@tanstack/react-query';
import { ApiError, ApiServiceClient, HttpStatus } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { PatientPhysicalExam } from '@/types/patients/patient-physical-exam';

export const FETCH_PATIENT_PHYSICAL_EXAM_KEY = 'fetchPatientPhysicalExam';

const MAX_RETRIES = 1;

/** Un 403 (rol sin acceso) o 404 no cambian al reintentar. */
function isFinalApiError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.status === HttpStatus.FORBIDDEN || error.status === HttpStatus.NOT_FOUND)
  );
}

/** `null` si al paciente todavía no se le registró la exploración (el API puede responder sin cuerpo). */
export function usePatientPhysicalExamQuery(patientUuid: string) {
  return useQuery({
    queryKey: [FETCH_PATIENT_PHYSICAL_EXAM_KEY, patientUuid],
    queryFn: async () =>
      (await ApiServiceClient(env.API.MEDICAL_RECORDS_URL).get<PatientPhysicalExam | null>(
        `/patients/${patientUuid}/physical-exam`,
      )) ?? null,
    enabled: !!patientUuid,
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error) => !isFinalApiError(error) && failureCount < MAX_RETRIES,
  });
}
