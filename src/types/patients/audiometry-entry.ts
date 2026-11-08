import type { AudiometryPayload } from '@/components/containers/patients/patient-audiometry/audiometry-payload';

export const AUDIOMETRY_SCHEMA_VERSION = 1;

/** Marca de "mal hecha": todo null mientras la audiometría no se ha marcado. */
export interface AudiometryInvalidation {
  invalidatedAt: string | null;
  invalidatedByUuid: string | null;
  invalidatedByName: string | null;
  invalidationReason: string | null;
}

export const INVALIDATION_REASON_MAX_LENGTH = 500;

export interface AudiometryEntryListItem extends AudiometryInvalidation {
  uuid: string;
  createdAt: string;
  createdByUuid: string | null;
  createdByName: string | null;
  ptaType: string | null;
  gradingScale: string | null;
  ptaRight: number | null;
  ptaLeft: number | null;
}

export interface AudiometryEntry extends AudiometryInvalidation {
  uuid: string;
  patientUuid: string;
  schemaVersion: number;
  payload: AudiometryPayload;
  createdAt: string;
  createdByUuid: string | null;
  createdByName: string | null;
}
