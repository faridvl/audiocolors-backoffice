import React from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarCheck, CalendarMinus, CalendarPlus } from 'lucide-react';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { ButtonLink } from '@/components/common/button/button-link';
import { ColorDot } from '@/components/common/color-dot/color-dot';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { tailwind } from '@/utils/tailwind-utils';
import { TEXT } from '@/static/texts/i18n';
import { CalendarState } from '@/types/calendar-feed/calendar-feed';
import { CalendarSyncRowData } from './use-calendar-sync';

interface CalendarSyncRowProps {
  row: CalendarSyncRowData;
  isUpdating: boolean;
  onAdd: (row: CalendarSyncRowData) => void;
  onRemove: (row: CalendarSyncRowData) => void;
}

/** Un calendario: "Agregar", o si el teléfono ya lo lee, "Quitar". Uno quitado se vuelve a agregar igual que uno nuevo. */
export const CalendarSyncRow: React.FC<CalendarSyncRowProps> = ({
  row,
  isUpdating,
  onAdd,
  onRemove,
}) => {
  const { t } = useTranslation();
  const isRemoved = row.state === CalendarState.REMOVED;

  return (
    <li className="flex items-center gap-3 py-2">
      <ColorDot color={row.color} className={tailwind('h-3 w-3', isRemoved && 'opacity-40')} />
      <span className="flex min-w-0 flex-1 flex-col">
        <Typography
          variant={TypographyVariant.BODY_SEMIBOLD}
          className={tailwind('truncate', isRemoved && 'text-ink-400')}
        >
          {row.label}
        </Typography>
        {row.state === CalendarState.ON_PHONE && (
          <Typography variant={TypographyVariant.HELPER} className="flex items-center gap-1">
            <CalendarCheck className="h-3.5 w-3.5 text-success" aria-hidden />
            {t(TEXT.AGENDA.CALENDAR_SYNC.ON_PHONE)}
          </Typography>
        )}
        {isRemoved && (
          <Typography variant={TypographyVariant.HELPER}>
            {t(TEXT.AGENDA.CALENDAR_SYNC.REMOVED)}
          </Typography>
        )}
      </span>

      {row.state !== CalendarState.ON_PHONE && (
        <ButtonLink
          href={row.url}
          onClick={() => onAdd(row)}
          variant={ButtonVariant.SECONDARY}
          icon={<CalendarPlus className="h-4 w-4" aria-hidden />}
          className="min-h-[40px] shrink-0 px-3"
        >
          {t(TEXT.AGENDA.CALENDAR_SYNC.ADD)}
        </ButtonLink>
      )}
      {row.state === CalendarState.ON_PHONE && (
        <Button
          variant={ButtonVariant.GHOST}
          onClick={() => onRemove(row)}
          isLoading={isUpdating}
          icon={<CalendarMinus className="h-4 w-4" aria-hidden />}
          className="min-h-[40px] shrink-0 px-3 text-danger hover:bg-danger/10"
        >
          {t(TEXT.AGENDA.CALENDAR_SYNC.REMOVE)}
        </Button>
      )}
    </li>
  );
};
