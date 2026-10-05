import React, { useCallback, useEffect, useState } from 'react';
import { toMonthKey } from '@/shared/utils/dates';
import { resolveDayPanelSide } from '../agenda-presenter';
import { AgendaActions } from '../agenda-actions';
import { AgendaMonthFilter } from '../agenda-month-filter';
import { MonthCalendar, MonthCalendarSize } from '../month-calendar';
import { AgendaState } from '../use-agenda';
import { DayPanel } from './day-panel';
import { PendingColumn } from './pending-column';
import { useAgendaBoard } from './use-agenda-board';
import { useMonthMarkers } from './use-month-markers';

/**
 * Escritorio, mitad y mitad: el calendario a la izquierda y "Por confirmar" a
 * la derecha. Son independientes: el filtro de mes solo mueve la lista y las
 * flechas solo mueven el calendario, así se agenda a alguien de septiembre en
 * un día de octubre. Tocar un día abre su ventana de horarios.
 */
export const AgendaDesktop: React.FC<{ agenda: AgendaState }> = ({ agenda }) => {
  const board = useAgendaBoard(agenda);
  const { selectedDayKey, todayKey } = agenda;
  const [visibleMonthKey, setVisibleMonthKey] = useState(toMonthKey(selectedDayKey));
  const dayMarkers = useMonthMarkers(agenda, visibleMonthKey);
  const [isDayPanelOpen, setIsDayPanelOpen] = useState(false);
  const handleCloseDayPanel = useCallback(() => setIsDayPanelOpen(false), []);

  // Si el día cambia desde fuera (volver atrás desde un expediente), el
  // calendario se muestra en su mes.
  useEffect(() => setVisibleMonthKey(toMonthKey(selectedDayKey)), [selectedDayKey]);

  // Pasar de mes cierra la ventana: el día que mostraba ya no está a la vista.
  const handleVisibleMonthChange = (monthKey: string) => {
    setVisibleMonthKey(monthKey);
    handleCloseDayPanel();
  };

  const handleSelectDay = (dayKey: string) => {
    agenda.handleSelectDayKeepingPending(dayKey);
    setIsDayPanelOpen(true);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Una sola fila de filtros: calendario y "Por confirmar" arrancan a la misma altura. */}
      <div className="flex items-center justify-end gap-2">
        <AgendaMonthFilter agenda={agenda} />
        <AgendaActions agenda={agenda} />
      </div>

      <div className="grid grid-cols-[minmax(0,45fr)_minmax(0,55fr)] items-start gap-4">
        <div className="relative min-w-0 rounded-card border border-ink-200 bg-white p-4">
          <MonthCalendar
            size={MonthCalendarSize.LARGE}
            dayMarkers={dayMarkers}
            visibleMonthKey={visibleMonthKey}
            onVisibleMonthChange={handleVisibleMonthChange}
            selectedDayKey={selectedDayKey}
            todayKey={todayKey}
            onSelectDay={handleSelectDay}
            onSelectToday={() => handleSelectDay(todayKey)}
          />

          {isDayPanelOpen && (
            <DayPanel
              agenda={agenda}
              board={board}
              side={resolveDayPanelSide(selectedDayKey)}
              onClose={handleCloseDayPanel}
            />
          )}
        </div>

        <div className="sticky top-4 min-w-0">
          <PendingColumn agenda={agenda} board={board} isDayPanelOpen={isDayPanelOpen} />
        </div>
      </div>
    </div>
  );
};
