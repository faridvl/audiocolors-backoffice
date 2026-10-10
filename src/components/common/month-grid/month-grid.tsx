import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { formatShortMonth } from '@/shared/utils/formatters';
import { tailwind } from '@/utils/tailwind-utils';

const MONTHS_IN_YEAR = 12;

interface MonthGridProps {
  /** Mes elegido "YYYY-MM", o vacío. */
  value: string;
  onChange: (monthKey: string) => void;
  /** Primer mes elegible "YYYY-MM"; los anteriores se ven deshabilitados. */
  minMonth?: string;
  previousYearLabel: string;
  nextYearLabel: string;
}

const toMonthKey = (year: number, monthIndex: number) =>
  `${year}-${String(monthIndex + 1).padStart(2, '0')}`;

/**
 * Elegir un mes de cualquier año: los 12 meses en cuadrícula y flechas para
 * cambiar de año. Reemplaza a una lista de meses, que crecía sin límite.
 */
export const MonthGrid: React.FC<MonthGridProps> = ({
  value,
  onChange,
  minMonth,
  previousYearLabel,
  nextYearLabel,
}) => {
  const initialYear = Number(
    (value || minMonth || toMonthKey(new Date().getFullYear(), 0)).slice(0, 4),
  );
  const [year, setYear] = useState(initialYear);
  const minYear = minMonth ? Number(minMonth.slice(0, 4)) : undefined;

  return (
    <div className="rounded-lg border border-ink-200 p-3">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setYear((current) => current - 1)}
          disabled={minYear !== undefined && year <= minYear}
          aria-label={previousYearLabel}
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink-600 hover:bg-ink-100 disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>
        <Typography variant={TypographyVariant.BODY_SEMIBOLD} as="span">
          {year}
        </Typography>
        <button
          type="button"
          onClick={() => setYear((current) => current + 1)}
          aria-label={nextYearLabel}
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink-600 hover:bg-ink-100"
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-1.5" role="radiogroup" aria-label={String(year)}>
        {Array.from({ length: MONTHS_IN_YEAR }, (_, monthIndex) => {
          const monthKey = toMonthKey(year, monthIndex);
          const isSelected = monthKey === value;
          const isDisabled = minMonth !== undefined && monthKey < minMonth;
          return (
            <button
              key={monthKey}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={isDisabled}
              onClick={() => onChange(monthKey)}
              className={tailwind(
                'h-10 rounded-lg text-sm font-medium transition-colors',
                isSelected ? 'bg-brand text-white' : 'text-ink-700 hover:bg-ink-100',
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
};
