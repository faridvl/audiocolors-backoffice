import { useQuery } from '@tanstack/react-query';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { OtoscopyEntry } from '@/types/patients/otoscopy-entry';

export const FETCH_OTOSCOPY_ENTRIES_KEY = 'fetchOtoscopyEntries';

const STALE_TIME_MS = 1000 * 60 * 2;

/** No se asume el orden del API: quien la use ordena por `createdAt`. */
export function useOtoscopyEntriesQuery(patientUuid: string) {
  return useQuery({
    queryKey: [FETCH_OTOSCOPY_ENTRIES_KEY, patientUuid],
    queryFn: () =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).get<OtoscopyEntry[]>(
        `/patients/${patientUuid}/otoscopy-entries`,
      ),
    enabled: !!patientUuid,
    staleTime: STALE_TIME_MS,
  });
}
