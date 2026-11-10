import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { ApiError, ApiServiceClient } from '@/shared/api/api-service-client';
import { EQUIPMENT_REQUIRED_ERROR_CODE } from '@/types/equipment/equipment';
import { env } from '@/shared/api/config';
import { FETCH_PATIENT_ACTIVITY_KEY } from '@/shared/api/querys/patient-activity-query';
import { FETCH_AUDIOMETRY_ENTRIES_KEY } from '@/shared/api/querys/patient-audiometry-entries-query';
import { FETCH_PATIENT_NOTES_KEY } from '@/shared/api/querys/patient-notes-query';
import { TEXT } from '@/static/texts/i18n';
import type {
  AudiometryPayload,
  ScreeningPayload,
} from '@/components/containers/patients/patient-audiometry/audiometry-payload';
import { AudiometryTypeCode } from '@/components/containers/patients/patient-audiometry/audiometry-constants';
import { AUDIOMETRY_SCHEMA_VERSION, AudiometryEntry } from '@/types/patients/audiometry-entry';

type CreateAudiometryEntryVariables = {
  patientUuid: string;
  equipmentUuid?: string;
} & (
  | { typeCode: AudiometryTypeCode.CLINICAL; payload: AudiometryPayload }
  | { typeCode: AudiometryTypeCode.SCREENING; payload: ScreeningPayload }
);

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
    mutationFn: ({ patientUuid, typeCode, payload, equipmentUuid }) =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).post<AudiometryEntry>(
        `/patients/${patientUuid}/audiometry-entries`,
        {
          typeCode,
          schemaVersion: AUDIOMETRY_SCHEMA_VERSION,
          payload,
          equipmentUuid,
        },
      ),
    onSuccess: async (entry, { patientUuid }) => {
      toast.success(t(TEXT.PATIENTS.DETAIL.AUDIOMETRY.SAVED));
      // La lista se espera para que la recién guardada ya esté en el selector al seleccionarla.
      await queryClient.invalidateQueries({
        queryKey: [FETCH_AUDIOMETRY_ENTRIES_KEY, patientUuid],
      });
      // El API deja una nota de "Se realizó audiometría" en Control de evolución.
      void queryClient.invalidateQueries({
        queryKey: [FETCH_PATIENT_NOTES_KEY, patientUuid],
      });
      void queryClient.invalidateQueries({
        queryKey: [FETCH_PATIENT_ACTIVITY_KEY],
      });
      onCreated?.(entry);
    },
    onError: (error) => {
      const isEquipmentMissing =
        error instanceof ApiError && error.code === EQUIPMENT_REQUIRED_ERROR_CODE;
      toast.error(
        isEquipmentMissing ? t(TEXT.PATIENTS.DETAIL.AUDIOMETRY.EQUIPMENT_REQUIRED) : error.message,
      );
    },
  });

  return { executeCreateEntry, isPending };
}
