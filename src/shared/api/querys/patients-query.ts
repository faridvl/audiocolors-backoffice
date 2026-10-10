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
  /** Estados para la clínica (activo, inactivo, fallecido); vacío = todos. */
  statuses?: PatientStatus[];
  branchUuids?: string[];
  /** Tipos de la próxima cita: la confirmada o, si no hay, la tentativa. */
  appointmentTypeUuids?: string[];
  hearingAidsInLab?: boolean;
  hasActiveWarranty?: boolean;
  isVideoCandidate?: boolean;
  /** Próxima cita confirmada o tentativa; ambas o ninguna = todas. */
  nextAppointmentKinds?: NextAppointmentKind[];
}

export enum NextAppointmentKind {
  CONFIRMED = 'confirmed',
  TENTATIVE = 'tentative',
}

/** Los filtros de varios valores viajan separados por coma. */
const setList = (params: URLSearchParams, key: string, values?: string[]) => {
  if (values?.length) params.set(key, values.join(','));
};

const PatientsService = {
  fetchAll: (
    page: number,
    limit: number,
    search: string,
    status: PatientStatusFilter,
    nextAppointmentMonths?: string[],
    filters: PatientListFilters = {},
  ) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search.trim()) params.set('search', search.trim());

    // El API solo distingue activos de "activos + inactivos". Para ver los
    // inactivos hay que pedirlos todos y filtrarlos del lado del cliente.
    if (status !== PatientStatusFilter.ACTIVE) params.set('includeInactive', 'true');

    // Filtro por próxima cita (YYYY-MM). Cuando se manda, el API ignora la
    // paginación y devuelve todos los pacientes que coincidan en una sola página.
    setList(params, 'nextAppointmentMonth', nextAppointmentMonths);
    setList(params, 'status', filters.statuses);
    setList(params, 'branchUuid', filters.branchUuids);
    setList(params, 'appointmentTypeUuid', filters.appointmentTypeUuids);
    if (filters.hearingAidsInLab) params.set('hearingAidsInLab', 'true');
    if (filters.hasActiveWarranty) params.set('hasActiveWarranty', 'true');
    if (filters.isVideoCandidate) params.set('isVideoCandidate', 'true');
    setList(params, 'nextAppointmentKind', filters.nextAppointmentKinds);

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
  nextAppointmentMonths?: string[],
  filters: PatientListFilters = {},
  isEnabled = true,
) {
  return useQuery({
    enabled: isEnabled,
    queryKey: [FETCH_PATIENTS_KEY, page, limit, search, status, nextAppointmentMonths, filters],
    queryFn: async () => {
      const response = await PatientsService.fetchAll(
        page,
        limit,
        search,
        status,
        nextAppointmentMonths,
        filters,
      );

      if (status !== PatientStatusFilter.INACTIVE) return response;

      // Filtro local: el conteo de `meta` deja de ser exacto para esta vista.
      return { ...response, data: response.data.filter((patient) => !patient.isActive) };
    },
    placeholderData: (previousData) => previousData,
  });
}
