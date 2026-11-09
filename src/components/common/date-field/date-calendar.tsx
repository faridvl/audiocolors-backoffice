import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { buildWeekdayInitials, formatDayForScreenReader } from '@/shared/utils/date-input';
import {
  buildMonthGrid,
  DAYS_IN_WEEK,
  dayOfMonth,
  shiftMonth,
  toDayKey,
  toMonthKey,
} from '@/shared/utils/dates';
import { formatMonthLabel, formatShortMonth } from '@/shared/utils/formatters';
import { TEXT } from '@/static/texts/i18n';
import { tailwind } from '@/utils/tailwind-utils';

const MONTHS_IN_YEAR = 12;
const YEARS_PER_PAGE = 12;
const YEAR_KEY_LENGTH = 4;
const MAX_WEEKS_IN_MONTH = 6;

enum CalendarView {
  DAYS = 'DAYS',
  MONTHS = 'MONTHS',
  YEARS = 'YEARS',
}

interface DateCalendarProps {
  /** Día elegido "YYYY-MM-DD", o vacío. */
  value: string;
  /** Primer día elegible; los anteriores se ven deshabilitados. */
  min?: string;
  /** Último día elegible; los posteriores se ven deshabilitados. */
  max?: string;
  onSelect: (dayKey: string) => void;
}

const NAV_BUTTON_CLASSES =
  'flex h-10 w-10 items-center justify-center rounded-full text-ink-600 transition-colors hover:bg-ink-100 disabled:opacity-30 disabled:hover:bg-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand';

const CELL_CLASSES =
  'h-10 rounded-lg text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand';

const yearOf = (monthKey: string) => Number(monthKey.slice(0, YEAR_KEY_LENGTH));

const toMonthKeyOf = (year: number, monthIndex: number) =>
  `${year}-${String(monthIndex + 1).padStart(2, '0')}`;

/** Mes que se ve al abrir: el del valor, o el de hoy llevado al rango permitido. */
function resolveInitialMonth(value: string, min?: string, max?: string): string {
  const todayKey = toDayKey(new Date());
  const anchor = value || todayKey;
  const clamped = min && anchor < min ? min : max && anchor > max ? max : anchor;
  return toMonthKey(clamped);
}

/**
 * Calendario de un mes con la semana de lunes a domingo. El título abre la elección de mes y
 * año (y, tocando el año, una página de años) para llegar lejos sin tocar la flecha decenas de veces.
 */
