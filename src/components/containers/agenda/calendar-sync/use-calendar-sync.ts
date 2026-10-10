import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  FETCH_CALENDAR_FEED_KEY,
  useCalendarFeedQuery,
} from '@/shared/api/querys/calendar-feed-query';
import { useAppointmentTypesQuery } from '@/shared/api/querys/appointment-types-query';
import { useBranchesQuery } from '@/shared/api/querys/branches-query';
import { useIssueCalendarFeedMutation } from '@/shared/api/mutations/calendar-feed/issue-calendar-feed-mutation';
import { useSetCalendarVisibilityMutation } from '@/shared/api/mutations/calendar-feed/set-calendar-visibility-mutation';
import { getBranchStripeColor } from '@/shared/design/tokens';
import { buildCalendarFeedUrl, buildCalendarKey } from '@/shared/utils/calendar-feed';
import { TEXT } from '@/static/texts/i18n';
import {
  CalendarFeedStatus,
  CalendarGrouping,
  CalendarState,
} from '@/types/calendar-feed/calendar-feed';

/**
 * Días sin que el teléfono pida un calendario para darlo por borrado de ahí.
 * iOS a veces tarda horas en actualizar, así que el margen es amplio.
 */
const PHONE_ACTIVE_DAYS = 3;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const HEX_COLOR = /^#[0-9a-f]{6}$/i;

export interface CalendarSyncRowData {
  key: string;
  branchUuid: string;
  typeUuid?: string;
  label: string;
  color?: string;
  url: string;
  state: CalendarState;
}

/** Una sede con sus calendarios. En el modo "por sede" hay un solo grupo, sin título. */
export interface CalendarSyncGroup {
  key: string;
  title?: string;
  color?: string;
  rows: CalendarSyncRowData[];
}

const SINGLE_GROUP_KEY = 'all';

function resolveState(feed: CalendarFeedStatus, key: string, now: number): CalendarState {
  const fetchedAt = feed.fetchedCalendars[key];
  const isOnPhone =
    fetchedAt !== undefined && now - new Date(fetchedAt).getTime() < PHONE_ACTIVE_DAYS * MS_PER_DAY;
  if (!isOnPhone) return CalendarState.NOT_ADDED;
  return feed.removedCalendarKeys.includes(key) ? CalendarState.REMOVED : CalendarState.ON_PHONE;
}

/** Si el teléfono ya lee calendarios por tipo, la ficha abre en ese modo. */
function inferGrouping(feed: CalendarFeedStatus | undefined): CalendarGrouping {
  const hasTypeCalendar = Object.keys(feed?.fetchedCalendars ?? {}).some((key) =>
    key.includes(':'),
  );
  return hasTypeCalendar ? CalendarGrouping.BRANCH_AND_TYPE : CalendarGrouping.BRANCH;
}

export function useCalendarSync() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: feed, isLoading, isSuccess } = useCalendarFeedQuery();
  const { data: branches } = useBranchesQuery();
  const { data: appointmentTypes } = useAppointmentTypesQuery();
  const { executeIssueCalendarFeed } = useIssueCalendarFeedMutation();
  const { executeSetCalendarVisibility, executeSetCalendarVisibilityAsync } =
    useSetCalendarVisibilityMutation();

  const [chosenGrouping, setChosenGrouping] = useState<CalendarGrouping | null>(null);
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);
  const hasRequestedToken = useRef(false);

  const saveStatus = (status: CalendarFeedStatus) =>
    queryClient.setQueryData([FETCH_CALENDAR_FEED_KEY], status);

  // El enlace se crea solo la primera vez que se abre la ficha: no hay un paso
  // "conectar" aparte.
  const hasToken = Boolean(feed?.token);
  useEffect(() => {
    if (!isSuccess || hasToken || hasRequestedToken.current) return;
    hasRequestedToken.current = true;
    executeIssueCalendarFeed(undefined, {
      onSuccess: (status) => queryClient.setQueryData([FETCH_CALENDAR_FEED_KEY], status),
      onError: (error: Error) => toast.error(error.message),
    });
  }, [isSuccess, hasToken, executeIssueCalendarFeed, queryClient]);

  const grouping = chosenGrouping ?? inferGrouping(feed);
  const token = feed?.token ?? null;

  const groups: CalendarSyncGroup[] = useMemo(() => {
    if (!feed || !token) return [];
    const now = Date.now();

    const buildRow = (
      branchUuid: string,
      label: string,
      color: string | undefined,
      typeUuid?: string,
    ): CalendarSyncRowData => {
      const key = buildCalendarKey(branchUuid, typeUuid);
      return {
        key,
        branchUuid,
        typeUuid,
        label,
        color,
        url: buildCalendarFeedUrl(token, { branchUuid, typeUuid, color }),
        state: resolveState(feed, key, now),
      };
    };

    if (grouping === CalendarGrouping.BRANCH) {
      return [
        {
          key: SINGLE_GROUP_KEY,
          rows: (branches ?? []).map((branch) =>
            buildRow(branch.uuid, branch.name, getBranchStripeColor(branch.name)),
          ),
        },
      ];
    }

    return (branches ?? []).map((branch) => {
      const branchColor = getBranchStripeColor(branch.name);
      return {
        key: branch.uuid,
        title: branch.name,
        color: branchColor,
        rows: (appointmentTypes ?? []).map((type) =>
          buildRow(
            branch.uuid,
            type.name,
            type.color && HEX_COLOR.test(type.color) ? type.color : branchColor,
            type.uuid,
          ),
        ),
      };
    });
  }, [feed, token, grouping, branches, appointmentTypes]);

  const handleRemove = (row: CalendarSyncRowData) => {
    setUpdatingKey(row.key);
    executeSetCalendarVisibility(
      { branchUuid: row.branchUuid, typeUuid: row.typeUuid, isRemoved: true },
      {
        onSuccess: (status) => {
          saveStatus(status);
          toast.success(t(TEXT.AGENDA.CALENDAR_SYNC.TOASTS.REMOVED, { name: row.label }));
        },
        onError: (error: Error) => toast.error(error.message),
        onSettled: () => setUpdatingKey(null),
      },
    );
  };

  /**
   * "Agregar" abre el enlace `webcal://` por sí mismo. Si ese calendario estaba
   * quitado, además se vuelve a publicar con citas para que no llegue vacío.
   */
  const handleAdd = (row: CalendarSyncRowData) => {
    if (!feed?.removedCalendarKeys.includes(row.key)) return;
    void executeSetCalendarVisibilityAsync({
      branchUuid: row.branchUuid,
      typeUuid: row.typeUuid,
      isRemoved: false,
    })
      .then(saveStatus)
      .catch((error: Error) => toast.error(error.message));
  };

  return {
    isLoading: isLoading || (isSuccess && !token),
    grouping,
    groups,
    updatingKey,
    handleGroupingChange: setChosenGrouping,
    handleAdd,
    handleRemove,
  };
}
