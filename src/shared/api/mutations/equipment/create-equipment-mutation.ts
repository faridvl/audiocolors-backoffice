import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { CreateEquipmentPayload, Equipment } from '@/types/equipment/equipment';

export function useCreateEquipmentMutation() {
  const { mutate: executeCreateEquipment, isPending } = useApiMutation<
    Equipment,
    CreateEquipmentPayload
  >({
    mutationKey: ['createEquipment'],
    mutationFn: (payload) =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).post<Equipment>('/equipment', payload),
  });

  return { executeCreateEquipment, isPending };
}
