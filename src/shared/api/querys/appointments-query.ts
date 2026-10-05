import { useQuery } from '@tanstack/react-query';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { PaginatedResponse } from '@/types/system/paginate.types';
import { Appointment } from '@/types/appointments/appointment';

export const FETCH_APPOINTMENTS_KEY = 'fetchAppointments';

/**
 * Tope por día. El API pagina de 10 en 10 por defecto; un día de la clínica
 * no llega a esto, y así la agenda nunca se queda con una página a medias.
 */
const DAY_LIMIT = 100;

/**
 * Citas de varios días ("YYYY-MM-DD"), una petición por día. El API filtra
 * por día UTC; las citas sin hora (08:00 UTC) y los horarios de la agenda
 * (8:00 a 17:00 de Costa Rica, 14:00 a 23:00 UTC) caen en el mismo día UTC que
 * el de la clínica.
 */
export function useAppointmentsByDayQuery(dayKeys: string[]) {
  return useQuery({
    queryKey: [FETCH_APPOINTMENTS_KEY, dayKeys],
    queryFn: async () => {
      const client = ApiServiceClient(env.API.MEDICAL_RECORDS_URL);
      const responses = await Promise.all(
        dayKeys.map((dayKey) => {
          const params = new URLSearchParams({ date: dayKey, limit: String(DAY_LIMIT) });
          return client.get<PaginatedResponse<Appointment>>(`/appointments?${params.toString()}`);
        }),
      );

      return Object.fromEntries(
        dayKeys.map((dayKey, index) => [dayKey, responses[index]?.data ?? []]),
      ) as Record<string, Appointment[]>;
    },
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 30,
  });
}
