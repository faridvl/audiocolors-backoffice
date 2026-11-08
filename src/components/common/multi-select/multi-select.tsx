import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { tailwind } from '@/utils/tailwind-utils';

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
  /** Nombre accesible del campo y de su lista de opciones. */
  ariaLabel: string;
  /** Texto del chip que resume la elección cuando son demasiadas para mostrarlas una a una. */
  getSummaryLabel: (count: number) => string;
  /** Nombre accesible del botón que quita una opción elegida. */
  getRemoveLabel: (label: string) => string;
  className?: string;
}

const SEARCH_THRESHOLD = 6;
const MAX_VISIBLE_CHIPS = 3;
const TOUCH_TARGET_CLASSES = 'min-h-[44px]';
const CHIP_CLASSES =
  'flex max-w-full items-center gap-1 rounded-full bg-brand-50 py-1 pl-3 pr-1 text-sm font-medium text-brand-700';

const normalize = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/**
 * Lista desplegable de selección múltiple. El panel crece dentro del flujo (no flota), así
 * que un contenedor con scroll, como el cuerpo de un modal, no lo corta.
 */
export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selectedValues,
  onChange,
  placeholder,
  searchPlaceholder,
  emptyText,
  ariaLabel,
  getSummaryLabel,
  getRemoveLabel,
  className,
}) => {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const hasSearch = options.length > SEARCH_THRESHOLD;
  const visibleOptions = useMemo(() => {
    const normalizedQuery = normalize(query.trim());
    return normalizedQuery
      ? options.filter((option) => normalize(option.label).includes(normalizedQuery))
      : options;
  }, [options, query]);
  const selectedOptions = options.filter((option) => selectedValues.includes(option.value));
  const activeOption = visibleOptions[activeIndex];
  const activeOptionId = activeOption ? `${listId}-${activeOption.value}` : undefined;

  const closePanel = () => {
    setIsOpen(false);
    setQuery('');
  };

  const openPanel = () => {
    setActiveIndex(0);
    setIsOpen(true);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    panelRef.current?.scrollIntoView({ block: 'nearest' });
    if (!hasSearch) listRef.current?.focus({ preventScroll: true });
  }, [isOpen, hasSearch]);

  useEffect(() => {
    if (isOpen && activeOptionId) {
      document.getElementById(activeOptionId)?.scrollIntoView({ block: 'nearest' });
    }
  }, [isOpen, activeOptionId]);

  const toggleValue = (value: string) =>
    onChange(
      selectedValues.includes(value)
        ? selectedValues.filter((current) => current !== value)
        : [...selectedValues, value],
    );

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      // Solo cierra la lista, no la ventana que la contiene.
      event.stopPropagation();
      closePanel();
      toggleRef.current?.focus();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) => Math.min(current + 1, visibleOptions.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
    } else if (event.key === 'Home') {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      setActiveIndex(Math.max(visibleOptions.length - 1, 0));
    } else if (event.key === 'Enter' || (event.key === ' ' && !hasSearch)) {
      event.preventDefault();
      if (activeOption) toggleValue(activeOption.value);
    }
  };

  return (
    <div ref={rootRef} className={className}>
      <div
        className={tailwind(
          'flex items-stretch rounded-lg border bg-white transition-colors',
          isOpen ? 'border-brand ring-2 ring-brand/20' : 'border-ink-200',
        )}
      >
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 p-1.5">
          {selectedOptions.length === 0 && (
            <div
              onClick={() => (isOpen ? closePanel() : openPanel())}
              className={tailwind(
                TOUCH_TARGET_CLASSES,
                'flex min-w-0 flex-1 cursor-pointer items-center px-1.5',
              )}
            >
              <Typography variant={TypographyVariant.BODY} as="span" className="text-ink-400">
                {placeholder}
              </Typography>
            </div>
          )}
          {selectedOptions.length > MAX_VISIBLE_CHIPS ? (
            <span className={tailwind(CHIP_CLASSES, 'pr-3')}>
              <span className="truncate">{getSummaryLabel(selectedOptions.length)}</span>
            </span>
          ) : (
            selectedOptions.map((option) => (
              <span key={option.value} className={CHIP_CLASSES}>
                <span className="truncate">{option.label}</span>
                <button
                  type="button"
                  onClick={() => toggleValue(option.value)}
                  aria-label={getRemoveLabel(option.label)}
                  className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full hover:bg-brand-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                </button>
              </span>
            ))
          )}
        </div>
        <button
          ref={toggleRef}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-label={ariaLabel}
          onClick={() => (isOpen ? closePanel() : openPanel())}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown' && !isOpen) {
              event.preventDefault();
              openPanel();
            }
          }}
          className={tailwind(
            TOUCH_TARGET_CLASSES,
            'flex w-11 shrink-0 items-center justify-center rounded-r-lg text-ink-500 hover:text-ink-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand',
          )}
        >
          <ChevronDown
            className={tailwind('h-5 w-5 transition-transform', isOpen && 'rotate-180')}
            aria-hidden
          />
        </button>
      </div>

      {isOpen && (
        <div ref={panelRef} className="mt-1 rounded-lg border border-ink-200 bg-white p-1.5">
          {hasSearch && (
            <input
              type="search"
              autoFocus
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              role="combobox"
              aria-expanded
              aria-controls={listId}
              aria-activedescendant={activeOptionId}
              className="mb-1.5 w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-base text-ink-800 placeholder:text-ink-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          )}
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-multiselectable
            aria-label={ariaLabel}
            tabIndex={hasSearch ? -1 : 0}
            onKeyDown={hasSearch ? undefined : handleKeyDown}
            aria-activedescendant={hasSearch ? undefined : activeOptionId}
            className="max-h-60 overflow-y-auto focus:outline-none"
          >
            {visibleOptions.length === 0 ? (
              <li role="presentation">
                <Typography variant={TypographyVariant.HELPER} className="px-2 py-3 text-center">
                  {emptyText}
                </Typography>
              </li>
            ) : (
              visibleOptions.map((option, index) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <li
                    key={option.value}
                    id={`${listId}-${option.value}`}
                    role="option"
                    aria-selected={isSelected}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => toggleValue(option.value)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={tailwind(
                      TOUCH_TARGET_CLASSES,
                      'flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5',
                      index === activeIndex && 'bg-ink-50',
                    )}
                  >
                    <span
                      aria-hidden
                      className={tailwind(
                        'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
                        isSelected ? 'border-brand bg-brand text-white' : 'border-ink-300 bg-white',
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3" strokeWidth={3} />}
                    </span>
                    <Typography
                      variant={TypographyVariant.BODY}
                      as="span"
                      className="min-w-0 flex-1"
                    >
                      {option.label}
                    </Typography>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
