import { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  NextAppointmentKind,
  usePatientsQuery,
  PatientStatusFilter,
} from '@/shared/api/querys/patients-query';
import { useAppointmentMonthsQuery } from '@/shared/api/querys/appointment-months-query';
import { useBranchesQuery } from '@/shared/api/querys/branches-query';
import { useAppointmentTypesQuery } from '@/shared/api/querys/appointment-types-query';
import { useNavigation } from '@/hooks/use-navigation';
import { useRememberedState } from '@/hooks/use-remembered-state';
import { getBranchStripeColor } from '@/shared/design/tokens';
import { buildMonthOption } from '@/shared/utils/formatters';
import { TEXT } from '@/static/texts/i18n';
import { PatientFlag, PatientStatus } from '@/types/patients/patient';

const PAGE_SIZE_DEFAULT = 7;
const PAGE_SIZE_FILTERED = 10;
const SEARCH_DEBOUNCE_MS = 300;
export const ALL_VALUE = 'all';
/** Opción del filtro de próxima cita para quien no tiene cita ni mes anotado; el API la reconoce así. */
const NO_APPOINTMENT_VALUE = 'none';

/** El listado arranca mostrando solo pacientes activos. */
export const DEFAULT_STATUS_FILTER = [PatientStatus.ACTIVE];

/** Prefijo de las claves con que la lista recuerda sus filtros al volver. */
const MEMORY_KEY = 'patient-list';

/** Filtros que aplica cada tarjeta del resumen; lo que no trae vuelve a su valor inicial. */
export interface PatientListPreset {
  months?: string[];
  kinds?: NextAppointmentKind[];
  types?: string[];
  flags?: string[];
}

const KIND_LABELS: Record<NextAppointmentKind, string> = {
  [NextAppointmentKind.CONFIRMED]: 'Confirmada',
  [NextAppointmentKind.TENTATIVE]: 'Tentativa',
};

/** Etiquetas del filtro, en plural: se filtran grupos de pacientes. */
const STATUS_FILTER_LABELS: Record<PatientStatus, string> = {
  [PatientStatus.ACTIVE]: 'Activos',
  [PatientStatus.INACTIVE]: 'Inactivos',
  [PatientStatus.DECEASED]: 'Fallecidos',
};

