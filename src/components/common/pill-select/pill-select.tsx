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
  /** Color de la barra a la izquierda del texto (p. ej. el de cada sede). */
  accentColor?: string;
}

export enum PillSelectVariant {
  /** Píldora de la barra de filtros. */
  PILL = 'PILL',
  /** Mismo alto, borde y texto que un campo de formulario. */
  FIELD = 'FIELD',
}

const BUTTON_VARIANT_STYLES: Record<PillSelectVariant, string> = {
  [PillSelectVariant.PILL]:
    'min-h-[44px] rounded-full pl-5 text-sm font-semibold text-ink-700 hover:bg-ink-50',
  [PillSelectVariant.FIELD]:
    'rounded-lg pl-3 text-base text-ink-800 data-[open]:border-brand data-[open]:ring-2 data-[open]:ring-brand/20',
};

interface PillSelectProps {
  value?: string;
  options: PillSelectOption[];
  onChange?: (value: string) => void;
  /** Selección múltiple: con `values` la lista marca varias opciones y no se cierra al tocar. */
  values?: string[];
  onValuesChange?: (values: string[]) => void;
  ariaLabel: string;
  /** Texto del botón en lugar de la opción elegida (p. ej. "Mes" sin filtro aplicado). */
  buttonLabel?: string;
  /** Marca el borde oscuro de "filtro aplicado". */
  isActive?: boolean;
  variant?: PillSelectVariant;
  /** Texto en gris cuando ninguna opción está elegida. */
  placeholder?: string;
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
  values,
  onValuesChange,
  ariaLabel,
  buttonLabel,
  isActive = false,
  variant = PillSelectVariant.PILL,
  placeholder,
  className,
}) => {
  const isMultiple = values !== undefined;
  const selectedLabel = isMultiple
    ? options
        .filter((option) => values.includes(option.value))
        .map((option) => option.label)
        .join(', ')
    : options.find((option) => option.value === value)?.label;
  const handleChange = (next: string | string[]) => {
    if (Array.isArray(next)) onValuesChange?.(next);
    else onChange?.(next);
  };

  return (
    <Listbox
      value={isMultiple ? values : (value ?? '')}
      onChange={handleChange}
      multiple={isMultiple}
    >
      <ListboxButton
        aria-label={ariaLabel}
        className={tailwind(
          'group relative flex w-full items-center border bg-white py-2.5 pr-11 text-left',
          'transition-colors focus:outline-none data-[focus]:outline data-[focus]:outline-2 data-[focus]:outline-offset-2 data-[focus]:outline-brand',
          BUTTON_VARIANT_STYLES[variant],
          isActive ? 'border-ink-800' : 'border-ink-200',
          className,
        )}
      >
        <span className={tailwind('truncate', !selectedLabel && !buttonLabel && 'text-ink-400')}>
          {buttonLabel ?? (selectedLabel || placeholder)}
        </span>
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
                <span className="flex min-w-0 items-center gap-2">
                  {option.accentColor && (
                    <span
                      aria-hidden
                      style={{ backgroundColor: option.accentColor }}
                      className="h-4 w-1 shrink-0 rounded-full"
                    />
                  )}
                  <span className="truncate">{option.shortLabel ?? option.label}</span>
                </span>
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
