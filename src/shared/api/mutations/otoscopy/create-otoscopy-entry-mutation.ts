import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { FETCH_PATIENT_ACTIVITY_KEY } from '@/shared/api/querys/patient-activity-query';
import { FETCH_OTOSCOPY_ENTRIES_KEY } from '@/shared/api/querys/patient-otoscopy-entries-query';
import { FETCH_PATIENT_NOTES_KEY } from '@/shared/api/querys/patient-notes-query';
import { TEXT } from '@/static/texts/i18n';
import { OtoscopyEntry, OtoscopyEntryPayload } from '@/types/patients/otoscopy-entry';

interface CreateOtoscopyEntryVariables {
  patientUuid: string;
  entry: OtoscopyEntryPayload;
}

/** El API deja la otoscopia como nota de Control de evolución, por eso se refresca esa lista. */
export function useCreateOtoscopyEntryMutation() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { mutate: executeCreateEntry, isPending } = useApiMutation<
    OtoscopyEntry,
    CreateOtoscopyEntryVariables
  >({
    mutationKey: ['createOtoscopyEntry'],
    mutationFn: ({ patientUuid, entry }) =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).post<OtoscopyEntry>(
        `/patients/${patientUuid}/otoscopy-entries`,
        entry,
      ),
    onSuccess: (_entry, { patientUuid }) => {
      toast.success(t(TEXT.PATIENTS.PHYSICAL_EXAM.SAVED));
      void queryClient.invalidateQueries({ queryKey: [FETCH_PATIENT_NOTES_KEY, patientUuid] });
      void queryClient.invalidateQueries({ queryKey: [FETCH_OTOSCOPY_ENTRIES_KEY, patientUuid] });
      void queryClient.invalidateQueries({ queryKey: [FETCH_PATIENT_ACTIVITY_KEY] });
    },
    onError: (error) => toast.error(error.message),
  });

  return { executeCreateEntry, isPending };
}
