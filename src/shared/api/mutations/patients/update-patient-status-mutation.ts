import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { Patient, PatientStatus } from '@/types/patients/patient';

interface UpdatePatientStatusVariables {
  patientUuid: string;
  status: PatientStatus;
  /** Motivo libre; el API lo descarta si el estado es activo. */
  reason?: string | null;
  /** Fecha de fallecimiento YYYY-MM-DD; el API la descarta si no es fallecido. */
  date?: string | null;
}

/**
 * Cambia el estado del paciente. Al marcarlo fallecido el API cancela sus
 * citas confirmadas futuras y limpia el mes tentativo.
 */
export function useUpdatePatientStatusMutation() {
  const { mutate: executeUpdatePatientStatus, isPending } = useApiMutation<
    Patient,
    UpdatePatientStatusVariables
  >({
    mutationKey: ['updatePatientStatus'],
    mutationFn: ({ patientUuid, ...payload }) =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).put<Patient>(
        `/patients/${patientUuid}/status`,
        payload,
      ),
  });

  return { executeUpdatePatientStatus, isPending };
}
