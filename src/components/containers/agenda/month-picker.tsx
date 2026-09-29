import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatMonthLabel } from '@/shared/utils/formatters';
import { tailwind } from '@/utils/tailwind-utils';
import { TEXT } from '@/static/texts/i18n';
import { buildMonthGrid, shiftMonth, toMonthKey } from './agenda-presenter';

interface MonthPickerProps {
  /** Texto del botón: el día elegido ("Hoy · mar 29 sept"). */
  label: string;
  selectedDayKey: string;
  todayKey: string;
  onSelect: (dayKey: string) => void;
}

/**
 * Salto rápido a cualquier fecha: la franja semanal sirve para moverse día a
 * día, pero pasar de octubre a diciembre con ella son nueve clics.
 */
export const MonthPicker: React.FC<MonthPickerProps> = ({
  label,
  selectedDayKey,
  todayKey,
  onSelect,
}) => {
  const { t } = useTranslation();
  const selectedMonthKey = toMonthKey(selectedDayKey);
  const [visibleMonthKey, setVisibleMonthKey] = useState(selectedMonthKey);
  const weekdays = t(TEXT.AGENDA.MONTH_PICKER.WEEKDAYS).split(' ');

  return (
    <Popover>
      <PopoverButton
        aria-label={t(TEXT.AGENDA.MONTH_PICKER.OPEN)}
        // Cada vez que se abre arranca en el mes del día elegido.
        onClick={() => setVisibleMonthKey(selectedMonthKey)}
        className="group flex min-h-[44px] items-center gap-2 rounded-full px-3 text-sm font-semibold text-ink-800 transition-colors hover:bg-ink-50 data-[focus]:outline data-[focus]:outline-2 data-[focus]:outline-brand"
      >
        <CalendarDays className="h-4 w-4 text-ink-500" aria-hidden />
        {label}
        <ChevronDown
          className="h-4 w-4 text-ink-400 transition-transform group-data-[open]:rotate-180"
          aria-hidden
        />
      </PopoverButton>

      <PopoverPanel
        // Centrado bajo el botón y con margen contra los bordes: en móvil el
        // botón está al centro y "bottom start" sacaba el panel por la derecha.
        anchor={{ to: 'bottom', gap: 6, padding: 16 }}
        className="z-30 w-72 rounded-card border border-ink-200 bg-white p-3 shadow-lg focus:outline-none"
      >
        {({ close }) => (
          <>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setVisibleMonthKey(shiftMonth(visibleMonthKey, -1))}
                aria-label={t(TEXT.AGENDA.MONTH_PICKER.PREVIOUS)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
              </button>
              <span className="text-sm font-semibold text-ink-800">
                {formatMonthLabel(visibleMonthKey)}
              </span>
              <button
                type="button"
                onClick={() => setVisibleMonthKey(shiftMonth(visibleMonthKey, 1))}
                aria-label={t(TEXT.AGENDA.MONTH_PICKER.NEXT)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100"
              >
                <ChevronRight className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <div className="mt-2 grid grid-cols-7 gap-0.5 text-center">
              {weekdays.map((weekday) => (
                <span key={weekday} className="py-1 text-xs text-ink-400">
                  {weekday}
                </span>
              ))}

              {buildMonthGrid(visibleMonthKey).map((dayKey, index) => {
                if (!dayKey) return <span key={`blank-${index}`} />;

                const isSelected = dayKey === selectedDayKey;
                const isToday = dayKey === todayKey;

                return (
                  <button
                    key={dayKey}
                    type="button"
                    onClick={() => {
                      onSelect(dayKey);
                      close();
                    }}
                    aria-pressed={isSelected}
                    className={tailwind(
                      'flex h-9 items-center justify-center rounded-lg text-sm transition-colors',
                      isSelected
                        ? 'bg-brand font-semibold text-white'
                        : 'text-ink-700 hover:bg-ink-100',
                      !isSelected && isToday && 'font-semibold text-brand-700 ring-1 ring-brand',
                    )}
                  >
                    {Number(dayKey.slice(8))}
                  </button>
                );
              })}
            </div>

            <div className="mt-2 flex justify-between border-t border-ink-100 pt-2">
              {[0, 1, 2].map((offset) => {
                const monthKey = shiftMonth(toMonthKey(todayKey), offset);
                return (
                  <button
                    key={monthKey}
                    type="button"
                    onClick={() => setVisibleMonthKey(monthKey)}
                    className={tailwind(
                      'min-h-[36px] rounded-lg px-2 text-xs font-semibold transition-colors',
                      monthKey === visibleMonthKey
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-ink-600 hover:bg-ink-100',
                    )}
                  >
                    {formatMonthLabel(monthKey).split(' ')[0]}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  onSelect(todayKey);
                  close();
                }}
                className="min-h-[36px] rounded-lg px-2 text-xs font-semibold text-brand-700 hover:bg-brand-50"
              >
                {t(TEXT.AGENDA.WEEK.TODAY)}
              </button>
            </div>
          </>
        )}
      </PopoverPanel>
    </Popover>
  );
};
