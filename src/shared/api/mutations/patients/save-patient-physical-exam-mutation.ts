import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import {
  PatientPhysicalExam,
  SavePatientPhysicalExamPayload,
} from '@/types/patients/patient-physical-exam';

interface SavePatientPhysicalExamVariables {
  patientUuid: string;
  exam: SavePatientPhysicalExamPayload;
}

/** Crea o actualiza la exploración física del paciente. */
export function useSavePatientPhysicalExamMutation() {
  const { mutate: executeSavePatientPhysicalExam, isPending } = useApiMutation<
    PatientPhysicalExam | null,
    SavePatientPhysicalExamVariables
  >({
    mutationKey: ['savePatientPhysicalExam'],
    mutationFn: ({ patientUuid, exam }) =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).put<PatientPhysicalExam | null>(
        `/patients/${patientUuid}/physical-exam`,
        exam,
      ),
  });

  return { executeSavePatientPhysicalExam, isPending };
}
