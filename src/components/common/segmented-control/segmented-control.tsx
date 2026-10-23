import React from 'react';
import { tailwind } from '@/utils/tailwind-utils';

export enum SegmentedControlSize {
  REGULAR = 'REGULAR',
  /** Para formularios con muchas filas: sigue siendo cómodo al dedo en iPad. */
  COMPACT = 'COMPACT',
}

const SIZE_STYLES: Record<SegmentedControlSize, string> = {
  [SegmentedControlSize.REGULAR]: 'min-h-[44px] min-w-[52px] px-3',
  [SegmentedControlSize.COMPACT]: 'min-h-[36px] min-w-[44px] px-2.5',
};

export interface SegmentedOption<TValue extends string> {
  value: TValue;
  label: string;
  /** Clases de la opción cuando está elegida; por defecto, blanca con sombra. */
  selectedClassName?: string;
  /** Clases de la opción cuando no está elegida; por defecto, gris. */
  unselectedClassName?: string;
}

interface SegmentedControlProps<TValue extends string> {
  options: SegmentedOption<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
  ariaLabel: string;
  size?: SegmentedControlSize;
  className?: string;
}

/** Selector compacto de pocas opciones excluyentes, con área táctil de 44px por opción. */
export function SegmentedControl<TValue extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  size = SegmentedControlSize.REGULAR,
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
              'rounded-md text-sm font-semibold transition-colors',
              SIZE_STYLES[size],
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand',
              isSelected
                ? (option.selectedClassName ?? 'bg-white text-ink-900 shadow-sm')
                : (option.unselectedClassName ?? 'text-ink-500 hover:text-ink-800'),
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
