import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { ColorDotRow } from '@/components/common/color-dot/color-dot-row';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { buildMonthOption, formatMonthLabel } from '@/shared/utils/formatters';
import { buildMonthGrid, dayOfMonth, shiftMonth, toMonthKey } from '@/shared/utils/dates';
import { tailwind } from '@/utils/tailwind-utils';
import { TEXT } from '@/static/texts/i18n';

/** Atajos de mes al pie: el actual y los dos siguientes. */
const QUICK_MONTHS_AHEAD = 3;

export enum MonthCalendarSize {
  /** Dentro del popover del celular y de la ficha de confirmar. */
  COMPACT = 'COMPACT',
  /** Pieza principal de escritorio: celdas altas, el número arriba a la izquierda. */
  LARGE = 'LARGE',
}

const DAY_CELL_SIZES: Record<MonthCalendarSize, string> = {
  [MonthCalendarSize.COMPACT]: 'h-9 min-h-0 flex-col gap-0.5 px-0 py-0 text-sm',
  [MonthCalendarSize.LARGE]:
    'h-20 min-h-0 flex-col items-start justify-between border border-ink-100 p-2 text-base',
};

const GRID_GAPS: Record<MonthCalendarSize, string> = {
  [MonthCalendarSize.COMPACT]: 'gap-0.5',
  [MonthCalendarSize.LARGE]: 'gap-1.5',
};

/** Colores de los puntos de cada día ("YYYY-MM-DD" -> un color por sede con citas). */
export type DayMarkers = Record<string, (string | undefined)[]>;

interface MonthCalendarProps {
  visibleMonthKey: string;
  onVisibleMonthChange: (monthKey: string) => void;
  selectedDayKey: string;
  todayKey: string;
  onSelectDay: (dayKey: string) => void;
  onSelectToday: () => void;
  size?: MonthCalendarSize;
  /** Puntos bajo el número del día. Sin esto, ningún día lleva puntos. */
  dayMarkers?: DayMarkers;
}

/**
 * Calendario de un mes con navegación, atajos a los próximos meses y "Hoy".
 * Controlado: quien lo usa decide qué mes se ve y qué puntos lleva cada día.
 */
export const MonthCalendar: React.FC<MonthCalendarProps> = ({
  visibleMonthKey,
  onVisibleMonthChange,
  selectedDayKey,
  todayKey,
  onSelectDay,
  onSelectToday,
  size = MonthCalendarSize.COMPACT,
  dayMarkers,
}) => {
  const { t } = useTranslation();
  const weekdays = t(TEXT.AGENDA.MONTH_PICKER.WEEKDAYS).split(' ');
  const quickMonths = Array.from({ length: QUICK_MONTHS_AHEAD }, (_, offset) =>
    shiftMonth(toMonthKey(todayKey), offset),
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <Button
          variant={ButtonVariant.GHOST}
          onClick={() => onVisibleMonthChange(shiftMonth(visibleMonthKey, -1))}
          aria-label={t(TEXT.AGENDA.MONTH_PICKER.PREVIOUS)}
          icon={<ChevronLeft className="h-4 w-4" aria-hidden />}
          className="h-10 min-h-0 w-10 px-0"
        />
        <Typography variant={TypographyVariant.BODY_SEMIBOLD} inline>
          {formatMonthLabel(visibleMonthKey)}
        </Typography>
        <Button
          variant={ButtonVariant.GHOST}
          onClick={() => onVisibleMonthChange(shiftMonth(visibleMonthKey, 1))}
          aria-label={t(TEXT.AGENDA.MONTH_PICKER.NEXT)}
          icon={<ChevronRight className="h-4 w-4" aria-hidden />}
          className="h-10 min-h-0 w-10 px-0"
        />
      </div>

      <div className={tailwind('mt-2 grid grid-cols-7 text-center', GRID_GAPS[size])}>
        {weekdays.map((weekday) => (
          <Typography
            key={weekday}
            variant={TypographyVariant.HELPER}
            inline
            className="py-1 text-ink-400"
          >
            {weekday}
          </Typography>
        ))}

        {buildMonthGrid(visibleMonthKey).map((dayKey, index) => {
          if (!dayKey) return <span key={`blank-${index}`} aria-hidden />;

          const isSelected = dayKey === selectedDayKey;
          const isToday = dayKey === todayKey;

          return (
            <Button
              key={dayKey}
              variant={ButtonVariant.GHOST}
              onClick={() => onSelectDay(dayKey)}
              aria-pressed={isSelected}
              className={tailwind(
                DAY_CELL_SIZES[size],
                'font-normal text-ink-700',
                isSelected && 'bg-brand font-semibold text-white hover:bg-brand-600',
                !isSelected && isToday && 'font-semibold text-brand-700 ring-1 ring-brand',
              )}
            >
              {dayOfMonth(dayKey)}
              <ColorDotRow colors={dayMarkers?.[dayKey] ?? []} isOnColor={isSelected} />
            </Button>
          );
        })}
      </div>

      <div className="mt-2 flex justify-between border-t border-ink-100 pt-2">
        {quickMonths.map((monthKey) => (
          <Button
            key={monthKey}
            variant={ButtonVariant.GHOST}
            onClick={() => onVisibleMonthChange(monthKey)}
            className={tailwind(
              'min-h-[36px] px-2 text-xs',
              monthKey === visibleMonthKey && 'bg-brand-50 text-brand-700 hover:bg-brand-50',
            )}
          >
            {buildMonthOption(monthKey).shortLabel}
          </Button>
        ))}
        <Button
          variant={ButtonVariant.GHOST}
          onClick={onSelectToday}
          className="min-h-[36px] px-2 text-xs text-brand-700 hover:bg-brand-50"
        >
          {t(TEXT.AGENDA.WEEK.TODAY)}
        </Button>
      </div>
    </div>
  );
};
