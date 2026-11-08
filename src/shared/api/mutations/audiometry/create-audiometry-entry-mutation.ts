import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { FETCH_AUDIOMETRY_ENTRIES_KEY } from '@/shared/api/querys/patient-audiometry-entries-query';
import { TEXT } from '@/static/texts/i18n';
import type { AudiometryPayload } from '@/components/containers/patients/patient-audiometry/audiometry-payload';
import { AUDIOMETRY_SCHEMA_VERSION, AudiometryEntry } from '@/types/patients/audiometry-entry';

interface CreateAudiometryEntryVariables {
  patientUuid: string;
  payload: AudiometryPayload;
}

interface CreateAudiometryEntryOptions {
  onCreated?: (entry: AudiometryEntry) => void;
}

export function useCreateAudiometryEntryMutation({ onCreated }: CreateAudiometryEntryOptions = {}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { mutate: executeCreateEntry, isPending } = useApiMutation<
    AudiometryEntry,
    CreateAudiometryEntryVariables
  >({
    mutationKey: ['createAudiometryEntry'],
    mutationFn: ({ patientUuid, payload }) =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).post<AudiometryEntry>(
        `/patients/${patientUuid}/audiometry-entries`,
        { schemaVersion: AUDIOMETRY_SCHEMA_VERSION, payload },
      ),
    onSuccess: async (entry, { patientUuid }) => {
      toast.success(t(TEXT.PATIENTS.DETAIL.AUDIOMETRY.SAVED));
      // La lista se espera para que la recién guardada ya esté en el selector al seleccionarla.
      await queryClient.invalidateQueries({
        queryKey: [FETCH_AUDIOMETRY_ENTRIES_KEY, patientUuid],
      });
      onCreated?.(entry);
    },
    onError: (error) => toast.error(error.message),
  });

  return { executeCreateEntry, isPending };
}
