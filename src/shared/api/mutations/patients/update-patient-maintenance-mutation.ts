import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { FETCH_PATIENT_KEY } from '@/shared/api/querys/get-patient-query';
import { FETCH_PATIENTS_KEY } from '@/shared/api/querys/patients-query';
import { FETCH_PATIENT_ACTIVITY_KEY } from '@/shared/api/querys/patient-activity-query';
import { FETCH_PATIENT_MAINTENANCES_KEY } from '@/shared/api/querys/patient-maintenances-query';
import { TEXT } from '@/static/texts/i18n';
import {
  MAINTENANCE_STATUS_FIELDS,
  MaintenanceNumber,
  MaintenanceStatus,
  Patient,
} from '@/types/patients/patient';

interface UpdatePatientMaintenanceVariables {
  patientUuid: string;
  maintenanceNumber: MaintenanceNumber;
  status: MaintenanceStatus;
}

/**
 * Cambia el estado de un mantenimiento (1 a 4). El resultado se refleja desde las opciones de
 * la mutación y no desde `mutate`, para que el expediente se actualice aunque el modal ya
 * se haya cerrado.
 */
export function useUpdatePatientMaintenanceMutation() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { mutate: executeUpdatePatientMaintenance, isPending } = useApiMutation<
    Patient,
    UpdatePatientMaintenanceVariables
  >({
    mutationKey: ['updatePatientMaintenance'],
    mutationFn: ({ patientUuid, maintenanceNumber, status }) =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).put<Patient>(
        `/patients/${patientUuid}/maintenances/${maintenanceNumber}`,
        { status },
      ),
    onSuccess: (updated, { patientUuid, maintenanceNumber, status }) => {
      const field = MAINTENANCE_STATUS_FIELDS[maintenanceNumber];
      queryClient.setQueryData([FETCH_PATIENT_KEY, patientUuid], (previous?: Patient) =>
        previous ? { ...previous, [field]: updated[field] ?? status } : previous,
      );
      void queryClient.invalidateQueries({ queryKey: [FETCH_PATIENT_KEY, patientUuid] });
      void queryClient.invalidateQueries({ queryKey: [FETCH_PATIENTS_KEY] });
      void queryClient.invalidateQueries({
        queryKey: [FETCH_PATIENT_MAINTENANCES_KEY, patientUuid],
      });
      void queryClient.invalidateQueries({ queryKey: [FETCH_PATIENT_ACTIVITY_KEY] });
      toast.success(
        t(`${TEXT.PATIENTS.FLAGS.MAINTENANCE.TOAST_PREFIX}.${status}`, {
          number: maintenanceNumber,
        }),
      );
    },
    onError: (error) => toast.error(error.message),
  });

  return { executeUpdatePatientMaintenance, isPending };
}
