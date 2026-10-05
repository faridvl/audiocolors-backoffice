import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  FETCH_CALENDAR_FEED_KEY,
  useCalendarFeedQuery,
} from '@/shared/api/querys/calendar-feed-query';
import { useBranchesQuery } from '@/shared/api/querys/branches-query';
import { useIssueCalendarFeedMutation } from '@/shared/api/mutations/calendar-feed/issue-calendar-feed-mutation';
import { useRevokeCalendarFeedMutation } from '@/shared/api/mutations/calendar-feed/revoke-calendar-feed-mutation';
import { getBranchStripeColor } from '@/shared/design/tokens';
import { buildCalendarFeedUrl } from '@/shared/utils/calendar-feed';
import { TEXT } from '@/static/texts/i18n';

/** Un calendario que se puede agregar al teléfono: una sede con su color. */
export interface CalendarSyncRowData {
  key: string;
  label: string;
  color?: string;
  url: string;
}

export function useCalendarSync() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: feed, isLoading } = useCalendarFeedQuery();
  const { data: branches } = useBranchesQuery();
  const { executeIssueCalendarFeed, isPending: isIssuing } = useIssueCalendarFeedMutation();
  const { executeRevokeCalendarFeed, isPending: isRevoking } = useRevokeCalendarFeedMutation();

  const token = feed?.token ?? null;

  /**
   * Una fila por sede, sin la opción "todas juntas": el iPhone colorea
   * calendarios enteros, así que un calendario único pierde el color de cada sede.
   */
  const rows: CalendarSyncRowData[] = useMemo(() => {
    if (!token) return [];
    return (branches ?? []).map((branch) => {
      const color = getBranchStripeColor(branch.name);
      return {
        key: branch.uuid,
        label: branch.name,
        color,
        url: buildCalendarFeedUrl(token, { branchUuid: branch.uuid, color }),
      };
    });
  }, [token, branches]);

  const refresh = () => queryClient.invalidateQueries({ queryKey: [FETCH_CALENDAR_FEED_KEY] });

  const issue = (successText: string) =>
    executeIssueCalendarFeed(undefined, {
      onSuccess: () => {
        toast.success(t(successText));
        void refresh();
      },
      onError: (error: Error) => toast.error(error.message),
    });

  const handleConnect = () => issue(TEXT.AGENDA.CALENDAR_SYNC.TOASTS.CONNECTED);
  const handleRegenerate = () => issue(TEXT.AGENDA.CALENDAR_SYNC.TOASTS.REGENERATED);

  const handleDisconnect = () =>
    executeRevokeCalendarFeed(undefined, {
      onSuccess: () => {
        toast.success(t(TEXT.AGENDA.CALENDAR_SYNC.TOASTS.DISCONNECTED));
        void refresh();
      },
      onError: (error: Error) => toast.error(error.message),
    });

  /** Desde la computadora: copiar el enlace para abrirlo en el teléfono. */
  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t(TEXT.AGENDA.CALENDAR_SYNC.TOASTS.COPIED));
    } catch {
      toast.error(t(TEXT.GENERAL.ERRORS.UNEXPECTED));
    }
  };

  return {
    isLoading,
    isConnected: Boolean(token),
    rows,
    isIssuing,
    isRevoking,
    handleConnect,
    handleRegenerate,
    handleDisconnect,
    handleCopy,
  };
}
