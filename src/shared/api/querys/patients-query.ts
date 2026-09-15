import { useQuery } from '@tanstack/react-query';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { Patient } from '@/types/patients/patient';
import { PaginatedResponse } from '@/types/system/paginate.types';

export enum PatientStatusFilter {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ALL = 'all',
}

export const FETCH_PATIENTS_KEY = 'fetchPatients';

const PatientsService = {
  fetchAll: (page: number, limit: number, search: string, status: PatientStatusFilter) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search.trim()) params.set('search', search.trim());

    // El API solo distingue activos de "activos + inactivos". Para ver los
    // inactivos hay que pedirlos todos y filtrarlos del lado del cliente.
    if (status !== PatientStatusFilter.ACTIVE) params.set('includeInactive', 'true');

    return ApiServiceClient(env.API.MEDICAL_RECORDS_URL).get<PaginatedResponse<Patient>>(
      `/patients?${params.toString()}`,
    );
  },
};

export function usePatientsQuery(
  page: number,
  limit: number,
  search: string,
  status: PatientStatusFilter,
) {
  return useQuery({
    queryKey: [FETCH_PATIENTS_KEY, page, limit, search, status],
    queryFn: async () => {
      const response = await PatientsService.fetchAll(page, limit, search, status);

      if (status !== PatientStatusFilter.INACTIVE) return response;

      // Filtro local: el conteo de `meta` deja de ser exacto para esta vista.
      return { ...response, data: response.data.filter((patient) => !patient.isActive) };
    },
    placeholderData: (previousData) => previousData,
  });
}
