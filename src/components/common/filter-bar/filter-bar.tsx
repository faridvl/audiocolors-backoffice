import React, { useCallback, useState } from 'react';
import { useEscapeKey } from '@/hooks/use-escape-key';
import { useTranslation } from 'react-i18next';
import { Check, SlidersHorizontal, X } from 'lucide-react';
import { tailwind } from '@/utils/tailwind-utils';
import { TEXT } from '@/static/texts/i18n';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { PillSelect, PillSelectOption } from '@/components/common/pill-select/pill-select';
import { ColorDot } from '@/components/common/color-dot/color-dot';

export interface FilterBarField {
  key: string;
  label: string;
  /** Filtro de una sola opción. */
  value?: string;
  options: PillSelectOption[];
  /** Valor de la opción "Todos/Todas". */
  allValue: string;
  /**
   * Valor con el que arranca el filtro. Por defecto es `allValue`; distinto
   * cuando la pantalla filtra algo de entrada (p. ej. solo pacientes activos).
   * Un filtro en su valor por defecto no cuenta como activo ni sale como chip.
   */
  defaultValue?: string;
  onChange?: (value: string) => void;
  /**
   * Filtro de varias opciones: con `values` cada píldora se prende y apaga
   * por separado, y "Todos" (`allValue`) es la lista vacía.
   */
  values?: string[];
  defaultValues?: string[];
  onValuesChange?: (values: string[]) => void;
  /**
   * `inline`: se muestra como dropdown en la barra, fuera del panel. Para
   * filtros con muchas opciones (p. ej. meses), donde las píldoras no escalan.
   * Su propio dropdown ya indica si está activo, así que no suma al contador
   * del botón ni sale como chip.
   */
  inline?: boolean;
  /** Etiqueta accesible del dropdown en línea. */
  ariaLabel?: string;
}

interface FilterBarProps {
  /** Siempre visible junto al botón: el buscador y el selector principal. */
  leading?: React.ReactNode;
  fields: FilterBarField[];
  /** Acción del listado (p. ej. "Nuevo paciente"), a la derecha. */
  trailing?: React.ReactNode;
  /**
   * Total con los filtros actuales. Los filtros se aplican al tocarlos, así
   * que el botón del panel puede decir cuántos resultados va a mostrar.
   */
  resultCount?: number;
}

const fieldDefault = (field: FilterBarField) => field.defaultValue ?? field.allValue;
const isMultiple = (field: FilterBarField) => field.values !== undefined;

function isSameSelection(first: string[], second: string[]): boolean {
  return first.length === second.length && first.every((value) => second.includes(value));
}

const isFieldActive = (field: FilterBarField) =>
  isMultiple(field)
    ? !isSameSelection(field.values ?? [], field.defaultValues ?? [])
    : field.value !== fieldDefault(field);

const resetField = (field: FilterBarField) =>
  isMultiple(field)
    ? field.onValuesChange?.(field.defaultValues ?? [])
    : field.onChange?.(fieldDefault(field));

const isOptionSelected = (field: FilterBarField, optionValue: string) =>
  isMultiple(field)
    ? optionValue === field.allValue
      ? (field.values ?? []).length === 0
      : (field.values ?? []).includes(optionValue)
    : optionValue === field.value;

/** Tocar una opción: en un filtro múltiple prende o apaga esa sola; "Todos" limpia. */
function selectOption(field: FilterBarField, optionValue: string) {
  if (!isMultiple(field)) {
    field.onChange?.(optionValue);
    return;
  }
  const current = field.values ?? [];
  if (optionValue === field.allValue) field.onValuesChange?.([]);
  else if (current.includes(optionValue))
    field.onValuesChange?.(current.filter((value) => value !== optionValue));
  else field.onValuesChange?.([...current, optionValue]);
}

/** En la lista desplegable, elegir "Todos" limpia y elegir otra opción lo quita. */
function normalizeInlineValues(field: FilterBarField, next: string[]): string[] {
  const hadAll = (field.values ?? []).length === 0;
  if (next.includes(field.allValue) && !hadAll) return [];
  return next.filter((value) => value !== field.allValue);
}

/**
 * Marca de ancho fijo al inicio de cada píldora: círculo vacío (o del color de
 * la sede) sin marcar, relleno con ✓ al marcar. Igual ancho en los dos estados
 * para que elegir una opción no empuje a las demás a otra fila.
 */
const OptionMark: React.FC<{ isSelected: boolean; color?: string }> = ({ isSelected, color }) => (
  <span
    aria-hidden
    style={!isSelected && color ? { backgroundColor: color, borderColor: color } : undefined}
    className={tailwind(
      'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors',
      isSelected ? 'border-brand bg-brand text-white' : 'border-ink-300 bg-white',
    )}
  >
    {isSelected && <Check className="h-3 w-3" strokeWidth={3} />}
  </span>
);

