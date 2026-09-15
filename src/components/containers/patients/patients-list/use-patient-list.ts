import { useState, useEffect } from 'react';
import { usePatientsQuery, PatientStatusFilter } from '@/shared/api/querys/patients-query';
import { useNavigation } from '@/hooks/use-navigation';

const PAGE_SIZE = 10;

export const STATUS_FILTER_OPTIONS: { label: string; value: PatientStatusFilter }[] = [
  { label: 'Activos', value: PatientStatusFilter.ACTIVE },
  { label: 'Inactivos', value: PatientStatusFilter.INACTIVE },
  { label: 'Todos', value: PatientStatusFilter.ALL },
];

export function usePatientList() {
  const navigation = useNavigation();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<PatientStatusFilter>(
    PatientStatusFilter.ACTIVE,
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading, isError, refetch } = usePatientsQuery(
    page,
    PAGE_SIZE,
    debouncedSearch,
    statusFilter,
  );

  const handleStatusFilter = (value: PatientStatusFilter) => {
    setStatusFilter(value);
    setPage(1);
  };

  const hasActiveFilters =
    debouncedSearch.trim().length > 0 || statusFilter !== PatientStatusFilter.ACTIVE;

  return {
    patients: data?.data ?? [],
    meta: data?.meta,
    searchTerm,
    statusFilter,
    isLoading,
    isError,
    page,
    hasActiveFilters,
    setSearchTerm,
    handleStatusFilter,
    handlePageChange: setPage,
    handleRetry: refetch,
    navigateToCreate: navigation.patients.create,
    navigateToDetail: navigation.patients.detail,
    navigateToEdit: navigation.patients.edit,
  };
}
