import type {
  AudiometryPayload,
  ScreeningPayload,
} from '@/components/containers/patients/patient-audiometry/audiometry-payload';
import type {
  AudiometryTypeCode,
  ScreeningResult,
} from '@/components/containers/patients/patient-audiometry/audiometry-constants';

import type { EquipmentSummary } from '@/types/equipment/equipment';

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
  typeCode: AudiometryTypeCode;
  typeName: string;
  /** Solo en rastreo; en clínica es null. */
  screeningResult: ScreeningResult | null;
  ptaType: string | null;
  gradingScale: string | null;
  ptaRight: number | null;
  ptaLeft: number | null;
  equipment?: EquipmentSummary | null;
}

interface AudiometryEntryBase extends AudiometryInvalidation {
  uuid: string;
  patientUuid: string;
  schemaVersion: number;
  typeName: string;
  createdAt: string;
  createdByUuid: string | null;
  createdByName: string | null;
  /** Audiómetro usado; null en las audiometrías anteriores a los equipos. */
  equipment: EquipmentSummary | null;
}

export interface ClinicalAudiometryEntry extends AudiometryEntryBase {
  typeCode: AudiometryTypeCode.CLINICAL;
  payload: AudiometryPayload;
}

export interface ScreeningAudiometryEntry extends AudiometryEntryBase {
  typeCode: AudiometryTypeCode.SCREENING;
  payload: ScreeningPayload;
}

/** Unión discriminada por `typeCode`: el cuerpo cambia según el tipo. */
export type AudiometryEntry = ClinicalAudiometryEntry | ScreeningAudiometryEntry;

/** Tipo de audiometría que ofrece el API; `name` es lo que se muestra. */
export interface AudiometryType {
  code: AudiometryTypeCode;
  name: string;
}
