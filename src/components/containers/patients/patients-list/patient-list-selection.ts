import { NextAppointmentKind, PatientListFilters } from '@/shared/api/querys/patients-query';
import { PatientFlag, PatientStatus } from '@/types/patients/patient';

/** Filtros que aplica cada tarjeta del resumen. */
export interface PatientListPreset {
  months?: string[];
  kinds?: NextAppointmentKind[];
  types?: string[];
  flags?: string[];
}

/** Filtros elegidos en la lista; las tarjetas del resumen cuentan sobre ellos. */
export interface PatientListSelection {
  search: string;
  statuses: string[];
  branches: string[];
  months: string[];
  kinds: string[];
  types: string[];
  flags: string[];
}

const isSameList = (first: string[], second: string[]) =>
  first.length === second.length && first.every((value) => second.includes(value));

/**
 * Lo que la tarjeta define reemplaza al filtro manual (no tiene sentido contar
 * "tentativas" dentro de "confirmadas"); los indicadores se suman porque cada
 * uno es una condición aparte.
 */
export function applyPresetTo(
  selection: PatientListSelection,
  preset: PatientListPreset,
): PatientListSelection {
  return {
    ...selection,
    months: preset.months ?? selection.months,
    kinds: preset.kinds ?? selection.kinds,
    types: preset.types ?? selection.types,
    flags: Array.from(new Set([...selection.flags, ...(preset.flags ?? [])])),
  };
}

/** Quita de la selección solo lo que puso la tarjeta. */
export function removePresetFrom(
  selection: PatientListSelection,
  preset: PatientListPreset,
): PatientListSelection {
  return {
    ...selection,
    months: preset.months ? [] : selection.months,
    kinds: preset.kinds ? [] : selection.kinds,
    types: preset.types ? [] : selection.types,
    flags: selection.flags.filter((flag) => !preset.flags?.includes(flag)),
  };
}

export function isPresetApplied(selection: PatientListSelection, preset: PatientListPreset) {
  return (
    (!preset.months || isSameList(selection.months, preset.months)) &&
    (!preset.kinds || isSameList(selection.kinds, preset.kinds)) &&
    (!preset.types || isSameList(selection.types, preset.types)) &&
    (preset.flags ?? []).every((flag) => selection.flags.includes(flag))
  );
}

export function toPatientListFilters(selection: PatientListSelection): PatientListFilters {
  return {
    statuses: selection.statuses as PatientStatus[],
    branchUuids: selection.branches,
    appointmentTypeUuids: selection.types,
    hearingAidsInLab: selection.flags.includes(PatientFlag.HEARING_AIDS_IN_LAB),
    hasActiveWarranty: selection.flags.includes(PatientFlag.ACTIVE_WARRANTY),
    isVideoCandidate: selection.flags.includes(PatientFlag.VIDEO_CANDIDATE),
    warrantyExpired: selection.flags.includes(PatientFlag.WARRANTY_EXPIRED),
    renewPrescription: selection.flags.includes(PatientFlag.RENEW_PRESCRIPTION),
    nextAppointmentKinds: selection.kinds as NextAppointmentKind[],
  };
}
