import React from 'react';
import { useTranslation } from 'react-i18next';
import { ColorDot } from '@/components/common/color-dot/color-dot';
import { Tabs } from '@/components/common/tabs/tabs';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { CalendarGrouping } from '@/types/calendar-feed/calendar-feed';
import { AgendaLoading } from '../agenda-states';
import { SheetDialog } from '../sheet-dialog';
import { CalendarSyncRow } from './calendar-sync-row';
import { useCalendarSync } from './use-calendar-sync';

/**
 * Calendario del iPhone: cada sede (o cada sede y tipo de cita) es un
 * calendario con su color. Se agregan de a uno, cuando se quiera, y cada uno
 * se puede quitar sin tocar los demás.
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
      <div className="mt-3">
        <Tabs
          items={[
            { value: CalendarGrouping.BRANCH, label: t(TEXT.AGENDA.CALENDAR_SYNC.BY_BRANCH) },
            {
              value: CalendarGrouping.BRANCH_AND_TYPE,
              label: t(TEXT.AGENDA.CALENDAR_SYNC.BY_BRANCH_AND_TYPE),
            },
          ]}
          value={sync.grouping}
          onChange={sync.handleGroupingChange}
          ariaLabel={t(TEXT.AGENDA.CALENDAR_SYNC.GROUPING_ARIA)}
        />

        {sync.isLoading ? (
          <AgendaLoading />
        ) : (
          <div className="mt-2 flex flex-col gap-3">
            {sync.groups.map((group) => (
              <section key={group.key}>
                {group.title && (
                  <Typography
                    variant={TypographyVariant.HELPER}
                    as="h3"
                    className="mt-1 flex items-center gap-2 font-semibold uppercase tracking-wide"
                  >
                    <ColorDot color={group.color} className="h-2 w-2" />
                    {group.title}
                  </Typography>
                )}
                <ul className="divide-y divide-ink-100">
                  {group.rows.map((row) => (
                    <CalendarSyncRow
                      key={row.key}
                      row={row}
                      isUpdating={sync.updatingKey === row.key}
                      onAdd={sync.handleAdd}
                      onRemove={sync.handleRemove}
                    />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}

        <Typography variant={TypographyVariant.HELPER} className="mt-3">
          {t(TEXT.AGENDA.CALENDAR_SYNC.REFRESH_HINT)}
        </Typography>
        <Typography
          variant={TypographyVariant.HELPER}
          className="mt-3 rounded-lg bg-warning/10 px-3 py-2 text-ink-700"
        >
          {t(TEXT.AGENDA.CALENDAR_SYNC.PRIVACY)}
        </Typography>
      </div>
    </SheetDialog>
  );
};
