import { useMemo, useState, useEffect } from 'react';
import { usePatientsQuery, PatientStatusFilter } from '@/shared/api/querys/patients-query';
import { useAppointmentMonthsQuery } from '@/shared/api/querys/appointment-months-query';
import { useNavigation } from '@/hooks/use-navigation';
import { formatMonthLabel } from '@/shared/utils/formatters';

const PAGE_SIZE_DEFAULT = 7;
const PAGE_SIZE_FILTERED = 10;
export const ALL_VALUE = 'all';

export function usePatientList() {
  const navigation = useNavigation();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [appointmentMonthFilter, setAppointmentMonthFilter] = useState<string>(ALL_VALUE);

  const { data: scheduledMonths } = useAppointmentMonthsQuery();

  const appointmentMonthOptions = useMemo(
    () => [
      { label: 'Todos', value: ALL_VALUE },
      ...(scheduledMonths?.months ?? []).map((monthKey) => ({
        label: formatMonthLabel(monthKey),
        value: monthKey,
      })),
    ],
    [scheduledMonths],
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

  const hasActiveFilters = debouncedSearch.trim().length > 0 || !!nextAppointmentMonth;
  const pageSize = hasActiveFilters ? PAGE_SIZE_FILTERED : PAGE_SIZE_DEFAULT;

  const { data, isLoading, isError, refetch } = usePatientsQuery(
    page,
    pageSize,
    debouncedSearch,
    PatientStatusFilter.ALL,
    nextAppointmentMonth,
  );

  const handleAppointmentMonthFilter = (value: string) => {
    setAppointmentMonthFilter(value);
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
    isLoading,
    isError,
    page,
    hasActiveFilters,
    setSearchTerm,
    handleAppointmentMonthFilter,
    handlePageChange: setPage,
    handleRetry: refetch,
    navigateToCreate: navigation.patients.create,
    navigateToDetail: navigation.patients.detail,
    navigateToEdit: navigation.patients.edit,
  };
}
