import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { FETCH_PATIENT_ACTIVITY_KEY } from '@/shared/api/querys/patient-activity-query';
import { FETCH_PATIENT_MAINTENANCES_KEY } from '@/shared/api/querys/patient-maintenances-query';
import { MaintenanceNumber } from '@/types/patients/patient';
import {
  CreateMaintenanceNotePayload,
  MaintenanceNote,
} from '@/types/patients/patient-maintenance';

interface CreateMaintenanceNoteVariables extends CreateMaintenanceNotePayload {
  patientUuid: string;
  maintenanceNumber: MaintenanceNumber;
}

/** Solo agrega: las notas de un mantenimiento no se editan ni se borran. */
export function useCreateMaintenanceNoteMutation() {
  const queryClient = useQueryClient();
  const {
    mutate: executeCreateMaintenanceNote,
    mutateAsync: executeCreateMaintenanceNoteAsync,
    isPending,
  } = useApiMutation<
    MaintenanceNote,
    CreateMaintenanceNoteVariables
  >({
    mutationKey: ['createMaintenanceNote'],
    mutationFn: ({ patientUuid, maintenanceNumber, ...payload }) =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).post<MaintenanceNote>(
        `/patients/${patientUuid}/maintenances/${maintenanceNumber}/notes`,
        payload,
      ),
    onSuccess: (_note, { patientUuid }) => {
      void queryClient.invalidateQueries({
        queryKey: [FETCH_PATIENT_MAINTENANCES_KEY, patientUuid],
      });
      void queryClient.invalidateQueries({ queryKey: [FETCH_PATIENT_ACTIVITY_KEY] });
    },
    onError: (error) => toast.error(error.message),
  });

  return { executeCreateMaintenanceNote, executeCreateMaintenanceNoteAsync, isPending };
}
