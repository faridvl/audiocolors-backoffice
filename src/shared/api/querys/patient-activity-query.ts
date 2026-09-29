import { useQuery } from '@tanstack/react-query';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { PaginatedResponse } from '@/types/system/paginate.types';
import {
  PatientActivity,
  PatientActivityActor,
  PatientActivityFilters,
  PatientActivitySummary,
} from '@/types/patient-activity/patient-activity';

export const FETCH_PATIENT_ACTIVITY_KEY = 'fetchPatientActivity';
export const FETCH_PATIENT_ACTIVITY_ACTORS_KEY = 'fetchPatientActivityActors';
export const FETCH_PATIENT_ACTIVITY_SUMMARY_KEY = 'fetchPatientActivitySummary';
export const FETCH_PATIENT_ACTIVITY_MONTHS_KEY = 'fetchPatientActivityMonths';

const client = () => ApiServiceClient(env.API.MEDICAL_RECORDS_URL);

/** El API devuelve la bitácora ya ordenada: lo más reciente primero. */
export function usePatientActivityQuery(filters: PatientActivityFilters) {
  return useQuery({
    queryKey: [FETCH_PATIENT_ACTIVITY_KEY, filters],
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(filters.page),
        limit: String(filters.limit),
      });
      if (filters.search?.trim()) params.set('search', filters.search.trim());
      if (filters.actorUuid) params.set('actorUuid', filters.actorUuid);
      if (filters.actions?.length) params.set('action', filters.actions.join(','));
      if (filters.from) params.set('from', filters.from);
      if (filters.to) params.set('to', filters.to);
      if (filters.branchUuid) params.set('branchUuid', filters.branchUuid);
      if (filters.appointmentTypeUuid) {
        params.set('appointmentTypeUuid', filters.appointmentTypeUuid);
      }

      return client().get<PaginatedResponse<PatientActivity>>(
        `/patient-activity?${params.toString()}`,
      );
    },
    placeholderData: (previousData) => previousData,
  });
}

/** Quienes tienen acciones en la bitácora: opciones del filtro "Registrado por". */
export function usePatientActivityActorsQuery() {
  return useQuery({
    queryKey: [FETCH_PATIENT_ACTIVITY_ACTORS_KEY],
    queryFn: () => client().get<PatientActivityActor[]>('/patient-activity/actors'),
    staleTime: 1000 * 60 * 5,
  });
}

/** Totales en un rango [from, to) armado en la hora local de la clínica. */
export function usePatientActivitySummaryQuery(from: string, to: string) {
  return useQuery({
    queryKey: [FETCH_PATIENT_ACTIVITY_SUMMARY_KEY, from, to],
    queryFn: () => {
      const params = new URLSearchParams({ from, to });
      return client().get<PatientActivitySummary>(`/patient-activity/summary?${params.toString()}`);
    },
    staleTime: 1000 * 60,
  });
}

/**
 * Meses (YYYY-MM) con al menos una acción en la bitácora: opciones del
 * filtro "Mes". Se agrupan en la zona horaria del navegador (la de la
 * clínica), la misma con la que se arma el rango al filtrar.
 */
export function usePatientActivityMonthsQuery() {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return useQuery({
    queryKey: [FETCH_PATIENT_ACTIVITY_MONTHS_KEY, timeZone],
    queryFn: () => {
      const params = new URLSearchParams({ timeZone });
      return client().get<{ months: string[] }>(`/patient-activity/months?${params.toString()}`);
    },
    staleTime: 1000 * 60 * 2,
  });
}
