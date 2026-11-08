import type { AudiometryPayload } from '@/components/containers/patients/patient-audiometry/audiometry-payload';

export const AUDIOMETRY_SCHEMA_VERSION = 1;

export interface AudiometryEntryListItem {
  uuid: string;
  createdAt: string;
  createdByUuid: string | null;
  createdByName: string | null;
  ptaRight: number | null;
  ptaLeft: number | null;
}

export interface AudiometryEntry {
  uuid: string;
  patientUuid: string;
  schemaVersion: number;
  payload: AudiometryPayload;
  createdAt: string;
  createdByUuid: string | null;
  createdByName: string | null;
}