interface FilterChip {
  key: string;
  label: string;
  /** El valor solo no dice de qué filtro es (p. ej. "Todos", o un filtro de una opción). */
  showFieldLabel: boolean;
  accentColor?: string;
  onRemove: () => void;
}

const optionLabel = (field: FilterBarField, value: string) =>
  field.options.find((option) => option.value === value)?.label ?? '';

/**
 * Un chip por opción elegida, cada uno con su ×. Un filtro múltiple vaciado
 * cuando su valor por defecto no es "Todos" (p. ej. Estado) muestra un solo
 * chip "Todos" que vuelve al valor por defecto.
 */
function buildChips(field: FilterBarField): FilterChip[] {
  if (!isMultiple(field)) {
    return [
      {
        key: field.value ?? '',
        label: optionLabel(field, field.value ?? ''),
        showFieldLabel: true,
        onRemove: () => resetField(field),
      },
    ];
  }
  const values = field.values ?? [];
  if (values.length === 0) {
    return [
      {
        key: field.allValue,
        label: optionLabel(field, field.allValue),
        showFieldLabel: true,
        onRemove: () => resetField(field),
      },
    ];
  }
  return values.map((value) => ({
    key: value,
    label: optionLabel(field, value),
    showFieldLabel: false,
    accentColor: field.options.find((option) => option.value === value)?.accentColor,
    onRemove: () => field.onValuesChange?.(values.filter((selected) => selected !== value)),
  }));
}

/**
 * Barra de filtros de un listado, al estilo Airbnb.
 *
 * A la vista solo quedan `leading`, un botón "Filtros" con el número de
 * filtros activos y los activos como chips que se quitan con un toque. Los
 * filtros viven en un panel (hoja desde abajo en móvil, diálogo centrado en
 * escritorio) con las opciones como píldoras. Cuatro o cinco selectores en
 * línea dejaban el primer registro fuera de pantalla en un teléfono.
 */
