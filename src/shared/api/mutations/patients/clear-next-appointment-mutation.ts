import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { PaginatedResponse } from '@/types/system/paginate.types';
import { Appointment, AppointmentStatus } from '@/types/appointments/appointment';

/** Mismo tope que la agenda: un día de la clínica no llega a esto. */
const DAY_LIMIT = 100;

interface ClearNextAppointmentVariables {
  patientUuid: string;
  /** Mes tentativo anotado, si hay. */
  tentativeMonth?: string | null;
  /** Fecha ISO de la cita agendada, si hay. */
  nextAppointmentAt?: string | null;
}

/**
 * Deja al paciente sin próxima cita: limpia el mes tentativo y cancela la cita
 * agendada. El API no tiene un endpoint para esto, y limpiar el mes no cancela
 * la cita, así que la cita se busca en su día (el API filtra por día UTC) y se
 * cancela como desde la agenda.
 */
export function useClearNextAppointmentMutation() {
  const { mutate: executeClearNextAppointment, isPending } = useApiMutation<
    void,
    ClearNextAppointmentVariables
  >({
    mutationKey: ['clearNextAppointment'],
    mutationFn: async ({ patientUuid, tentativeMonth, nextAppointmentAt }) => {
      const client = ApiServiceClient(env.API.MEDICAL_RECORDS_URL);

      if (nextAppointmentAt) {
        const params = new URLSearchParams({
          date: nextAppointmentAt.slice(0, 10),
          limit: String(DAY_LIMIT),
        });
        const response = await client.get<PaginatedResponse<Appointment>>(
          `/appointments?${params.toString()}`,
        );
        const confirmed = (response.data ?? []).filter(
          (appointment) =>
            appointment.patientUUID === patientUuid &&
            appointment.status === AppointmentStatus.CONFIRMED,
        );
        await Promise.all(
          confirmed.map((appointment) =>
            client.patch(`/appointments/${appointment.id}`, {
              status: AppointmentStatus.CANCELLED,
            }),
          ),
        );
      }

      if (tentativeMonth) {
        await client.put(`/patients/${patientUuid}/next-appointment/tentative-month`, {
          month: null,
          typeUUID: null,
        });
      }
    },
  });

  return { executeClearNextAppointment, isPending };
}
