import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  usePatientActivityActorsQuery,
  usePatientActivityQuery,
  usePatientActivitySummaryQuery,
} from '@/shared/api/querys/patient-activity-query';
import { useBranchesQuery } from '@/shared/api/querys/branches-query';
import { useNavigation } from '@/hooks/use-navigation';
import { formatMonthLabel } from '@/shared/utils/formatters';
import { TEXT } from '@/static/texts/i18n';
import {
  APPOINTMENT_ACTIONS,
  PatientActivityAction,
} from '@/types/patient-activity/patient-activity';
import { getActionLabel, groupConsecutiveUploads } from './patient-activity-presenter';

export const ALL_VALUE = 'all';
const PAGE_SIZE = 20;
/** Meses que ofrece el filtro, contando el actual hacia atrás. */
const MONTHS_BACK = 12;

/** Qué parte de la bitácora se ve: solo citas o todo. */
export enum ActivityScope {
  APPOINTMENTS = 'appointments',
  ALL = 'all',
}

function toMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/** Rango [inicio, fin) de un mes "YYYY-MM" en hora local, en ISO para el API. */
function monthRange(monthKey: string): { from: string; to: string } {
  const [year, month] = monthKey.split('-').map(Number);
  return {
    from: new Date(year, month - 1, 1).toISOString(),
    to: new Date(year, month, 1).toISOString(),
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
  const [monthFilter, setMonthFilter] = useState<string>(ALL_VALUE);
  const [page, setPage] = useState(1);

  // "Hoy" y "este mes" se fijan al montar: los rangos de los resúmenes no
  // deben cambiar (ni volver a pedirse) en cada render.
  const now = useMemo(() => new Date(), []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const actions = useMemo<PatientActivityAction[] | undefined>(() => {
    if (actionFilter !== ALL_VALUE) return [actionFilter as PatientActivityAction];
    return scope === ActivityScope.APPOINTMENTS ? APPOINTMENT_ACTIONS : undefined;
  }, [actionFilter, scope]);

  const range = monthFilter !== ALL_VALUE ? monthRange(monthFilter) : undefined;

  const { data, isLoading, isError, refetch } = usePatientActivityQuery({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch,
    actorUuid: actorFilter !== ALL_VALUE ? actorFilter : undefined,
    actions,
    from: range?.from,
    to: range?.to,
  });

  const { data: actors } = usePatientActivityActorsQuery();
  const { data: branches } = useBranchesQuery();

  const todayRange = useMemo(
    () => ({
      from: new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString(),
      to: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString(),
    }),
    [now],
  );
  const currentMonthRange = useMemo(() => monthRange(toMonthKey(now)), [now]);

  const { data: todaySummary } = usePatientActivitySummaryQuery(todayRange.from, todayRange.to);
  const { data: monthSummary } = usePatientActivitySummaryQuery(
    currentMonthRange.from,
    currentMonthRange.to,
  );

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

  const monthOptions = useMemo(
    () => [
      { label: t(TEXT.ACTIVITY.FILTERS.ALL), value: ALL_VALUE },
      ...Array.from({ length: MONTHS_BACK }, (_, offset) => {
        const monthKey = toMonthKey(new Date(now.getFullYear(), now.getMonth() - offset, 1));
        return { label: formatMonthLabel(monthKey), value: monthKey };
      }),
    ],
    [now, t],
  );

  const rows = useMemo(() => groupConsecutiveUploads(data?.data ?? []), [data]);

  const resolveBranchName = useCallback(
    (branchUuid: string) => branches?.find((branch) => branch.uuid === branchUuid)?.name,
    [branches],
  );

  const handleScopeChange = (nextScope: ActivityScope) => {
    setScope(nextScope);
    // Una acción elegida en "Todo" puede no existir en "Citas".
    setActionFilter(ALL_VALUE);
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
    monthFilter !== ALL_VALUE;

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
    monthFilter,
    actorOptions,
    actionOptions,
    monthOptions,
    todaySummary,
    monthSummary,
    resolveBranchName,
    setSearchTerm,
    handleScopeChange,
    handleActorFilter: withPageReset(setActorFilter),
    handleActionFilter: withPageReset(setActionFilter),
    handleMonthFilter: withPageReset(setMonthFilter),
    handlePageChange: setPage,
    handleRetry: refetch,
    navigateToPatient: navigation.patients.detail,
  };
}
