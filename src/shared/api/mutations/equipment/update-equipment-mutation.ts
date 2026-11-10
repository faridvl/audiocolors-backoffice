import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { Equipment, UpdateEquipmentPayload } from '@/types/equipment/equipment';

interface UpdateEquipmentVariables {
  equipmentUuid: string;
  changes: UpdateEquipmentPayload;
}

export function useUpdateEquipmentMutation() {
  const { mutate: executeUpdateEquipment, isPending } = useApiMutation<
    Equipment,
    UpdateEquipmentVariables
  >({
    mutationKey: ['updateEquipment'],
    mutationFn: ({ equipmentUuid, changes }) =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).patch<Equipment>(
        `/equipment/${equipmentUuid}`,
        changes,
      ),
  });

  return { executeUpdateEquipment, isPending };
}
