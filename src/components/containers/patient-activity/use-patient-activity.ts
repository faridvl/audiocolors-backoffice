import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  usePatientActivityActorsQuery,
  usePatientActivityQuery,
} from '@/shared/api/querys/patient-activity-query';
import { useBranchesQuery } from '@/shared/api/querys/branches-query';
import { useAppointmentTypesQuery } from '@/shared/api/querys/appointment-types-query';
import { useNavigation } from '@/hooks/use-navigation';
import { useRememberedState } from '@/hooks/use-remembered-state';
import { addDays, fromDayKey, toDayKey } from '@/shared/utils/dates';
import { TEXT } from '@/static/texts/i18n';
import {
  APPOINTMENT_ACTIONS,
  PatientActivityAction,
} from '@/types/patient-activity/patient-activity';
import { getActionLabel, groupConsecutiveUploads } from './patient-activity-presenter';

export const ALL_VALUE = 'all';
const PAGE_SIZE = 7;
/** El rango arranca en la última semana: hasta hoy, desde 7 días atrás. */
const DEFAULT_RANGE_DAYS = 7;
const SEARCH_DEBOUNCE_MS = 300;
const MEMORY_KEY = 'activity';

/** Qué parte de la bitácora se ve: solo citas o todo. */
export enum ActivityScope {
  APPOINTMENTS = 'appointments',
  ALL = 'all',
}

/** Días "YYYY-MM-DD" (hora local) -> rango [desde 00:00, día siguiente a hasta) en ISO. */
function dayRange(fromDay: string, toDay: string): { from?: string; to?: string } {
  return {
    from: fromDay ? fromDayKey(fromDay).toISOString() : undefined,
    to: toDay ? addDays(fromDayKey(toDay), 1).toISOString() : undefined,
  };
}

export function usePatientActivity() {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [scope, setScope] = useState<ActivityScope>(ActivityScope.ALL);
  const [actorFilter, setActorFilter] = useState<string>(ALL_VALUE);
  const [actionFilter, setActionFilter] = useState<string>(ALL_VALUE);
  const todayKey = useMemo(() => toDayKey(new Date()), []);
  const defaultFromDay = useMemo(
    () => toDayKey(addDays(fromDayKey(todayKey), -DEFAULT_RANGE_DAYS)),
    [todayKey],
  );
  const [fromDay, setFromDay] = useRememberedState(`${MEMORY_KEY}.from`, defaultFromDay);
  const [toDay, setToDay] = useRememberedState(`${MEMORY_KEY}.to`, todayKey);
  const [branchFilter, setBranchFilter] = useState<string>(ALL_VALUE);
  const [typeFilter, setTypeFilter] = useState<string>(ALL_VALUE);
  const [page, setPage] = useState(1);

  // Se fija al montar: agrupa las filas en "Hoy", "Ayer"…
  const now = useMemo(() => new Date(), []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const actions = useMemo<PatientActivityAction[] | undefined>(() => {
    if (actionFilter !== ALL_VALUE) return [actionFilter as PatientActivityAction];
    return scope === ActivityScope.APPOINTMENTS ? APPOINTMENT_ACTIONS : undefined;
  }, [actionFilter, scope]);

  const range = dayRange(fromDay, toDay);

  const { data, isLoading, isError, refetch } = usePatientActivityQuery({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch,
    actorUuid: actorFilter !== ALL_VALUE ? actorFilter : undefined,
    actions,
    from: range.from,
    to: range.to,
    branchUuid: branchFilter !== ALL_VALUE ? branchFilter : undefined,
    // El tipo solo existe en las acciones de cita: fuera de "Citas" no aplica.
    appointmentTypeUuid:
      scope === ActivityScope.APPOINTMENTS && typeFilter !== ALL_VALUE ? typeFilter : undefined,
  });

  const { data: actors } = usePatientActivityActorsQuery();
  const { data: branches } = useBranchesQuery();
  const { data: appointmentTypes } = useAppointmentTypesQuery();

  const actorOptions = useMemo(
    () => [
      { label: t(TEXT.ACTIVITY.FILTERS.ALL), value: ALL_VALUE },
      ...(actors ?? []).map((actor) => ({
        label: actor.fullName ?? t(TEXT.ACTIVITY.UNKNOWN_ACTOR),
        value: actor.uuid,
      })),
    ],
    [actors, t],
  );

  const actionOptions = useMemo(() => {
    const available =
      scope === ActivityScope.APPOINTMENTS
        ? APPOINTMENT_ACTIONS
        : Object.values(PatientActivityAction);
    return [
      { label: t(TEXT.ACTIVITY.FILTERS.ALL_ACTIONS), value: ALL_VALUE },
      ...available.map((action) => ({ label: getActionLabel(t, action), value: action })),
    ];
  }, [scope, t]);

  const branchOptions = useMemo(
    () => [
      { label: t(TEXT.ACTIVITY.FILTERS.ALL_ACTIONS), value: ALL_VALUE },
      ...(branches ?? []).map((branch) => ({ label: branch.name, value: branch.uuid })),
    ],
    [branches, t],
  );

  const typeOptions = useMemo(
    () => [
      { label: t(TEXT.ACTIVITY.FILTERS.ALL), value: ALL_VALUE },
      ...(appointmentTypes ?? []).map((type) => ({ label: type.name, value: type.uuid })),
    ],
    [appointmentTypes, t],
  );

  const rows = useMemo(() => groupConsecutiveUploads(data?.data ?? []), [data]);

  const resolveBranchName = useCallback(
    (branchUuid: string) => branches?.find((branch) => branch.uuid === branchUuid)?.name,
    [branches],
  );

  const handleScopeChange = (nextScope: ActivityScope) => {
    setScope(nextScope);
    // Una acción elegida en "Todo" puede no existir en "Citas", y el tipo
    // de cita solo aplica en "Citas".
    setActionFilter(ALL_VALUE);
    setTypeFilter(ALL_VALUE);
    setPage(1);
  };

  const withPageReset = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };

  const hasActiveFilters =
    debouncedSearch.trim().length > 0 ||
    scope !== ActivityScope.ALL ||
    actorFilter !== ALL_VALUE ||
    actionFilter !== ALL_VALUE ||
    fromDay !== defaultFromDay ||
    toDay !== todayKey ||
    branchFilter !== ALL_VALUE ||
    typeFilter !== ALL_VALUE;

  return {
    rows,
    meta: data?.meta,
    now,
    isLoading,
    isError,
    page,
    hasActiveFilters,
    searchTerm,
    scope,
    actorFilter,
    actionFilter,
    fromDay,
    toDay,
    todayKey,
    actorOptions,
    actionOptions,
    branchFilter,
    branchOptions,
    typeFilter,
    typeOptions,
    resolveBranchName,
    setSearchTerm,
    handleScopeChange,
    handleActorFilter: withPageReset(setActorFilter),
    handleActionFilter: withPageReset(setActionFilter),
    handleFromDayChange: withPageReset(setFromDay),
    handleToDayChange: withPageReset(setToDay),
    handleBranchFilter: withPageReset(setBranchFilter),
    handleTypeFilter: withPageReset(setTypeFilter),
    handlePageChange: setPage,
    handleRetry: refetch,
    navigateToPatient: navigation.patients.detail,
  };
}
