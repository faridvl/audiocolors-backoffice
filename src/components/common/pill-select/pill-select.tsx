import React from 'react';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { Check, ChevronDown } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-is-mobile';
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
  /** Ícono a la izquierda del texto, en el botón y en la lista. */
  icon?: React.ReactNode;
  /** Con `icon`, deja el texto solo para lectores de pantalla. */
  isLabelHidden?: boolean;
  /** Opción atenuada y tachada (p. ej. un registro descartado que sigue visible). */
  isMuted?: boolean;
  /** Etiqueta corta a la derecha del texto (p. ej. "Mal hecha"). */
  badge?: string;
}

const PillSelectBadge: React.FC<{ label: string }> = ({ label }) => (
  <span className="shrink-0 rounded-full bg-danger/10 px-2 py-0.5 text-xs font-semibold text-danger no-underline">
    {label}
  </span>
);

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
  /** En móvil (menos de `sm`) la lista se abre como hoja inferior, sin tapar el resto del formulario. */
  isSheetOnMobile?: boolean;
  /** Sin interacción y con aspecto atenuado (p. ej. mientras falta un dato previo). */
  isDisabled?: boolean;
  /** El texto elegido se muestra completo (sin "…") y la etiqueta corta queda pegada a la derecha. */
  isLabelFull?: boolean;
  className?: string;
}

const SHEET_OPTIONS_CLASSES =
  'fixed inset-x-0 bottom-0 z-50 max-h-[70dvh] overflow-y-auto rounded-t-card border border-ink-200 bg-white p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-lg focus:outline-none';
const POPOVER_OPTIONS_CLASSES =
  'z-50 max-h-72 w-[var(--button-width)] min-w-[12rem] overflow-y-auto rounded-card border border-ink-200 bg-white p-1.5 shadow-lg focus:outline-none';

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
  isSheetOnMobile = false,
  isDisabled = false,
  isLabelFull = false,
  className,
}) => {
  const isSheet = useIsMobile() && isSheetOnMobile;
  const isMultiple = values !== undefined;
  const selectedOption = isMultiple ? undefined : options.find((option) => option.value === value);
  const selectedLabel = isMultiple
    ? options
        .filter((option) => values.includes(option.value))
        .map((option) => option.label)
        .join(', ')
    : selectedOption?.label;
  const handleChange = (next: string | string[]) => {
    if (Array.isArray(next)) onValuesChange?.(next);
    else onChange?.(next);
  };

  return (
    <Listbox
      value={isMultiple ? values : (value ?? '')}
      onChange={handleChange}
      multiple={isMultiple}
      disabled={isDisabled}
    >
      {({ open }) => (
        <>
          <ListboxButton
            aria-label={ariaLabel}
            className={tailwind(
              'group relative flex w-full items-center border bg-white py-2.5 pr-11 text-left',
              'transition-colors data-[disabled]:cursor-not-allowed data-[disabled]:bg-ink-50 data-[disabled]:opacity-60 focus:outline-none data-[focus]:outline data-[focus]:outline-2 data-[focus]:outline-offset-2 data-[focus]:outline-brand',
              BUTTON_VARIANT_STYLES[variant],
              isActive ? 'border-ink-800' : 'border-ink-200',
              className,
            )}
          >
            {!buttonLabel && selectedOption?.icon && (
              <span aria-hidden className="mr-2 flex shrink-0 items-center">
                {selectedOption.icon}
              </span>
            )}
            <span
              className={tailwind(
                isLabelFull ? 'min-w-0 whitespace-normal' : 'truncate',
                !selectedLabel && !buttonLabel && 'text-ink-400',
                !buttonLabel && selectedOption?.isLabelHidden && 'sr-only',
                !buttonLabel && selectedOption?.isMuted && 'text-ink-400 line-through',
              )}
            >
              {buttonLabel ?? (selectedLabel || placeholder)}
            </span>
            {!buttonLabel && selectedOption?.badge && (
              <span className={tailwind('ml-2 flex shrink-0', isLabelFull && 'ml-auto pl-2')}>
                <PillSelectBadge label={selectedOption.badge} />
              </span>
            )}
            <ChevronDown
              className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500 transition-transform group-data-[open]:rotate-180"
              aria-hidden
            />
          </ListboxButton>

          {isSheet && open && (
            <div aria-hidden className="fixed inset-0 z-40 animate-fade-in bg-ink-900/60" />
          )}
          <ListboxOptions
            anchor={isSheet ? undefined : { to: 'bottom start', gap: 8 }}
            className={isSheet ? SHEET_OPTIONS_CLASSES : POPOVER_OPTIONS_CLASSES}
          >
            {options.map((option, index) => {
              const previousGroup = index > 0 ? options[index - 1].group : undefined;
              const startsGroup = option.group && option.group !== previousGroup;
              // Una opción suelta después de un grupo (p. ej. "Sin cita" tras los meses) no es del grupo.
              const endsGroup = !option.group && Boolean(previousGroup);

              return (
                <React.Fragment key={option.value}>
                  {endsGroup && (
                    <div role="presentation" className="my-1 border-t border-ink-100" />
                  )}
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
                      isSheet && 'min-h-[44px] text-base',
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
                      {option.icon && (
                        <span aria-hidden className="flex shrink-0 items-center">
                          {option.icon}
                        </span>
                      )}
                      <span
                        className={tailwind(
                          isLabelFull ? 'whitespace-normal' : 'truncate',
                          option.isLabelHidden && 'sr-only',
                          option.isMuted && 'text-ink-400 line-through',
                        )}
                      >
                        {option.shortLabel ?? option.label}
                      </span>
                      {option.badge && <PillSelectBadge label={option.badge} />}
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
        </>
      )}
    </Listbox>
  );
};