export const FilterBar: React.FC<FilterBarProps> = ({ leading, fields, trailing, resultCount }) => {
  const { t } = useTranslation();
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const inlineFields = fields.filter((field) => field.inline);
  const panelFields = fields.filter((field) => !field.inline);
  const activeFields = panelFields.filter(isFieldActive);
  const clearAll = () => panelFields.forEach(resetField);

  const closePanel = useCallback(() => setIsPanelOpen(false), []);
  useEscapeKey(closePanel, isPanelOpen);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">{leading}</div>

        {/* En móvil va un control por fila, cada uno a lo ancho: juntos en una
            misma fila no caben en 375px sin cortar el texto. */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-2 sm:flex-row">
            {inlineFields.map((field) => (
              <div key={field.key} className="min-w-0 sm:min-w-[10rem] sm:flex-none">
                {isMultiple(field) ? (
                  <PillSelect
                    values={field.values}
                    options={field.options}
                    onValuesChange={(next) =>
                      field.onValuesChange?.(normalizeInlineValues(field, next))
                    }
                    ariaLabel={field.ariaLabel ?? field.label}
                    buttonLabel={(field.values ?? []).length === 0 ? field.label : undefined}
                    isActive={isFieldActive(field)}
                  />
                ) : (
                  <PillSelect
                    value={field.value}
                    options={field.options}
                    onChange={field.onChange}
                    ariaLabel={field.ariaLabel ?? field.label}
                    buttonLabel={field.value === field.allValue ? field.label : undefined}
                    isActive={isFieldActive(field)}
                  />
                )}
              </div>
            ))}
            {panelFields.length > 0 && (
              <Button
                variant={ButtonVariant.SECONDARY}
                onClick={() => setIsPanelOpen(true)}
                aria-haspopup="dialog"
                className={tailwind(
                  'w-full rounded-full sm:w-auto',
                  activeFields.length > 0 && 'border-ink-800',
                )}
              >
                <SlidersHorizontal className="h-4 w-4" aria-hidden />
                {t(TEXT.GENERAL.FILTERS.OPEN)}
                {activeFields.length > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-ink-800 px-1.5 text-xs font-bold text-white">
                    {activeFields.length}
                  </span>
                )}
              </Button>
            )}
          </div>
          {trailing && <div className="[&>*]:w-full sm:[&>*]:w-auto">{trailing}</div>}
        </div>
      </div>

      {activeFields.length > 0 && (
        // En el celular, una sola fila que se desliza (con desvanecido a la
        // derecha); varias filas mezcladas de largo distinto se veían desordenadas.
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={clearAll}
            className="h-8 shrink-0 px-1 text-sm font-medium text-ink-600 underline sm:order-last underline-offset-2 hover:text-ink-900"
          >
            {t(TEXT.GENERAL.FILTERS.CLEAR)}
          </button>
          <div
            className={tailwind(
              'flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pr-6',
              '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
              '[mask-image:linear-gradient(to_right,black_85%,transparent)]',
              'sm:flex-wrap sm:overflow-visible sm:pr-0 sm:[mask-image:none]',
            )}
          >
            {activeFields.flatMap((field) =>
              buildChips(field).map((chip) => (
                <span
                  key={`${field.key}-${chip.key}`}
                  className="flex h-8 min-w-0 shrink-0 items-center gap-1.5 rounded-full border border-ink-200 bg-white pl-3 pr-0.5 text-sm text-ink-800"
                >
                  {chip.accentColor && <ColorDot color={chip.accentColor} />}
                  <span className="truncate">
                    {chip.showFieldLabel && <span className="text-ink-500">{field.label}: </span>}
                    {chip.label}
                  </span>
                  <button
                    type="button"
                    onClick={chip.onRemove}
                    aria-label={t(TEXT.GENERAL.FILTERS.REMOVE, {
                      label: `${field.label}: ${chip.label}`,
                    })}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-500 hover:bg-ink-100"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </span>
              )),
            )}
          </div>
        </div>
      )}

      {isPanelOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/60 lg:items-center lg:p-6"
          onClick={() => setIsPanelOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t(TEXT.GENERAL.FILTERS.TITLE)}
            className="flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-t-card bg-white lg:max-w-xl lg:rounded-card"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative flex items-center justify-center border-b border-ink-100 px-5 py-3">
              <button
                type="button"
                onClick={() => setIsPanelOpen(false)}
                aria-label={t(TEXT.GENERAL.FILTERS.CLOSE)}
                className="absolute left-3 flex h-10 w-10 items-center justify-center rounded-full text-ink-600 hover:bg-ink-100"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
              <Typography variant={TypographyVariant.BODY_BOLD} as="h2">
                {t(TEXT.GENERAL.FILTERS.TITLE)}
              </Typography>
            </div>

            <div className="flex flex-col divide-y divide-ink-100 overflow-y-auto px-5">
              {panelFields.map((field) => {
                const isEmpty = isMultiple(field)
                  ? (field.values ?? []).length === 0
                  : field.value === field.allValue;
                return (
                  <fieldset key={field.key} className="flex flex-col gap-2.5 py-4">
                    <legend className="contents">
                      <span className="flex items-baseline justify-between gap-3">
                        <Typography variant={TypographyVariant.BODY_SEMIBOLD} as="span">
                          {field.label}
                        </Typography>
                        {/* Nada marcado = todas: lo dice el título, no una píldora más. */}
                        {isEmpty ? (
                          <Typography variant={TypographyVariant.HELPER} as="span">
                            {optionLabel(field, field.allValue)}
                          </Typography>
                        ) : (
                          isFieldActive(field) && (
                            <button
                              type="button"
                              onClick={() => resetField(field)}
                              className="text-sm font-medium text-brand-700 hover:underline"
                            >
                              {t(TEXT.GENERAL.FILTERS.CLEAR)}
                            </button>
                          )
                        )}
                      </span>
                    </legend>
                    <div
                      className="flex flex-wrap gap-2"
                      role={isMultiple(field) ? 'group' : 'radiogroup'}
                      aria-label={field.label}
                    >
                      {field.options
                        .filter((option) => option.value !== field.allValue)
                        .map((option) => {
                          const isSelected = isOptionSelected(field, option.value);
                          return (
                            <button
                              key={option.value}
                              type="button"
                              role={isMultiple(field) ? 'checkbox' : 'radio'}
                              aria-checked={isSelected}
                              onClick={() =>
                                !isMultiple(field) && isSelected
                                  ? resetField(field)
                                  : selectOption(field, option.value)
                              }
                              className={tailwind(
                                'flex h-9 items-center gap-2 rounded-full border pl-2.5 pr-3.5 text-sm font-medium transition-colors',
                                isSelected
                                  ? 'border-brand bg-brand-50 text-brand-700'
                                  : 'border-ink-200 bg-white text-ink-700 hover:border-ink-400',
                              )}
                            >
                              <OptionMark isSelected={isSelected} color={option.accentColor} />
                              {option.label}
                            </button>
                          );
                        })}
                    </div>
                  </fieldset>
                );
              })}
            </div>

            <div
              className="flex items-center justify-between gap-3 border-t border-ink-100 px-5 py-3"
              style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
            >
              <button
                type="button"
                onClick={clearAll}
                disabled={activeFields.length === 0}
                className="px-1 text-sm font-semibold text-ink-800 underline underline-offset-2 disabled:text-ink-300 disabled:no-underline"
              >
                {t(TEXT.GENERAL.FILTERS.CLEAR_ALL)}
              </button>
              <Button variant={ButtonVariant.PRIMARY} onClick={() => setIsPanelOpen(false)}>
                {resultCount === undefined
                  ? t(TEXT.GENERAL.FILTERS.APPLY)
                  : t(TEXT.GENERAL.FILTERS.SHOW_RESULTS, { count: resultCount })}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
