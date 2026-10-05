import { useEffect, useState } from 'react';
import { PatientStatusFilter, usePatientsQuery } from '@/shared/api/querys/patients-query';
import { PatientStatus } from '@/types/patients/patient';

/** Letras mínimas antes de buscar: con una sola vuelve media base. */
const MIN_SEARCH_LENGTH = 2;
const RESULT_LIMIT = 8;

export function usePatientPicker() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const hasEnoughText = debouncedSearch.length >= MIN_SEARCH_LENGTH;

  // Sin texto suficiente la búsqueda vuelve la primera página del listado;
  // se pide igual (es la misma consulta cacheada del listado) y se oculta.
  const { data, isFetching } = usePatientsQuery(
    1,
    RESULT_LIMIT,
    hasEnoughText ? debouncedSearch : '',
    PatientStatusFilter.ALL,
    undefined,
    { status: PatientStatus.ACTIVE },
  );

  return {
    searchTerm,
    setSearchTerm,
    hasEnoughText,
    isSearching: isFetching,
    patients: hasEnoughText ? (data?.data ?? []) : [],
  };
}
