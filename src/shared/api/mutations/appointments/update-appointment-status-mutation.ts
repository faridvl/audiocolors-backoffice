import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { Appointment, AppointmentStatus } from '@/types/appointments/appointment';

interface UpdateAppointmentStatusVariables {
  appointmentUuid: string;
  status: AppointmentStatus;
}

/**
 * Cambia el estado de una cita desde la agenda (llegó, atendida, deshacer).
 * El API anota en la bitácora el paso a "en sala" y a "atendida".
 */
export function useUpdateAppointmentStatusMutation() {
  const {
    mutate: executeUpdateAppointmentStatus,
    mutateAsync: executeUpdateAppointmentStatusAsync,
    isPending,
  } = useApiMutation<Appointment, UpdateAppointmentStatusVariables>({
    mutationKey: ['updateAppointmentStatus'],
    mutationFn: ({ appointmentUuid, status }) =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).patch<Appointment>(
        `/appointments/${appointmentUuid}`,
        { status },
      ),
  });

  return { executeUpdateAppointmentStatus, executeUpdateAppointmentStatusAsync, isPending };
}
