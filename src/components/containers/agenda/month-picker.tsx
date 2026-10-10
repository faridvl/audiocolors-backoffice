import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { CalendarDays, ChevronDown } from 'lucide-react';
import { TEXT } from '@/static/texts/i18n';
import { toMonthKey } from '@/shared/utils/dates';
import { MonthCalendar } from './month-calendar';

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
          <MonthCalendar
            visibleMonthKey={visibleMonthKey}
            onVisibleMonthChange={setVisibleMonthKey}
            selectedDayKey={selectedDayKey}
            todayKey={todayKey}
            onSelectDay={(dayKey) => {
              onSelect(dayKey);
              close();
            }}
            onSelectToday={() => {
              onSelect(todayKey);
              close();
            }}
          />
        )}
      </PopoverPanel>
    </Popover>
  );
};
