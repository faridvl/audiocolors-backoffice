import { useQuery } from '@tanstack/react-query';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { Equipment } from '@/types/equipment/equipment';

export const FETCH_EQUIPMENT_KEY = 'fetchEquipment';

/** Equipos de la clínica, con los inactivos. Para ofrecer opciones nuevas se filtra con `getActiveEquipment`. */
export function useEquipmentQuery() {
  return useQuery({
    queryKey: [FETCH_EQUIPMENT_KEY],
    queryFn: () => ApiServiceClient(env.API.MEDICAL_RECORDS_URL).get<Equipment[]>('/equipment'),
    staleTime: 1000 * 60 * 5,
  });
}
