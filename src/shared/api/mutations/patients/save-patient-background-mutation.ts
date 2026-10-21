import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import {
  PatientBackground,
  SavePatientBackgroundPayload,
} from '@/types/patients/patient-background';

interface SavePatientBackgroundVariables {
  patientUuid: string;
  background: SavePatientBackgroundPayload;
}

/** Crea o reemplaza la historia clínica completa del paciente. */
export function useSavePatientBackgroundMutation() {
  const { mutate: executeSavePatientBackground, isPending } = useApiMutation<
    PatientBackground | null,
    SavePatientBackgroundVariables
  >({
    mutationKey: ['savePatientBackground'],
    mutationFn: ({ patientUuid, background }) =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).put<PatientBackground | null>(
        `/patients/${patientUuid}/background`,
        background,
      ),
  });

  return { executeSavePatientBackground, isPending };
}