export function usePatientList() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  // Los filtros se recuerdan al ir al expediente o a otra pantalla y volver.
  const [searchTerm, setSearchTerm] = useRememberedState(`${MEMORY_KEY}.search`, '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [page, setPage] = useRememberedState(`${MEMORY_KEY}.page`, 1);
  const [monthFilter, setMonthFilter] = useRememberedState<string[]>(`${MEMORY_KEY}.months`, []);
  const [statusFilter, setStatusFilter] = useRememberedState<string[]>(
    `${MEMORY_KEY}.statuses`,
    DEFAULT_STATUS_FILTER,
  );
  const [branchFilter, setBranchFilter] = useRememberedState<string[]>(
    `${MEMORY_KEY}.branches`,
    [],
  );
  const [appointmentTypeFilter, setAppointmentTypeFilter] = useRememberedState<string[]>(
    `${MEMORY_KEY}.types`,
    [],
  );
  const [flagFilter, setFlagFilter] = useRememberedState<string[]>(`${MEMORY_KEY}.flags`, []);
  const [kindFilter, setKindFilter] = useRememberedState<string[]>(`${MEMORY_KEY}.kinds`, []);

  const { data: scheduledMonths } = useAppointmentMonthsQuery();
  const { data: branches } = useBranchesQuery();
  const { data: appointmentTypes } = useAppointmentTypesQuery();

  const appointmentMonthOptions = useMemo(
    () => [
      { label: 'Todos los meses', value: ALL_VALUE },
      { label: 'Sin cita', value: NO_APPOINTMENT_VALUE },
      // Del más lejano al más cercano, igual que el filtro de mes de la
      // bitácora: el API los devuelve en orden ascendente.
      ...[...(scheduledMonths?.months ?? [])].sort().reverse().map(buildMonthOption),
    ],
    [scheduledMonths],
  );

  const statusOptions = useMemo(
    () => [
      { label: 'Todos', value: ALL_VALUE },
      ...Object.values(PatientStatus).map((status) => ({
        label: STATUS_FILTER_LABELS[status],
        value: status,
      })),
    ],
    [],
  );

  const branchOptions = useMemo(
    () => [
      { label: 'Todas', value: ALL_VALUE },
      ...(branches ?? []).map((branch) => ({
        label: branch.name,
        value: branch.uuid,
        accentColor: getBranchStripeColor(branch.name),
      })),
    ],
    [branches],
  );

  const appointmentTypeOptions = useMemo(
    () => [
      { label: 'Todos', value: ALL_VALUE },
      ...(appointmentTypes ?? []).map((type) => ({ label: type.name, value: type.uuid })),
    ],
    [appointmentTypes],
  );

  const flagOptions = useMemo(
    () => [
      { label: 'Todos', value: ALL_VALUE },
      ...Object.values(PatientFlag).map((flag) => ({
        label: t(`${TEXT.PATIENTS.FLAGS.LABEL_PREFIX}.${flag}`),
        value: flag,
      })),
    ],
    [t],
  );

  const kindOptions = useMemo(
    () => [
      { label: 'Todas', value: ALL_VALUE },
      ...Object.values(NextAppointmentKind).map((kind) => ({
        label: KIND_LABELS[kind],
        value: kind,
      })),
    ],
    [],
  );

  useEffect(() => {
    if (searchTerm === debouncedSearch) return;
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearch, setPage]);

  const filters = useMemo(
    () => ({
      statuses: statusFilter as PatientStatus[],
      branchUuids: branchFilter,
      appointmentTypeUuids: appointmentTypeFilter,
      hearingAidsInLab: flagFilter.includes(PatientFlag.HEARING_AIDS_IN_LAB),
      hasActiveWarranty: flagFilter.includes(PatientFlag.ACTIVE_WARRANTY),
      isVideoCandidate: flagFilter.includes(PatientFlag.VIDEO_CANDIDATE),
      nextAppointmentKinds: kindFilter as NextAppointmentKind[],
    }),
    [statusFilter, branchFilter, appointmentTypeFilter, flagFilter, kindFilter],
  );

  const isDefaultStatus =
    statusFilter.length === DEFAULT_STATUS_FILTER.length &&
    DEFAULT_STATUS_FILTER.every((status) => statusFilter.includes(status));

  // El estado por defecto (activos) no cuenta como filtro: con él, una lista
  // vacía es "aún no hay pacientes" y no "sin resultados".
  const hasActiveFilters =
    debouncedSearch.trim().length > 0 ||
    monthFilter.length > 0 ||
    !isDefaultStatus ||
    branchFilter.length > 0 ||
    appointmentTypeFilter.length > 0 ||
    flagFilter.length > 0 ||
    kindFilter.length > 0;
  const pageSize = hasActiveFilters ? PAGE_SIZE_FILTERED : PAGE_SIZE_DEFAULT;

  const { data, isLoading, isError, refetch } = usePatientsQuery(
    page,
    pageSize,
    debouncedSearch,
    PatientStatusFilter.ALL,
    monthFilter,
    filters,
  );

  const withPageReset = (setter: (values: string[]) => void) => (values: string[]) => {
    setter(values);
    setPage(1);
  };

  /** Una tarjeta del resumen reemplaza los filtros por los suyos, sobre los pacientes activos. */
  const applyPreset = (preset: PatientListPreset) => {
    setSearchTerm('');
    setDebouncedSearch('');
    setStatusFilter(DEFAULT_STATUS_FILTER);
    setBranchFilter([]);
    setMonthFilter(preset.months ?? []);
    setKindFilter(preset.kinds ?? []);
    setAppointmentTypeFilter(preset.types ?? []);
    setFlagFilter(preset.flags ?? []);
    setPage(1);
  };

  const isSameList = (first: string[], second: string[] = []) =>
    first.length === second.length && first.every((value) => second.includes(value));

  /** Si los filtros actuales son exactamente los de la tarjeta, para marcarla. */
  const isPresetActive = (preset: PatientListPreset) =>
    debouncedSearch.trim() === '' &&
    isDefaultStatus &&
    branchFilter.length === 0 &&
    isSameList(monthFilter, preset.months) &&
    isSameList(kindFilter, preset.kinds) &&
    isSameList(appointmentTypeFilter, preset.types) &&
    isSameList(flagFilter, preset.flags);

  return {
    patients: data?.data ?? [],
    // Con el filtro de próxima cita, el API devuelve todo en una sola página
    // (meta.totalPages: 1): la paginación se oculta sola porque totalPages <= 1.
    meta: data?.meta,
    searchTerm,
    monthFilter,
    appointmentMonthOptions,
    statusFilter,
    statusOptions,
    branchFilter,
    branchOptions,
    appointmentTypeFilter,
    appointmentTypeOptions,
    flagFilter,
    flagOptions,
    kindFilter,
    kindOptions,
    isLoading,
    isError,
    page,
    hasActiveFilters,
    setSearchTerm,
    handleMonthFilter: withPageReset(setMonthFilter),
    handleStatusFilter: withPageReset(setStatusFilter),
    handleBranchFilter: withPageReset(setBranchFilter),
    handleAppointmentTypeFilter: withPageReset(setAppointmentTypeFilter),
    handleFlagFilter: withPageReset(setFlagFilter),
    handleKindFilter: withPageReset(setKindFilter),
    applyPreset,
    isPresetActive,
    handlePageChange: setPage,
    handleRetry: refetch,
    navigateToCreate: navigation.patients.create,
    navigateToDetail: navigation.patients.detail,
    navigateToEdit: navigation.patients.edit,
  };
}
