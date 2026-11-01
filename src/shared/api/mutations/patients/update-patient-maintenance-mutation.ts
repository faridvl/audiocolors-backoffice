import { useTranslation } from 'react-i18next';
import { useIsMutating, useQueryClient } from '@tanstack/react-query';
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

enum MaintenanceField {
  DONE = 'done',
  NOTE = 'note',
}

interface UpdatePatientMaintenanceVariables {
  /** Marca o desmarca el mantenimiento. */
  done?: boolean;
  /** Texto de la nota; null la borra. */
  note?: string | null;
}

export interface UpdatePatientMaintenanceCallbacks {
  onDoneSaved?: () => void;
  onNoteSaved?: (note: string | null) => void;
  /** La nota que no se pudo guardar, para devolverla al campo. */
  onNoteFailed?: (note: string | null) => void;
}

/**
 * Guarda la casilla o la nota de un mantenimiento (1 a 4) con una mutación por campo, para que
 * un guardado no pise el estado ni los avisos del otro. El cambio se ve al instante y, si falla,
 * se revierte solo el campo que se tocó. Los avisos se pasan en las opciones de la mutación y no
 * en `mutate`, para que el expediente se actualice aunque el modal ya se haya cerrado.
 */
export function useUpdatePatientMaintenanceMutation(
  patientUuid: string,
  maintenanceNumber: MaintenanceNumber,
  callbacks: UpdatePatientMaintenanceCallbacks = {},
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

  const buildMutationKey = (field: MaintenanceField) => [
    UPDATE_PATIENT_MAINTENANCE_KEY,
    patientUuid,
    maintenanceNumber,
    field,
  ];

  const buildMutationOptions = (field: MaintenanceField) => ({
    mutationKey: buildMutationKey(field),
    mutationFn: ({ done, note }: UpdatePatientMaintenanceVariables) =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).put<Patient>(
        `/patients/${patientUuid}/maintenances/${maintenanceNumber}`,
        { done, note },
      ),
    onMutate: async ({ done, note }: UpdatePatientMaintenanceVariables) => {
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
    onSuccess: (updated: Patient, { done, note }: UpdatePatientMaintenanceVariables) => {
      const confirmed: Partial<Patient> = {};
      if (done !== undefined) confirmed[doneField] = updated[doneField];
      if (note !== undefined) confirmed[noteField] = updated[noteField] ?? null;
      applyChange(confirmed);
      // Con otro guardado en curso, recargar ahora traería datos que todavía no lo incluyen
      // (este todavía cuenta como en curso).
      const pendingSaves = queryClient.isMutating({
        mutationKey: [UPDATE_PATIENT_MAINTENANCE_KEY, patientUuid],
      });
      if (pendingSaves <= 1) void queryClient.invalidateQueries({ queryKey: patientKey });
      void queryClient.invalidateQueries({ queryKey: [FETCH_PATIENTS_KEY] });
      void queryClient.invalidateQueries({
        queryKey: [FETCH_PATIENT_ACTIVITY_KEY],
      });

      if (field === MaintenanceField.DONE) callbacks.onDoneSaved?.();
      else callbacks.onNoteSaved?.(confirmed[noteField] ?? null);
    },
    onError: (
      error: Error,
      { note }: UpdatePatientMaintenanceVariables,
      context?: { previous: Partial<Patient> },
    ) => {
      if (context) applyChange(context.previous);
      if (field === MaintenanceField.NOTE) {
        callbacks.onNoteFailed?.(note ?? null);
        toast.error(error.message, {
          description: note
            ? t(TEXT.PATIENTS.FLAGS.MAINTENANCE.NOTE_UNSAVED_TOAST, {
                number: maintenanceNumber,
                note,
              })
            : undefined,
        });
        return;
      }
      toast.error(error.message);
    },
  });

  const { mutate: executeUpdateDone } = useApiMutation(buildMutationOptions(MaintenanceField.DONE));
  const { mutate: executeUpdateNote } = useApiMutation(buildMutationOptions(MaintenanceField.NOTE));
  const isSavingDone = useIsMutating({ mutationKey: buildMutationKey(MaintenanceField.DONE) }) > 0;
  const isSavingNote = useIsMutating({ mutationKey: buildMutationKey(MaintenanceField.NOTE) }) > 0;

  return {
    saveDone: (done: boolean) => executeUpdateDone({ done }),
    saveNote: (note: string | null) => executeUpdateNote({ note }),
    isSavingDone,
    isSavingNote,
  };
}
