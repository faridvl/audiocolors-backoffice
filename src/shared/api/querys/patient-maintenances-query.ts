import { useQuery } from '@tanstack/react-query';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { PatientMaintenance } from '@/types/patients/patient-maintenance';

export const FETCH_PATIENT_MAINTENANCES_KEY = 'fetchPatientMaintenances';

/** Siempre los 4 mantenimientos; cada uno trae sus notas con la más nueva primero. */
export function usePatientMaintenancesQuery(patientUuid: string) {
  return useQuery({
    queryKey: [FETCH_PATIENT_MAINTENANCES_KEY, patientUuid],
    queryFn: () =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).get<PatientMaintenance[]>(
        `/patients/${patientUuid}/maintenances`,
      ),
    enabled: !!patientUuid,
    staleTime: 1000 * 60 * 2,
  });
}
