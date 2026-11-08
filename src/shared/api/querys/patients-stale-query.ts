import { useQuery } from '@tanstack/react-query';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';

export const FETCH_PATIENTS_STALE_KEY = 'fetchPatientsStale';

export interface StalePatient {
  uuid: string;
  fullName: string;
  /** ISO del último movimiento del paciente. */
  lastMovementAt: string;
}

/** El API los devuelve del más antiguo al más reciente. */
export function usePatientsStaleQuery(enabled: boolean) {
  return useQuery({
    queryKey: [FETCH_PATIENTS_STALE_KEY],
    queryFn: () =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).get<StalePatient[]>('/patients/stale'),
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}
