import { useMemo, useState, useEffect } from 'react';
import { usePatientsQuery, PatientStatusFilter } from '@/shared/api/querys/patients-query';
import { useAppointmentMonthsQuery } from '@/shared/api/querys/appointment-months-query';
import { useBranchesQuery } from '@/shared/api/querys/branches-query';
import { useAppointmentTypesQuery } from '@/shared/api/querys/appointment-types-query';
import { useNavigation } from '@/hooks/use-navigation';
import { buildMonthOption } from '@/shared/utils/formatters';
import { PatientStatus } from '@/types/patients/patient';

const PAGE_SIZE_DEFAULT = 7;
const PAGE_SIZE_FILTERED = 10;
export const ALL_VALUE = 'all';

/** El listado arranca mostrando solo pacientes activos. */
export const DEFAULT_STATUS_FILTER = PatientStatus.ACTIVE;

/** Etiquetas del filtro, en plural: se filtran grupos de pacientes. */
const STATUS_FILTER_LABELS: Record<PatientStatus, string> = {
  [PatientStatus.ACTIVE]: 'Activos',
  [PatientStatus.INACTIVE]: 'Inactivos',
  [PatientStatus.DECEASED]: 'Fallecidos',
};

export function usePatientList() {
  const navigation = useNavigation();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [appointmentMonthFilter, setAppointmentMonthFilter] = useState<string>(ALL_VALUE);
  const [statusFilter, setStatusFilter] = useState<string>(DEFAULT_STATUS_FILTER);
  const [branchFilter, setBranchFilter] = useState<string>(ALL_VALUE);
  const [appointmentTypeFilter, setAppointmentTypeFilter] = useState<string>(ALL_VALUE);

  const { data: scheduledMonths } = useAppointmentMonthsQuery();
  const { data: branches } = useBranchesQuery();
  const { data: appointmentTypes } = useAppointmentTypesQuery();

  const appointmentMonthOptions = useMemo(
    () => [
      { label: 'Todos los meses', value: ALL_VALUE },
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
      ...(branches ?? []).map((branch) => ({ label: branch.name, value: branch.uuid })),
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const nextAppointmentMonth =
    appointmentMonthFilter !== ALL_VALUE ? appointmentMonthFilter : undefined;

  const filters = useMemo(
    () => ({
      status: statusFilter !== ALL_VALUE ? (statusFilter as PatientStatus) : undefined,
      branchUuid: branchFilter !== ALL_VALUE ? branchFilter : undefined,
      appointmentTypeUuid: appointmentTypeFilter !== ALL_VALUE ? appointmentTypeFilter : undefined,
    }),
    [statusFilter, branchFilter, appointmentTypeFilter],
  );

  // El estado por defecto (activos) no cuenta como filtro: con él, una lista
  // vacía es "aún no hay pacientes" y no "sin resultados".
  const hasActiveFilters =
    debouncedSearch.trim().length > 0 ||
    !!nextAppointmentMonth ||
    statusFilter !== DEFAULT_STATUS_FILTER ||
    !!filters.branchUuid ||
    !!filters.appointmentTypeUuid;
  const pageSize = hasActiveFilters ? PAGE_SIZE_FILTERED : PAGE_SIZE_DEFAULT;

  const { data, isLoading, isError, refetch } = usePatientsQuery(
    page,
    pageSize,
    debouncedSearch,
    PatientStatusFilter.ALL,
    nextAppointmentMonth,
    filters,
  );

  const withPageReset = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };

  return {
    patients: data?.data ?? [],
    // Con el filtro de próxima cita, el API devuelve todo en una sola página
    // (meta.totalPages: 1): la paginación se oculta sola porque totalPages <= 1.
    meta: data?.meta,
    searchTerm,
    appointmentMonthFilter,
    appointmentMonthOptions,
    statusFilter,
    statusOptions,
    branchFilter,
    branchOptions,
    appointmentTypeFilter,
    appointmentTypeOptions,
    isLoading,
    isError,
    page,
    hasActiveFilters,
    setSearchTerm,
    handleAppointmentMonthFilter: withPageReset(setAppointmentMonthFilter),
    handleStatusFilter: withPageReset(setStatusFilter),
    handleBranchFilter: withPageReset(setBranchFilter),
    handleAppointmentTypeFilter: withPageReset(setAppointmentTypeFilter),
    handlePageChange: setPage,
    handleRetry: refetch,
    navigateToCreate: navigation.patients.create,
    navigateToDetail: navigation.patients.detail,
    navigateToEdit: navigation.patients.edit,
  };
}
