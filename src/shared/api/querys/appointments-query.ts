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
 * por día UTC; como guarda las citas a las 08:00 UTC, ese día coincide con el
 * de la clínica.
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
