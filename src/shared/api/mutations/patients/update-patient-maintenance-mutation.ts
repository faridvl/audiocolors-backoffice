import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { FETCH_PATIENT_KEY } from '@/shared/api/querys/get-patient-query';
import { FETCH_PATIENTS_KEY } from '@/shared/api/querys/patients-query';
import { FETCH_PATIENT_ACTIVITY_KEY } from '@/shared/api/querys/patient-activity-query';
import { TEXT } from '@/static/texts/i18n';
import {
  MAINTENANCE_DONE_FIELDS,
  MAINTENANCE_NOTE_FIELDS,
  MaintenanceNumber,
  Patient,
} from '@/types/patients/patient';

const UPDATE_PATIENT_MAINTENANCE_KEY = 'updatePatientMaintenance';

interface UpdatePatientMaintenanceVariables {
  /** Marca o desmarca el mantenimiento. */
  done?: boolean;
  /** Texto de la nota; null la borra. */
  note?: string | null;
}

/**
 * Guarda la casilla o la nota de un mantenimiento (1 a 4). El cambio se ve al instante y, si
 * falla, se revierte solo el campo que se tocó: un guardado en otro mantenimiento no se pisa.
 * El resultado se maneja desde las opciones de la mutación y no desde `mutate`, para que el
 * expediente se actualice aunque el modal ya se haya cerrado.
 */
export function useUpdatePatientMaintenanceMutation(
  patientUuid: string,
  maintenanceNumber: MaintenanceNumber,
) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const doneField = MAINTENANCE_DONE_FIELDS[maintenanceNumber];
  const noteField = MAINTENANCE_NOTE_FIELDS[maintenanceNumber];
  const patientKey = [FETCH_PATIENT_KEY, patientUuid];

  const applyChange = (change: Partial<Patient>) => {
    queryClient.setQueryData(patientKey, (previous?: Patient) =>
      previous ? { ...previous, ...change } : previous,
    );
  };

  const { mutate: executeUpdatePatientMaintenance } = useApiMutation<
    Patient,
    UpdatePatientMaintenanceVariables,
    Error,
    { previous: Partial<Patient> }
  >({
    mutationKey: [UPDATE_PATIENT_MAINTENANCE_KEY, patientUuid, maintenanceNumber],
    mutationFn: ({ done, note }) =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).put<Patient>(
        `/patients/${patientUuid}/maintenances/${maintenanceNumber}`,
        { done, note },
      ),
    onMutate: async ({ done, note }) => {
      await queryClient.cancelQueries({ queryKey: patientKey });
      const current = queryClient.getQueryData<Patient>(patientKey);
      const previous: Partial<Patient> = {};
      const next: Partial<Patient> = {};
      if (done !== undefined) {
        previous[doneField] = current?.[doneField];
        next[doneField] = done;
      }
      if (note !== undefined) {
        previous[noteField] = current?.[noteField];
        next[noteField] = note;
      }
      applyChange(next);
      return { previous };
    },
    onSuccess: (updated, { done, note }) => {
      const confirmed: Partial<Patient> = {};
      if (done !== undefined) confirmed[doneField] = updated[doneField];
      if (note !== undefined) confirmed[noteField] = updated[noteField] ?? null;
      applyChange(confirmed);
      // Con otro guardado en curso, recargar ahora traería datos que todavía no lo incluyen.
      const pendingSaves = queryClient.isMutating({
        mutationKey: [UPDATE_PATIENT_MAINTENANCE_KEY, patientUuid],
      });
      if (pendingSaves <= 1) void queryClient.invalidateQueries({ queryKey: patientKey });
      void queryClient.invalidateQueries({ queryKey: [FETCH_PATIENTS_KEY] });
      void queryClient.invalidateQueries({ queryKey: [FETCH_PATIENT_ACTIVITY_KEY] });

      const toastKey =
        done !== undefined
          ? done
            ? TEXT.PATIENTS.FLAGS.MAINTENANCE.TOAST_DONE
            : TEXT.PATIENTS.FLAGS.MAINTENANCE.TOAST_UNDONE
          : note
            ? TEXT.PATIENTS.FLAGS.MAINTENANCE.TOAST_NOTE_SAVED
            : TEXT.PATIENTS.FLAGS.MAINTENANCE.TOAST_NOTE_REMOVED;
      toast.success(t(toastKey, { number: maintenanceNumber }));
    },
    onError: (error, _variables, context) => {
      if (context) applyChange(context.previous);
      toast.error(error.message);
    },
  });

  return { executeUpdatePatientMaintenance };
}
