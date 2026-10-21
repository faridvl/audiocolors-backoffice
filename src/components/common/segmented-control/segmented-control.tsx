import React from 'react';
import { tailwind } from '@/utils/tailwind-utils';

export interface SegmentedOption<TValue extends string> {
  value: TValue;
  label: string;
  /** Clases de la opción cuando está elegida; por defecto, blanca con sombra. */
  selectedClassName?: string;
}

interface SegmentedControlProps<TValue extends string> {
  options: SegmentedOption<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
  ariaLabel: string;
  className?: string;
}

/** Selector compacto de pocas opciones excluyentes, con área táctil de 44px por opción. */
export function SegmentedControl<TValue extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
}: SegmentedControlProps<TValue>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={tailwind(
        'inline-flex shrink-0 rounded-lg border border-ink-200 bg-ink-50 p-0.5',
        className,
      )}
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(option.value)}
            className={tailwind(
              'min-h-[44px] min-w-[52px] rounded-md px-3 text-sm font-semibold transition-colors',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand',
              isSelected
                ? (option.selectedClassName ?? 'bg-white text-ink-900 shadow-sm')
                : 'text-ink-500 hover:text-ink-800',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
