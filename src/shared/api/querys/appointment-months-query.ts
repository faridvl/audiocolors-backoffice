import { useQuery } from '@tanstack/react-query';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';

export const FETCH_APPOINTMENT_MONTHS_KEY = 'fetchAppointmentMonths';

interface AppointmentMonthsResponse {
  months: string[];
}

/**
 * Meses (YYYY-MM) que tienen al menos una proxima cita confirmada para el
 * tenant. Sirve para poblar el selector de filtro de "proxima cita" sin
 * ofrecer meses que no tienen ningun paciente agendado.
 */
export function useAppointmentMonthsQuery() {
  return useQuery({
    queryKey: [FETCH_APPOINTMENT_MONTHS_KEY],
    queryFn: () =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).get<AppointmentMonthsResponse>(
        '/appointments/months',
      ),
    staleTime: 1000 * 60 * 2,
  });
}
