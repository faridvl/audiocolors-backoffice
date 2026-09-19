import { useState, useEffect } from 'react';
import { usePatientsQuery, PatientStatusFilter } from '@/shared/api/querys/patients-query';
import { useNavigation } from '@/hooks/use-navigation';

const PAGE_SIZE_DEFAULT = 7;
const PAGE_SIZE_FILTERED = 10;
export const ALL_VALUE = 'all';

export const MONTH_FILTER_OPTIONS: { label: string; value: string }[] = [
  { label: 'Todos', value: ALL_VALUE },
  { label: 'Enero', value: '01' },
  { label: 'Febrero', value: '02' },
  { label: 'Marzo', value: '03' },
  { label: 'Abril', value: '04' },
  { label: 'Mayo', value: '05' },
  { label: 'Junio', value: '06' },
  { label: 'Julio', value: '07' },
  { label: 'Agosto', value: '08' },
  { label: 'Septiembre', value: '09' },
  { label: 'Octubre', value: '10' },
  { label: 'Noviembre', value: '11' },
  { label: 'Diciembre', value: '12' },
];

// Las citas son siempre futuras: alcanza con el año actual y unos pocos
// próximos, no hace falta ofrecer años pasados.
const YEARS_AHEAD = 3;

function buildYearOptions(): { label: string; value: string }[] {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: YEARS_AHEAD + 1 }, (_, index) =>
    String(currentYear + index),
  );

  return [{ label: 'Todos', value: ALL_VALUE }, ...years.map((year) => ({ label: year, value: year }))];
}

export const YEAR_FILTER_OPTIONS = buildYearOptions();

export function usePatientList() {
  const navigation = useNavigation();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [monthFilter, setMonthFilter] = useState<string>(ALL_VALUE);
  const [yearFilter, setYearFilter] = useState<string>(ALL_VALUE);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Si se elige mes sin año, se asume el año actual sin reflejarlo en el
  // selector: el usuario no lo eligió, así que no debe verse como un
  // filtro activo (no se vuelve badge).
  const nextAppointmentMonth =
    monthFilter !== ALL_VALUE
      ? `${yearFilter !== ALL_VALUE ? yearFilter : new Date().getFullYear()}-${monthFilter}`
      : undefined;

  const hasActiveFilters = debouncedSearch.trim().length > 0 || !!nextAppointmentMonth;
  const pageSize = hasActiveFilters ? PAGE_SIZE_FILTERED : PAGE_SIZE_DEFAULT;

  const { data, isLoading, isError, refetch } = usePatientsQuery(
    page,
    pageSize,
    debouncedSearch,
    PatientStatusFilter.ALL,
    nextAppointmentMonth,
  );

  const handleMonthFilter = (value: string) => {
    setMonthFilter(value);
    setPage(1);
  };

  const handleYearFilter = (value: string) => {
    setYearFilter(value);
    setPage(1);
  };

  return {
    patients: data?.data ?? [],
    // Con el filtro de próxima cita, el API devuelve todo en una sola página
    // (meta.totalPages: 1): la paginación se oculta sola porque totalPages <= 1.
    meta: data?.meta,
    searchTerm,
    monthFilter,
    yearFilter,
    isLoading,
    isError,
    page,
    hasActiveFilters,
    setSearchTerm,
    handleMonthFilter,
    handleYearFilter,
    handlePageChange: setPage,
    handleRetry: refetch,
    navigateToCreate: navigation.patients.create,
    navigateToDetail: navigation.patients.detail,
    navigateToEdit: navigation.patients.edit,
  };
}
