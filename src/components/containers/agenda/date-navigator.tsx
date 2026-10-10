import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TEXT } from '@/static/texts/i18n';
import { MonthPicker } from './month-picker';
import { AgendaState } from './use-agenda';

export const DateNavigator: React.FC<{ agenda: AgendaState }> = ({ agenda }) => {
  const { t } = useTranslation();

  return (
    // Un solo control con forma de píldora: en móvil ocupa todo el ancho, con
    // las flechas en los extremos (al alcance del pulgar) y la fecha al centro.
    <div className="flex w-full items-center justify-between rounded-full border border-ink-200 bg-white sm:w-auto">
      <button
        type="button"
        onClick={agenda.handlePreviousDay}
        aria-label={t(TEXT.AGENDA.DAY.PREVIOUS)}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-600 hover:bg-ink-100"
      >
        <ChevronLeft className="h-5 w-5" aria-hidden />
      </button>
      <MonthPicker
        label={agenda.compactDayLabel}
        selectedDayKey={agenda.selectedDayKey}
        todayKey={agenda.todayKey}
        onSelect={agenda.handleSelectDay}
      />
      <button
        type="button"
        onClick={agenda.handleNextDay}
        aria-label={t(TEXT.AGENDA.DAY.NEXT)}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-600 hover:bg-ink-100"
      >
        <ChevronRight className="h-5 w-5" aria-hidden />
      </button>
    </div>
  );
};
