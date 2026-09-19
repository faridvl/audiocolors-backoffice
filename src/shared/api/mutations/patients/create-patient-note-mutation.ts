import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { CreatePatientNotePayload, PatientNote } from '@/types/patients/patient-note';

interface CreatePatientNoteVariables extends CreatePatientNotePayload {
  patientUuid: string;
}

/** Solo crea: no hay endpoint de edicion ni eliminacion, la bitacora es append-only. */
export function useCreatePatientNoteMutation() {
  const { mutate: executeCreatePatientNote, isPending } = useApiMutation<
    PatientNote,
    CreatePatientNoteVariables
  >({
    mutationKey: ['createPatientNote'],
    mutationFn: ({ patientUuid, ...payload }) =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).post<PatientNote>(
        `/patients/${patientUuid}/notes`,
        payload,
      ),
  });

  return { executeCreatePatientNote, isPending };
}
