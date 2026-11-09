import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import {
  AppointmentType,
  CreateAppointmentTypePayload,
} from '@/types/appointments/appointment-type';

export function useCreateAppointmentTypeMutation() {
  const { mutate: executeCreateAppointmentType, isPending } = useApiMutation<
    AppointmentType,
    CreateAppointmentTypePayload
  >({
    mutationKey: ['createAppointmentType'],
    mutationFn: (payload) =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).post<AppointmentType>(
        '/appointment-types',
        payload,
      ),
  });

  return { executeCreateAppointmentType, isPending };
}