export const DateCalendar: React.FC<DateCalendarProps> = ({ value, min, max, onSelect }) => {
  const { t } = useTranslation();
  const [view, setView] = useState(CalendarView.DAYS);
  const [visibleMonth, setVisibleMonth] = useState(() => resolveInitialMonth(value, min, max));
  const visibleYear = yearOf(visibleMonth);
  const yearPageStart = Math.floor(visibleYear / YEARS_PER_PAGE) * YEARS_PER_PAGE;
  const todayKey = toDayKey(new Date());
  const weekdayInitials = useMemo(buildWeekdayInitials, []);
  // Siempre 6 semanas: el panel no cambia de alto al pasar de mes.
  const cells = useMemo(() => {
    const monthCells = buildMonthGrid(visibleMonth);
    const missing = DAYS_IN_WEEK * MAX_WEEKS_IN_MONTH - monthCells.length;
    return [...monthCells, ...Array.from({ length: missing }, () => null)];
  }, [visibleMonth]);

  const minMonth = min ? toMonthKey(min) : undefined;
  const maxMonth = max ? toMonthKey(max) : undefined;
  const minYear = min ? yearOf(min) : undefined;
  const maxYear = max ? yearOf(max) : undefined;

  const handlePickMonth = (monthIndex: number) => {
    setVisibleMonth(toMonthKeyOf(visibleYear, monthIndex));
    setView(CalendarView.DAYS);
  };

  const handlePickYear = (year: number) => {
    setVisibleMonth(toMonthKeyOf(year, Number(visibleMonth.slice(YEAR_KEY_LENGTH + 1)) - 1));
    setView(CalendarView.MONTHS);
  };

  const renderHeader = (config: {
    title: React.ReactNode;
    titleLabel?: string;
    onTitleClick?: () => void;
    previousLabel: string;
    nextLabel: string;
    onPrevious: () => void;
    onNext: () => void;
    isPreviousDisabled: boolean;
    isNextDisabled: boolean;
  }) => (
    <div className="mb-2 flex items-center justify-between gap-1">
      <button
        type="button"
        onClick={config.onPrevious}
        disabled={config.isPreviousDisabled}
        aria-label={config.previousLabel}
        className={NAV_BUTTON_CLASSES}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
      </button>
      {config.onTitleClick ? (
        <button
          type="button"
          onClick={config.onTitleClick}
          aria-label={config.titleLabel}
          className="flex h-10 items-center gap-1 rounded-lg px-2 text-ink-800 transition-colors hover:bg-ink-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
        >
          <Typography variant={TypographyVariant.BODY_SEMIBOLD} as="span">
            {config.title}
          </Typography>
          <ChevronDown className="h-4 w-4 text-ink-500" aria-hidden />
        </button>
      ) : (
        <Typography variant={TypographyVariant.BODY_SEMIBOLD} as="span">
          {config.title}
        </Typography>
      )}
      <button
        type="button"
        onClick={config.onNext}
        disabled={config.isNextDisabled}
        aria-label={config.nextLabel}
        className={NAV_BUTTON_CLASSES}
      >
        <ChevronRight className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );

  if (view === CalendarView.YEARS) {
    const years = Array.from({ length: YEARS_PER_PAGE }, (_, offset) => yearPageStart + offset);
    return (
      <div>
        {renderHeader({
          title: `${yearPageStart} – ${yearPageStart + YEARS_PER_PAGE - 1}`,
          previousLabel: t(TEXT.GENERAL.DATE_FIELD.PREVIOUS_YEARS),
          nextLabel: t(TEXT.GENERAL.DATE_FIELD.NEXT_YEARS),
          onPrevious: () => setVisibleMonth(toMonthKeyOf(visibleYear - YEARS_PER_PAGE, 0)),
          onNext: () => setVisibleMonth(toMonthKeyOf(visibleYear + YEARS_PER_PAGE, 0)),
          isPreviousDisabled: minYear !== undefined && yearPageStart <= minYear,
          isNextDisabled: maxYear !== undefined && yearPageStart + YEARS_PER_PAGE > maxYear,
        })}
        <div className="grid grid-cols-4 gap-1.5">
          {years.map((year) => {
            const isDisabled =
              (minYear !== undefined && year < minYear) ||
              (maxYear !== undefined && year > maxYear);
            return (
              <button
                key={year}
                type="button"
                disabled={isDisabled}
                onClick={() => handlePickYear(year)}
                className={tailwind(
                  CELL_CLASSES,
                  year === visibleYear ? 'bg-brand text-white' : 'text-ink-700 hover:bg-ink-100',
                  isDisabled && 'text-ink-300 hover:bg-transparent',
                )}
              >
                {year}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (view === CalendarView.MONTHS) {
    return (
      <div>
        {renderHeader({
          title: visibleYear,
          titleLabel: t(TEXT.GENERAL.DATE_FIELD.CHOOSE_YEAR),
          onTitleClick: () => setView(CalendarView.YEARS),
          previousLabel: t(TEXT.GENERAL.DATE_FIELD.PREVIOUS_YEAR),
          nextLabel: t(TEXT.GENERAL.DATE_FIELD.NEXT_YEAR),
          onPrevious: () => setVisibleMonth(toMonthKeyOf(visibleYear - 1, 0)),
          onNext: () => setVisibleMonth(toMonthKeyOf(visibleYear + 1, 0)),
          isPreviousDisabled: minYear !== undefined && visibleYear <= minYear,
          isNextDisabled: maxYear !== undefined && visibleYear >= maxYear,
        })}
        <div className="grid grid-cols-4 gap-1.5">
          {Array.from({ length: MONTHS_IN_YEAR }, (_, monthIndex) => {
            const monthKey = toMonthKeyOf(visibleYear, monthIndex);
            const isDisabled =
              (minMonth !== undefined && monthKey < minMonth) ||
              (maxMonth !== undefined && monthKey > maxMonth);
            return (
              <button
                key={monthKey}
                type="button"
                disabled={isDisabled}
                onClick={() => handlePickMonth(monthIndex)}
                className={tailwind(
                  CELL_CLASSES,
                  monthKey === visibleMonth
                    ? 'bg-brand text-white'
                    : 'text-ink-700 hover:bg-ink-100',
                  isDisabled && 'text-ink-300 hover:bg-transparent',
                )}
              >
                {formatShortMonth(monthIndex)}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div>
      {renderHeader({
        title: formatMonthLabel(visibleMonth),
        titleLabel: t(TEXT.GENERAL.DATE_FIELD.CHOOSE_MONTH_AND_YEAR),
        onTitleClick: () => setView(CalendarView.MONTHS),
        previousLabel: t(TEXT.GENERAL.DATE_FIELD.PREVIOUS_MONTH),
        nextLabel: t(TEXT.GENERAL.DATE_FIELD.NEXT_MONTH),
        onPrevious: () => setVisibleMonth(shiftMonth(visibleMonth, -1)),
        onNext: () => setVisibleMonth(shiftMonth(visibleMonth, 1)),
        isPreviousDisabled: minMonth !== undefined && visibleMonth <= minMonth,
        isNextDisabled: maxMonth !== undefined && visibleMonth >= maxMonth,
      })}

      <div
        className="grid grid-cols-7 gap-y-1"
        role="group"
        aria-label={formatMonthLabel(visibleMonth)}
      >
        {weekdayInitials.map((initial, index) => (
          <span
            key={index}
            aria-hidden
            className="flex h-8 items-center justify-center text-xs font-semibold uppercase text-ink-400"
          >
            {initial}
          </span>
        ))}
        {cells.map((dayKey, index) => {
          if (!dayKey) return <span key={`blank-${index}`} className="h-10" />;
          const isSelected = dayKey === value;
          const isToday = dayKey === todayKey;
          const isDisabled =
            (min !== undefined && dayKey < min) || (max !== undefined && dayKey > max);
          return (
            <button
              key={dayKey}
              type="button"
              disabled={isDisabled}
              aria-label={formatDayForScreenReader(dayKey)}
              aria-pressed={isSelected}
              aria-current={isToday ? 'date' : undefined}
              onClick={() => onSelect(dayKey)}
              className={tailwind(
                CELL_CLASSES,
                'tabular-nums',
                isSelected ? 'bg-brand text-white' : 'text-ink-700 hover:bg-ink-100',
                isToday && !isSelected && 'border border-brand text-brand',
                isDisabled && 'text-ink-300 hover:bg-transparent',
              )}
            >
              {dayOfMonth(dayKey)}
            </button>
          );
        })}
      </div>
    </div>
  );
};
