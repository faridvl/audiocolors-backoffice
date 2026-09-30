import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link2, RefreshCw, Unlink } from 'lucide-react';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { AgendaLoading } from '../agenda-states';
import { SheetDialog } from '../sheet-dialog';
import { CalendarSyncRow } from './calendar-sync-row';
import { useCalendarSync } from './use-calendar-sync';

/**
 * Conectar la agenda al calendario del teléfono: un enlace personal por sede
 * (cada una con su color). Se toca "Agregar" desde el iPhone y las citas llegan
 * solas de ahí en adelante.
 */
export const CalendarSyncSheet: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { t } = useTranslation();
  const sync = useCalendarSync();

  return (
    <SheetDialog
      title={t(TEXT.AGENDA.CALENDAR_SYNC.TITLE)}
      status={t(TEXT.AGENDA.CALENDAR_SYNC.DESCRIPTION)}
      onClose={onClose}
    >
      <div className="mt-4">
        {sync.isLoading && <AgendaLoading />}

        {!sync.isLoading && !sync.isConnected && (
          <Button
            onClick={sync.handleConnect}
            isLoading={sync.isIssuing}
            icon={<Link2 className="h-4 w-4" aria-hidden />}
            className="w-full"
          >
            {t(TEXT.AGENDA.CALENDAR_SYNC.CONNECT)}
          </Button>
        )}

        {!sync.isLoading && sync.isConnected && (
          <>
            <Typography variant={TypographyVariant.HELPER}>
              {t(TEXT.AGENDA.CALENDAR_SYNC.COLORS_HINT)}
            </Typography>
            <ul className="mt-2 divide-y divide-ink-100">
              {sync.rows.map((row) => (
                <CalendarSyncRow
                  key={row.key}
                  row={row}
                  onCopy={(url) => void sync.handleCopy(url)}
                />
              ))}
            </ul>

            <Typography
              variant={TypographyVariant.HELPER}
              className="mt-3 rounded-lg bg-warning/10 px-3 py-2 text-ink-700"
            >
              {t(TEXT.AGENDA.CALENDAR_SYNC.PRIVACY)}
            </Typography>

            <div className="mt-3 flex flex-col gap-1 sm:flex-row sm:justify-between">
              <Button
                variant={ButtonVariant.GHOST}
                onClick={sync.handleRegenerate}
                isLoading={sync.isIssuing}
                icon={<RefreshCw className="h-4 w-4" aria-hidden />}
              >
                {t(TEXT.AGENDA.CALENDAR_SYNC.REGENERATE)}
              </Button>
              <Button
                variant={ButtonVariant.GHOST}
                onClick={sync.handleDisconnect}
                isLoading={sync.isRevoking}
                icon={<Unlink className="h-4 w-4" aria-hidden />}
                className="text-danger hover:bg-danger/10"
              >
                {t(TEXT.AGENDA.CALENDAR_SYNC.DISCONNECT)}
              </Button>
            </div>
          </>
        )}
      </div>
    </SheetDialog>
  );
};
