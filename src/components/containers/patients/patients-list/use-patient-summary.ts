import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  NextAppointmentKind,
  PatientStatusFilter,
  usePatientsQuery,
} from '@/shared/api/querys/patients-query';
import { useAppointmentTypesQuery } from '@/shared/api/querys/appointment-types-query';
import { useIsDesktop } from '@/hooks/use-is-desktop';
import { toDayKey, toMonthKey } from '@/shared/utils/dates';
import { TEXT } from '@/static/texts/i18n';
import { PatientFlag } from '@/types/patients/patient';
import {
  PatientListPreset,
  PatientListSelection,
  applyPresetTo,
  toPatientListFilters,
} from './patient-list-selection';

/** Con limit 1 la consulta solo trae el total: es lo único que muestra la tarjeta. */
const COUNT_LIMIT = 1;

/**
 * Nombre del tipo de cita de los controles. Los tipos son datos de la clínica,
 * así que se busca por nombre; si no existe, la tarjeta no se muestra.
 */
const CONTROL_TYPE_NAME = 'control';

export interface PatientSummaryCard {
  key: string;
  label: string;
  count?: number;
  preset: PatientListPreset;
}

/** Cuenta los pacientes que mostraría la lista al tocar la tarjeta, con los filtros actuales. */
function useCount(selection: PatientListSelection, preset: PatientListPreset, isEnabled: boolean) {
  const cardSelection = applyPresetTo(selection, preset);
  const { data } = usePatientsQuery(
    1,
    COUNT_LIMIT,
    cardSelection.search,
    PatientStatusFilter.ALL,
    cardSelection.months,
    toPatientListFilters(cardSelection),
    isEnabled,
  );
  return data?.meta.total;
}

/** Resumen sobre la lista de pacientes. Solo en escritorio: en el celular ni se consulta. */
export function usePatientSummary(selection: PatientListSelection) {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  const { data: appointmentTypes } = useAppointmentTypesQuery();
  const currentMonth = toMonthKey(toDayKey(new Date()));

  const controlTypeUuid = appointmentTypes?.find(
    (type) => type.name.trim().toLowerCase() === CONTROL_TYPE_NAME,
  )?.uuid;

  const presets = useMemo(
    () => ({
      confirmed: { months: [currentMonth], kinds: [NextAppointmentKind.CONFIRMED] },
      tentative: { months: [currentMonth], kinds: [NextAppointmentKind.TENTATIVE] },
      controls: { months: [currentMonth], types: controlTypeUuid ? [controlTypeUuid] : [] },
      hearingAids: { flags: [PatientFlag.HEARING_AIDS_IN_LAB] },
    }),
    [currentMonth, controlTypeUuid],
  );

  const confirmedCount = useCount(selection, presets.confirmed, isDesktop);
  const tentativeCount = useCount(selection, presets.tentative, isDesktop);
  const controlsCount = useCount(
    selection,
    presets.controls,
    isDesktop && Boolean(controlTypeUuid),
  );
  const hearingAidsCount = useCount(selection, presets.hearingAids, isDesktop);

  const cards: PatientSummaryCard[] = [
    {
      key: 'tentative',
      label: t(TEXT.PATIENTS.SUMMARY.TENTATIVE),
      count: tentativeCount,
      preset: presets.tentative,
    },
    {
      key: 'confirmed',
      label: t(TEXT.PATIENTS.SUMMARY.CONFIRMED),
      count: confirmedCount,
      preset: presets.confirmed,
    },
    ...(controlTypeUuid
      ? [
          {
            key: 'controls',
            label: t(TEXT.PATIENTS.SUMMARY.CONTROLS),
            count: controlsCount,
            preset: presets.controls,
          },
        ]
      : []),
    {
      key: 'hearingAids',
      label: t(TEXT.PATIENTS.SUMMARY.HEARING_AIDS),
      count: hearingAidsCount,
      preset: presets.hearingAids,
    },
  ];

  return { cards };
}
