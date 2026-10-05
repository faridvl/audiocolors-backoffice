import React from 'react';
import { AgendaActions } from './agenda-actions';
import { DateNavigator } from './date-navigator';
import { DayList } from './day-list';
import { PendingList } from './pending-list';
import { AgendaState, AgendaView } from './use-agenda';
import { ViewTabs } from './view-tabs';
import { WeekStrip } from './week-strip';

/** Celular y tablet: franja semanal y pestañas "Citas del día" / "Por confirmar". */
export const AgendaMobile: React.FC<{ agenda: AgendaState }> = ({ agenda }) => (
  <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <DateNavigator agenda={agenda} />
      <AgendaActions agenda={agenda} />
    </div>

    <div className="rounded-card border border-ink-200 bg-white p-2 sm:p-3">
      <WeekStrip agenda={agenda} />
    </div>

    <section className="rounded-card border border-ink-200 bg-white">
      <ViewTabs agenda={agenda} />
      <div className="p-3 sm:p-4">
        {agenda.view === AgendaView.DAY ? (
          <DayList agenda={agenda} />
        ) : (
          <PendingList agenda={agenda} />
        )}
      </div>
    </section>
  </div>
);
