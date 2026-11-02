import { useQuery } from '@tanstack/react-query';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { isForbiddenError } from '@/shared/api/querys/patient-background-query';
import { OtoscopyEntry } from '@/types/patients/otoscopy-entry';

export const FETCH_OTOSCOPY_ENTRIES_KEY = 'fetchOtoscopyEntries';

const MAX_RETRIES = 3;

/** Historial de otoscopías del paciente, de la más nueva a la más vieja. */
export function useOtoscopyEntriesQuery(patientUuid: string) {
  return useQuery({
    queryKey: [FETCH_OTOSCOPY_ENTRIES_KEY, patientUuid],
    queryFn: () =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).get<OtoscopyEntry[]>(
        `/patients/${patientUuid}/otoscopy-entries`,
      ),
    enabled: !!patientUuid,
    // Un 403 (rol sin acceso) no cambia al reintentar: la tarjeta se oculta al instante.
    retry: (failureCount, error) => !isForbiddenError(error) && failureCount < MAX_RETRIES,
  });
}
