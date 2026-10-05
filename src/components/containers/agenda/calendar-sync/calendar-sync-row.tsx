import React from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarMinus, CalendarPlus, Copy, Undo2 } from 'lucide-react';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { ButtonLink } from '@/components/common/button/button-link';
import { ColorDot } from '@/components/common/color-dot/color-dot';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { tailwind } from '@/utils/tailwind-utils';
import { TEXT } from '@/static/texts/i18n';
import { CalendarSyncRowData } from './use-calendar-sync';

interface CalendarSyncRowProps {
  row: CalendarSyncRowData;
  isUpdating: boolean;
  onCopy: (url: string) => void;
  onRemove: (row: CalendarSyncRowData) => void;
  onRestore: (row: CalendarSyncRowData) => void;
}

/**
 * Una sede: "Agregar" abre la suscripción en el teléfono y "Quitar" deja su
 * calendario vacío. Quitada, solo ofrece volver a agregarla.
 */
export const CalendarSyncRow: React.FC<CalendarSyncRowProps> = ({
  row,
  isUpdating,
  onCopy,
  onRemove,
  onRestore,
}) => {
  const { t } = useTranslation();

  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-2 py-2">
      <span className="flex min-w-0 flex-1 items-center gap-3">
        <ColorDot
          color={row.color}
          className={tailwind('h-3 w-3', row.isRemoved && 'opacity-40')}
        />
        <span className="flex min-w-0 flex-col">
          <Typography
            variant={TypographyVariant.BODY_SEMIBOLD}
            className={tailwind('truncate', row.isRemoved && 'text-ink-400')}
          >
            {row.label}
          </Typography>
          {row.isRemoved && (
            <Typography variant={TypographyVariant.HELPER}>
              {t(TEXT.AGENDA.CALENDAR_SYNC.REMOVED)}
            </Typography>
          )}
        </span>
      </span>

      {row.isRemoved ? (
        <Button
          variant={ButtonVariant.SECONDARY}
          onClick={() => onRestore(row)}
          isLoading={isUpdating}
          icon={<Undo2 className="h-4 w-4" aria-hidden />}
          className="min-h-[40px] shrink-0 px-3"
        >
          {t(TEXT.AGENDA.CALENDAR_SYNC.RESTORE)}
        </Button>
      ) : (
        <span className="flex shrink-0 items-center gap-1">
          <Button
            variant={ButtonVariant.GHOST}
            onClick={() => onCopy(row.url)}
            aria-label={`${t(TEXT.AGENDA.CALENDAR_SYNC.COPY)} · ${row.label}`}
            icon={<Copy className="h-4 w-4" aria-hidden />}
            className="h-10 min-h-0 w-10 px-0"
          />
          <Button
            variant={ButtonVariant.GHOST}
            onClick={() => onRemove(row)}
            isLoading={isUpdating}
            aria-label={`${t(TEXT.AGENDA.CALENDAR_SYNC.REMOVE)} · ${row.label}`}
            icon={<CalendarMinus className="h-4 w-4" aria-hidden />}
            className="h-10 min-h-0 w-10 px-0 text-danger hover:bg-danger/10"
          />
          <ButtonLink
            href={row.url}
            variant={ButtonVariant.SECONDARY}
            icon={<CalendarPlus className="h-4 w-4" aria-hidden />}
            className="min-h-[40px] px-3"
          >
            {t(TEXT.AGENDA.CALENDAR_SYNC.ADD)}
          </ButtonLink>
        </span>
      )}
    </li>
  );
};
