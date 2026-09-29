import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';

export interface CreateNextAppointmentPayload {
  /** Fecha de la cita, formato YYYY-MM-DD. La hora la fija el backend. */
  date: string;
  /** UUID de sede. Si no se especifica, el backend decide. */
  branchUUID?: string;
  /** UUID del tipo de cita. Si no se especifica, el backend usa el generico. */
  typeUUID?: string;
}

interface CreateNextAppointmentVariables extends CreateNextAppointmentPayload {
  patientUuid: string;
}

/**
 * Agenda la proxima cita de un paciente. Si el paciente ya tenia una cita
 * agendada, el backend la reemplaza (la marca como completada) de forma
 * transparente.
 */
export function useCreateNextAppointmentMutation() {
  const { mutate: executeCreateNextAppointment, isPending } = useApiMutation<
    unknown,
    CreateNextAppointmentVariables
  >({
    mutationKey: ['createNextAppointment'],
    mutationFn: ({ patientUuid, ...payload }) =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).post(
        `/patients/${patientUuid}/next-appointment`,
        payload,
      ),
  });

  return { executeCreateNextAppointment, isPending };
}
