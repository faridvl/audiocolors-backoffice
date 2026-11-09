import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { ApiError, ApiServiceClient, HttpStatus } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import {
  FETCH_AUDIOMETRY_ENTRIES_KEY,
  FETCH_AUDIOMETRY_ENTRY_KEY,
} from '@/shared/api/querys/patient-audiometry-entries-query';
import { TEXT } from '@/static/texts/i18n';
import { AudiometryEntry } from '@/types/patients/audiometry-entry';

interface InvalidateAudiometryEntryVariables {
  patientUuid: string;
  entryUuid: string;
  reason: string;
}

interface InvalidateAudiometryEntryOptions {
  onInvalidated?: () => void;
}

export function useInvalidateAudiometryEntryMutation({
  onInvalidated,
}: InvalidateAudiometryEntryOptions = {}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const refreshEntry = async (patientUuid: string, entryUuid: string) => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: [FETCH_AUDIOMETRY_ENTRIES_KEY, patientUuid],
      }),
      queryClient.invalidateQueries({
        queryKey: [FETCH_AUDIOMETRY_ENTRY_KEY, patientUuid, entryUuid],
      }),
    ]);
  };

  const { mutate: executeInvalidateEntry, isPending } = useApiMutation<
    AudiometryEntry,
    InvalidateAudiometryEntryVariables
  >({
    mutationKey: ['invalidateAudiometryEntry'],
    mutationFn: ({ patientUuid, entryUuid, reason }) =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).post<AudiometryEntry>(
        `/patients/${patientUuid}/audiometry-entries/${entryUuid}/invalidate`,
        { reason },
      ),
    onSuccess: async (_entry, { patientUuid, entryUuid }) => {
      toast.success(t(TEXT.PATIENTS.DETAIL.AUDIOMETRY.INVALIDATE.SUCCESS));
      await refreshEntry(patientUuid, entryUuid);
      onInvalidated?.();
    },
    onError: async (error, { patientUuid, entryUuid }) => {
      const isAlreadyMarked = error instanceof ApiError && error.status === HttpStatus.CONFLICT;
      if (!isAlreadyMarked) {
        toast.error(error.message);
        return;
      }
      // Otra persona ya la marcó: se avisa y se refresca para mostrar la marca real.
      toast.error(t(TEXT.PATIENTS.DETAIL.AUDIOMETRY.INVALIDATE.ALREADY_MARKED));
      await refreshEntry(patientUuid, entryUuid);
      onInvalidated?.();
    },
  });

  return { executeInvalidateEntry, isPending };
}
