import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { ApiError, ApiServiceClient, HttpStatus } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { FETCH_OTOSCOPY_ENTRIES_KEY } from '@/shared/api/querys/otoscopy-entries-query';
import { FETCH_PATIENT_ACTIVITY_KEY } from '@/shared/api/querys/patient-activity-query';
import { TEXT } from '@/static/texts/i18n';
import { OtoscopyEntry, OtoscopyEntryPayload } from '@/types/patients/otoscopy-entry';

interface UpdateOtoscopyEntryVariables {
  patientUuid: string;
  entryUuid: string;
  changes: OtoscopyEntryPayload;
}

/** Los avisos y el refresco viven aquí para que ocurran aunque el formulario ya se haya cerrado. */
export function useUpdateOtoscopyEntryMutation() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { mutate: executeUpdateEntry, isPending } = useApiMutation<
    OtoscopyEntry,
    UpdateOtoscopyEntryVariables
  >({
    mutationKey: ['updateOtoscopyEntry'],
    mutationFn: ({ patientUuid, entryUuid, changes }) =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).patch<OtoscopyEntry>(
        `/patients/${patientUuid}/otoscopy-entries/${entryUuid}`,
        changes,
      ),
    onSuccess: (_entry, { patientUuid }) => {
      toast.success(t(TEXT.PATIENTS.PHYSICAL_EXAM.CORRECTED_SAVED));
      void queryClient.invalidateQueries({ queryKey: [FETCH_OTOSCOPY_ENTRIES_KEY, patientUuid] });
      void queryClient.invalidateQueries({ queryKey: [FETCH_PATIENT_ACTIVITY_KEY] });
    },
    onError: (error, { patientUuid }) => {
      const isConflict = error instanceof ApiError && error.status === HttpStatus.CONFLICT;
      const isGone = error instanceof ApiError && error.status === HttpStatus.NOT_FOUND;
      // En el conflicto el formulario muestra el mensaje junto a lo escrito: el aviso lo repetiría.
      if (!isConflict) toast.error(error.message);
      // Si ya no es de hoy o no existe, la lista tiene que mostrarlo como quedó.
      if (isConflict || isGone) {
        void queryClient.invalidateQueries({
          queryKey: [FETCH_OTOSCOPY_ENTRIES_KEY, patientUuid],
        });
      }
    },
  });

  return { executeUpdateEntry, isPending };
}
