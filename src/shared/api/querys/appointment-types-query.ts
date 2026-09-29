import { useQuery } from '@tanstack/react-query';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { AppointmentType } from '@/types/appointments/appointment-type';

export const FETCH_APPOINTMENT_TYPES_KEY = 'fetchAppointmentTypes';

/** Catalogo de tipos de cita del tenant, ya ordenado por nombre por el API. */
export function useAppointmentTypesQuery() {
  return useQuery({
    queryKey: [FETCH_APPOINTMENT_TYPES_KEY],
    queryFn: () =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).get<AppointmentType[]>('/appointment-types'),
    staleTime: 1000 * 60 * 5,
  });
}
