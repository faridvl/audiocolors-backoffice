import React from 'react';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { Check, ChevronDown } from 'lucide-react';
import { tailwind } from '@/utils/tailwind-utils';

export interface PillSelectOption {
  value: string;
  /** Texto completo: el que se ve en el botón cuando esta opción está elegida. */
  label: string;
  /** Texto dentro de la lista cuando el grupo ya da contexto (p. ej. "Octubre" bajo "2026"). */
  shortLabel?: string;
  /** Encabezado bajo el que se agrupa la opción (p. ej. el año). */
  group?: string;
}

interface PillSelectProps {
  value: string;
  options: PillSelectOption[];
  onChange: (value: string) => void;
  ariaLabel: string;
  /** Texto del botón en lugar de la opción elegida (p. ej. "Mes" sin filtro aplicado). */
  buttonLabel?: string;
  /** Marca el borde oscuro de "filtro aplicado". */
  isActive?: boolean;
  className?: string;
}

/**
 * Selector en forma de píldora, con la misma altura y borde que los botones
 * de la barra de filtros. Reemplaza al `<select>` nativo, cuya lista la dibuja
 * el sistema operativo y no se puede estilizar: aquí la lista es un panel de
 * la app, con la opción elegida marcada y agrupación opcional (p. ej. meses
 * por año). Teclado y lector de pantalla los resuelve Headless UI.
 */
export const PillSelect: React.FC<PillSelectProps> = ({
  value,
  options,
  onChange,
  ariaLabel,
  buttonLabel,
  isActive = false,
  className,
}) => {
  const selected = options.find((option) => option.value === value);

  return (
    <Listbox value={value} onChange={onChange}>
      <ListboxButton
        aria-label={ariaLabel}
        className={tailwind(
          'group relative flex min-h-[44px] w-full items-center rounded-full border bg-white py-2.5 pl-5 pr-11 text-left text-sm font-semibold text-ink-700',
          'transition-colors hover:bg-ink-50 focus:outline-none data-[focus]:outline data-[focus]:outline-2 data-[focus]:outline-offset-2 data-[focus]:outline-brand',
          isActive ? 'border-ink-800' : 'border-ink-200',
          className,
        )}
      >
        <span className="truncate">{buttonLabel ?? selected?.label}</span>
        <ChevronDown
          className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500 transition-transform group-data-[open]:rotate-180"
          aria-hidden
        />
      </ListboxButton>

      <ListboxOptions
        anchor={{ to: 'bottom start', gap: 8 }}
        className="z-50 max-h-72 w-[var(--button-width)] min-w-[12rem] overflow-y-auto rounded-card border border-ink-200 bg-white p-1.5 shadow-lg focus:outline-none"
      >
        {options.map((option, index) => {
          const previousGroup = index > 0 ? options[index - 1].group : undefined;
          const startsGroup = option.group && option.group !== previousGroup;

          return (
            <React.Fragment key={option.value}>
              {startsGroup && (
                <div
                  role="presentation"
                  className={tailwind(
                    'px-3 pb-1 pt-2 text-xs font-bold uppercase tracking-wide text-ink-400',
                    index > 0 && 'mt-1 border-t border-ink-100',
                  )}
                >
                  {option.group}
                </div>
              )}
              <ListboxOption
                value={option.value}
                className={tailwind(
                  'group flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-ink-700',
                  'data-[focus]:bg-ink-100 data-[selected]:font-semibold data-[selected]:text-ink-900',
                  !option.group && index === 0 && options.length > 1 && 'mb-1',
                )}
              >
                <span className="truncate">{option.shortLabel ?? option.label}</span>
                <Check
                  className="invisible h-4 w-4 shrink-0 text-ink-900 group-data-[selected]:visible"
                  aria-hidden
                />
              </ListboxOption>
            </React.Fragment>
          );
        })}
      </ListboxOptions>
    </Listbox>
  );
};
