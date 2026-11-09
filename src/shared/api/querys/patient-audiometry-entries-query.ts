import { useQueries, useQuery } from '@tanstack/react-query';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import {
  AudiometryEntry,
  AudiometryEntryListItem,
  AudiometryType,
} from '@/types/patients/audiometry-entry';

export const FETCH_AUDIOMETRY_ENTRIES_KEY = 'fetchAudiometryEntries';
export const FETCH_AUDIOMETRY_ENTRY_KEY = 'fetchAudiometryEntry';
export const FETCH_AUDIOMETRY_TYPES_KEY = 'fetchAudiometryTypes';

const STALE_TIME_MS = 1000 * 60 * 2;

/** Los tipos casi no cambian: se piden una vez por sesión. */
export function useAudiometryTypesQuery() {
  return useQuery({
    queryKey: [FETCH_AUDIOMETRY_TYPES_KEY],
    queryFn: () => ApiServiceClient(env.API.MEDICAL_RECORDS_URL).get<AudiometryType[]>('/audiometry-types'),
    staleTime: Infinity,
  });
}

/** El API devuelve la lista con la más reciente primero. */
export function useAudiometryEntriesQuery(patientUuid: string) {
  return useQuery({
    queryKey: [FETCH_AUDIOMETRY_ENTRIES_KEY, patientUuid],
    queryFn: () =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).get<AudiometryEntryListItem[]>(
        `/patients/${patientUuid}/audiometry-entries`,
      ),
    enabled: !!patientUuid,
    staleTime: STALE_TIME_MS,
  });
}

export function useAudiometryEntryQuery(patientUuid: string, entryUuid: string | null) {
  return useQuery({
    queryKey: [FETCH_AUDIOMETRY_ENTRY_KEY, patientUuid, entryUuid],
    queryFn: () =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).get<AudiometryEntry>(
        `/patients/${patientUuid}/audiometry-entries/${entryUuid}`,
      ),
    enabled: !!patientUuid && !!entryUuid,
    // Una audiometría guardada no se edita: no hay por qué volver a pedirla.
    staleTime: Infinity,
  });
}

/** Detalle de varias audiometrías a la vez (el resumen puede incluir más de una). */
export function useAudiometryEntriesDetailQueries(patientUuid: string, entryUuids: string[]) {
  return useQueries({
    queries: entryUuids.map((entryUuid) => ({
      queryKey: [FETCH_AUDIOMETRY_ENTRY_KEY, patientUuid, entryUuid],
      queryFn: () =>
        ApiServiceClient(env.API.MEDICAL_RECORDS_URL).get<AudiometryEntry>(
          `/patients/${patientUuid}/audiometry-entries/${entryUuid}`,
        ),
      enabled: !!patientUuid,
      staleTime: Infinity,
    })),
  });
}
