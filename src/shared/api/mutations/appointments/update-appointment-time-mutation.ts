import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { Appointment } from '@/types/appointments/appointment';

interface UpdateAppointmentTimeVariables {
  appointmentUuid: string;
  /** ISO de inicio y fin, en la hora real de la clínica. */
  startTime: string;
  endTime: string;
}

/**
 * Fija la hora de una cita ya confirmada. `POST next-appointment` solo recibe
 * el día y guarda las 08:00 UTC; la hora que se elige en la agenda se ajusta
 * después con este PATCH. `date` va igual que `startTime`: si faltara, el API
 * guardaría la fecha de hoy.
 */
export function useUpdateAppointmentTimeMutation() {
  const { mutateAsync: executeUpdateAppointmentTimeAsync, isPending } = useApiMutation<
    Appointment,
    UpdateAppointmentTimeVariables
  >({
    mutationKey: ['updateAppointmentTime'],
    mutationFn: ({ appointmentUuid, startTime, endTime }) =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).patch<Appointment>(
        `/appointments/${appointmentUuid}`,
        { date: startTime, startTime, endTime },
      ),
  });

  return { executeUpdateAppointmentTimeAsync, isPending };
}
