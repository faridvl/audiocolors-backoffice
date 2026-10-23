import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import {
  AppointmentType,
  UpdateAppointmentTypePayload,
} from '@/types/appointments/appointment-type';

interface UpdateAppointmentTypeVariables {
  typeUuid: string;
  changes: UpdateAppointmentTypePayload;
}

export function useUpdateAppointmentTypeMutation() {
  const { mutate: executeUpdateAppointmentType, isPending } = useApiMutation<
    AppointmentType,
    UpdateAppointmentTypeVariables
  >({
    mutationKey: ['updateAppointmentType'],
    mutationFn: ({ typeUuid, changes }) =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).patch<AppointmentType>(
        `/appointment-types/${typeUuid}`,
        changes,
      ),
  });

  return { executeUpdateAppointmentType, isPending };
}
