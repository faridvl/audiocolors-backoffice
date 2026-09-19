import React from 'react';
import { X } from 'lucide-react';
import { tailwind } from '@/utils/tailwind-utils';
import { inputBaseClasses } from '@/components/common/input/input';

export interface FilterDropdownOption {
  label: string;
  value: string;
}

interface FilterDropdownProps {
  value: string;
  options: FilterDropdownOption[];
  allValue: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  className?: string;
  /** Texto de la opción "Todos" mientras el select está colapsado (p. ej. "Mes", "Año"). */
  placeholderLabel?: string;
}

/**
 * Select que, al elegir un valor distinto de "Todos", se convierte en un
 * badge con una x para quitar el filtro. Evita que quede ambiguo cómo
 * limpiar un filtro que ya no muestra la opción "Todos" en pantalla.
 */
export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  value,
  options,
  allValue,
  onChange,
  ariaLabel,
  className,
  placeholderLabel,
}) => {
  if (value === allValue) {
    return (
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={ariaLabel}
        className={tailwind(inputBaseClasses, 'sm:w-auto', className)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.value === allValue && placeholderLabel ? placeholderLabel : option.label}
          </option>
        ))}
      </select>
    );
  }

  const label = options.find((option) => option.value === value)?.label ?? '';

  return (
    <span className="inline-flex items-center justify-center gap-1 rounded-lg border border-transparent bg-brand-50 px-3 py-2.5 text-base font-medium text-brand-700">
      {label}
      <button
        type="button"
        onClick={() => onChange(allValue)}
        aria-label={`Quitar filtro ${label}`}
        className="rounded-full p-0.5 hover:bg-brand-100"
      >
        <X className="h-3.5 w-3.5" aria-hidden />
      </button>
    </span>
  );
};
