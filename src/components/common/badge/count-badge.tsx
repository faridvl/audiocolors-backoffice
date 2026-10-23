import React from 'react';
import { tailwind } from '@/utils/tailwind-utils';

interface CountBadgeProps {
  count: number;
  /** Lo que lee un lector de pantalla ("1 novedad sin ver"); el número solo no dice qué cuenta. */
  ariaLabel: string;
  className?: string;
}

/** Contador rojo de algo pendiente de ver. Sin pendientes no se muestra. */
export const CountBadge: React.FC<CountBadgeProps> = ({ count, ariaLabel, className }) =>
  count > 0 ? (
    <span
      aria-label={ariaLabel}
      className={tailwind(
        'inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-danger px-1.5 text-xs font-semibold text-white',
        className,
      )}
    >
      {count}
    </span>
  ) : null;
