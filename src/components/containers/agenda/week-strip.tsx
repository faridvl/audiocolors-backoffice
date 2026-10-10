import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatWeekDay } from '@/shared/utils/dates';
import { tailwind } from '@/utils/tailwind-utils';
import { TEXT } from '@/static/texts/i18n';
import { AgendaState } from './use-agenda';

/** Máximo de puntos bajo un día de la franja; más citas no suman puntos. */
const MAX_DAY_DOTS = 3;

export const WeekStrip: React.FC<{ agenda: AgendaState }> = ({ agenda }) => {
  const { t } = useTranslation();

  return (
    <div role="group" aria-label={t(TEXT.AGENDA.WEEK.ARIA)} className="grid grid-cols-7 gap-1">
      {agenda.weekDays.map((weekDay) => {
        const { weekday, day } = formatWeekDay(weekDay.dayKey);
        return (
          <button
            key={weekDay.dayKey}
            type="button"
            onClick={() => agenda.handleSelectDay(weekDay.dayKey)}
            aria-pressed={weekDay.isSelected}
            aria-label={t(TEXT.AGENDA.WEEK.DAY_ARIA, {
              date: `${weekday} ${day}`,
              count: weekDay.count,
            })}
            className={tailwind(
              'flex min-h-[60px] flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 transition-colors',
              weekDay.isSelected ? 'bg-brand text-white' : 'text-ink-700 hover:bg-ink-100',
            )}
          >
            <span
              className={tailwind(
                'text-xs',
                weekDay.isSelected ? 'text-white/80' : 'text-ink-500',
                !weekDay.isSelected && weekDay.isToday && 'font-semibold text-brand-700',
              )}
            >
              {weekday}
            </span>
            <span
              className={tailwind(
                'text-base font-semibold leading-tight',
                !weekDay.isSelected && weekDay.isToday && 'text-brand-700',
              )}
            >
              {day}
            </span>
            {/* Puntos en vez de números: dicen "hay citas" sin pedir lectura. */}
            <span className="flex h-1.5 items-center gap-0.5" aria-hidden>
              {Array.from({ length: Math.min(weekDay.count, MAX_DAY_DOTS) }, (_, index) => (
                <span
                  key={index}
                  className={tailwind(
                    'h-1.5 w-1.5 rounded-full',
                    weekDay.isSelected ? 'bg-white' : 'bg-brand',
                  )}
                />
              ))}
            </span>
          </button>
        );
      })}
    </div>
  );
};
