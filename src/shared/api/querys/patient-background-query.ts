import { useQuery } from '@tanstack/react-query';
import { ApiError, ApiServiceClient, HttpStatus } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { PatientBackground } from '@/types/patients/patient-background';

export const FETCH_PATIENT_BACKGROUND_KEY = 'fetchPatientBackground';

const MAX_RETRIES = 1;

export function isForbiddenError(error: unknown): boolean {
  return error instanceof ApiError && error.status === HttpStatus.FORBIDDEN;
}

/** Un 403 (rol sin acceso) o 404 no cambian al reintentar. */
function isFinalApiError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.status === HttpStatus.FORBIDDEN || error.status === HttpStatus.NOT_FOUND)
  );
}

/** `null` si el paciente todavía no tiene historia clínica (el API puede responder sin cuerpo). */
export function usePatientBackgroundQuery(patientUuid: string) {
  return useQuery({
    queryKey: [FETCH_PATIENT_BACKGROUND_KEY, patientUuid],
    queryFn: async () =>
      (await ApiServiceClient(env.API.MEDICAL_RECORDS_URL).get<PatientBackground | null>(
        `/patients/${patientUuid}/background`,
      )) ?? null,
    enabled: !!patientUuid,
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error) => !isFinalApiError(error) && failureCount < MAX_RETRIES,
  });
}
