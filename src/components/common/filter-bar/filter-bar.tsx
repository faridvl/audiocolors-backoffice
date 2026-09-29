import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SlidersHorizontal, X } from 'lucide-react';
import { tailwind } from '@/utils/tailwind-utils';
import { TEXT } from '@/static/texts/i18n';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { PillSelect, PillSelectOption } from '@/components/common/pill-select/pill-select';

export interface FilterBarField {
  key: string;
  label: string;
  value: string;
  options: PillSelectOption[];
  /** Valor de la opción "Todos/Todas". */
  allValue: string;
  /**
   * Valor con el que arranca el filtro. Por defecto es `allValue`; distinto
   * cuando la pantalla filtra algo de entrada (p. ej. solo pacientes activos).
   * Un filtro en su valor por defecto no cuenta como activo ni sale como chip.
   */
  defaultValue?: string;
  onChange: (value: string) => void;
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
const isFieldActive = (field: FilterBarField) => field.value !== fieldDefault(field);

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
  const clearAll = () => panelFields.forEach((field) => field.onChange(fieldDefault(field)));

  useEffect(() => {
    if (!isPanelOpen) return undefined;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsPanelOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isPanelOpen]);

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
                <PillSelect
                  value={field.value}
                  options={field.options}
                  onChange={field.onChange}
                  ariaLabel={field.ariaLabel ?? field.label}
                  buttonLabel={field.value === field.allValue ? field.label : undefined}
                  isActive={isFieldActive(field)}
                />
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
        <div className="flex flex-wrap items-center gap-2">
          {activeFields.map((field) => {
            const optionLabel =
              field.options.find((option) => option.value === field.value)?.label ?? '';
            return (
              <span
                key={field.key}
                className="flex min-w-0 items-center gap-1 rounded-full border border-ink-200 bg-white py-0.5 pl-3 pr-0.5 text-sm text-ink-800"
              >
                <span className="truncate">
                  <span className="text-ink-500">{field.label}:</span> {optionLabel}
                </span>
                <button
                  type="button"
                  onClick={() => field.onChange(fieldDefault(field))}
                  aria-label={t(TEXT.GENERAL.FILTERS.REMOVE, { label: field.label })}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-500 hover:bg-ink-100"
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                </button>
              </span>
            );
          })}
          <button
            type="button"
            onClick={clearAll}
            className="px-2 text-sm font-medium text-ink-600 underline underline-offset-2 hover:text-ink-900"
          >
            {t(TEXT.GENERAL.FILTERS.CLEAR)}
          </button>
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
              {panelFields.map((field) => (
                <fieldset key={field.key} className="flex flex-col gap-3 py-5">
                  <legend className="contents">
                    <Typography variant={TypographyVariant.SUBTITLE} as="span">
                      {field.label}
                    </Typography>
                  </legend>
                  <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={field.label}>
                    {field.options.map((option) => {
                      const isSelected = option.value === field.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => field.onChange(option.value)}
                          className={tailwind(
                            'min-h-[40px] rounded-full border px-4 py-2 text-sm transition-colors',
                            isSelected
                              ? 'border-ink-900 bg-ink-900 font-medium text-white'
                              : 'border-ink-200 bg-white text-ink-700 hover:border-ink-800',
                          )}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
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
