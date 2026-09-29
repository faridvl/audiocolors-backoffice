import { useQuery } from '@tanstack/react-query';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { Patient, PatientStatus } from '@/types/patients/patient';
import { PaginatedResponse } from '@/types/system/paginate.types';

export enum PatientStatusFilter {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ALL = 'all',
}

export const FETCH_PATIENTS_KEY = 'fetchPatients';

/** Filtros del listado que viajan tal cual al API; ausentes = sin filtrar. */
export interface PatientListFilters {
  /** Estado para la clínica (activo, inactivo, fallecido). */
  status?: PatientStatus;
  branchUuid?: string;
  /** Tipo de la próxima cita: la confirmada o, si no hay, la tentativa. */
  appointmentTypeUuid?: string;
}

const PatientsService = {
  fetchAll: (
    page: number,
    limit: number,
    search: string,
    status: PatientStatusFilter,
    nextAppointmentMonth?: string,
    filters: PatientListFilters = {},
  ) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search.trim()) params.set('search', search.trim());

    // El API solo distingue activos de "activos + inactivos". Para ver los
    // inactivos hay que pedirlos todos y filtrarlos del lado del cliente.
    if (status !== PatientStatusFilter.ACTIVE) params.set('includeInactive', 'true');

    // Filtro por próxima cita (YYYY-MM). Cuando se manda, el API ignora la
    // paginación y devuelve todos los pacientes que coincidan en una sola página.
    if (nextAppointmentMonth) params.set('nextAppointmentMonth', nextAppointmentMonth);
    if (filters.status) params.set('status', filters.status);
    if (filters.branchUuid) params.set('branchUuid', filters.branchUuid);
    if (filters.appointmentTypeUuid) params.set('appointmentTypeUuid', filters.appointmentTypeUuid);

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
  nextAppointmentMonth?: string,
  filters: PatientListFilters = {},
) {
  return useQuery({
    queryKey: [FETCH_PATIENTS_KEY, page, limit, search, status, nextAppointmentMonth, filters],
    queryFn: async () => {
      const response = await PatientsService.fetchAll(
        page,
        limit,
        search,
        status,
        nextAppointmentMonth,
        filters,
      );

      if (status !== PatientStatusFilter.INACTIVE) return response;

      // Filtro local: el conteo de `meta` deja de ser exacto para esta vista.
      return { ...response, data: response.data.filter((patient) => !patient.isActive) };
    },
    placeholderData: (previousData) => previousData,
  });
}
