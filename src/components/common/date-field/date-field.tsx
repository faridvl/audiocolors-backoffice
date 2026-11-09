import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DateCalendar } from '@/components/common/date-field/date-calendar';
import { inputBaseClasses } from '@/components/common/input/input';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { useIsMobile } from '@/hooks/use-is-mobile';
import {
  applyDateInputChange,
  DATE_INPUT_MAX_DIGITS,
  DATE_INPUT_MAX_LENGTH,
  dayKeyToInputText,
  inputTextToDayKey,
} from '@/shared/utils/date-input';
import { TEXT } from '@/static/texts/i18n';
import { tailwind } from '@/utils/tailwind-utils';

const PANEL_GAP_PX = 6;
const PANEL_VIEWPORT_PADDING_PX = 12;

const PANEL_CLASSES =
  'fixed z-50 w-[19rem] max-w-[calc(100vw-1.5rem)] rounded-card border border-ink-200 bg-white p-3 shadow-lg focus:outline-none';
const SHEET_CLASSES =
  'fixed inset-x-0 bottom-0 z-50 rounded-t-card border border-ink-200 bg-white p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-lg focus:outline-none';

interface DateFieldProps {
  id: string;
  /** Día elegido "YYYY-MM-DD", o vacío. */
  value: string;
  /** Recibe "YYYY-MM-DD", o vacío mientras lo escrito no sea un día completo, real y dentro del rango. */
  onChange: (dayKey: string) => void;
  onBlur?: () => void;
  /** Primer día que se puede elegir o escribir. */
  min?: string;
  /** Último día que se puede elegir o escribir. */
  max?: string;
  disabled?: boolean;
  /** Error de fuera (p. ej. el de Formik); el de lo que se escribe, si existe, va primero. */
  errorMessage?: string | null;
  /** Para un campo sin label visible. */
  ariaLabel?: string;
  className?: string;
}

/**
 * Campo de fecha de la app: se escribe como "dd/mm/aaaa" (con barras automáticas) o se elige en un
 * calendario. En lugar de `<input type="date">`, que cada navegador dibuja distinto. El valor hacia
 * afuera es siempre "YYYY-MM-DD", así que validaciones y API no cambian.
 */
export const DateField: React.FC<DateFieldProps> = ({
  id,
  value,
  onChange,
  onBlur,
  min,
  max,
  disabled = false,
  errorMessage,
  ariaLabel,
  className,
}) => {
  const { t } = useTranslation();
  const isSheet = useIsMobile();
  const [text, setText] = useState(() => dayKeyToInputText(value));
  const [hasLeftField, setHasLeftField] = useState(false);
  const [panelNode, setPanelNode] = useState<HTMLElement | null>(null);
  const [panelPosition, setPanelPosition] = useState<{ top: number; left: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Lo último que este campo le dio al padre: un value distinto es un cambio de fuera.
  const lastEmittedRef = useRef(value);

  useEffect(() => {
    if (value === lastEmittedRef.current) return;
    lastEmittedRef.current = value;
    setText(dayKeyToInputText(value));
  }, [value]);

  const isOutOfRange = (dayKey: string) =>
    (min !== undefined && dayKey < min) || (max !== undefined && dayKey > max);

  const emit = (nextText: string) => {
    const dayKey = inputTextToDayKey(nextText);
    const nextValue = dayKey && !isOutOfRange(dayKey) ? dayKey : '';
    if (nextValue === lastEmittedRef.current) return;
    lastEmittedRef.current = nextValue;
    onChange(nextValue);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextText = applyDateInputChange(text, event.target.value);
    setText(nextText);
    setHasLeftField(false);
    emit(nextText);
  };

  // El panel mide lo mismo en cualquier mes. Abre abajo; voltea solo si arriba cabe entero y abajo no;
  // si no cabe en ninguno, queda abajo y se desplaza lo justo para verse completo.
  const updatePanelPosition = useCallback(() => {
    const input = inputRef.current;
    if (!panelNode || !input) return;
    const rect = input.getBoundingClientRect();
    const { offsetHeight: height, offsetWidth: width } = panelNode;
    const belowTop = rect.bottom + PANEL_GAP_PX;
    const aboveTop = rect.top - PANEL_GAP_PX - height;
    const maxTop = window.innerHeight - PANEL_VIEWPORT_PADDING_PX - height;
    const fitsBelow = belowTop <= maxTop;
    const fitsAbove = aboveTop >= PANEL_VIEWPORT_PADDING_PX;
    const top = fitsBelow
      ? belowTop
      : fitsAbove
        ? aboveTop
        : Math.max(PANEL_VIEWPORT_PADDING_PX, maxTop);
    const maxLeft = window.innerWidth - PANEL_VIEWPORT_PADDING_PX - width;
    const left = Math.max(PANEL_VIEWPORT_PADDING_PX, Math.min(rect.right - width, maxLeft));
    setPanelPosition((current) =>
      current && current.top === top && current.left === left ? current : { top, left },
    );
  }, [panelNode]);

  useLayoutEffect(() => {
    if (!panelNode || isSheet) return;
    updatePanelPosition();
    window.addEventListener('resize', updatePanelPosition);
    window.addEventListener('scroll', updatePanelPosition, true);
    return () => {
      window.removeEventListener('resize', updatePanelPosition);
      window.removeEventListener('scroll', updatePanelPosition, true);
    };
  }, [panelNode, isSheet, updatePanelPosition]);

  const handleBlur = () => {
    setHasLeftField(true);
    onBlur?.();
  };

  const handleSelect = (dayKey: string, close: () => void) => {
    const nextText = dayKeyToInputText(dayKey);
    setText(nextText);
    setHasLeftField(false);
    emit(nextText);
    onBlur?.();
    close();
  };

  const typedDayKey = inputTextToDayKey(text);
  const typedDigitsCount = text.replace(/\D/g, '').length;
  const typedError = (() => {
    if (!text) return undefined;
    if (typedDigitsCount < DATE_INPUT_MAX_DIGITS) {
      return hasLeftField ? t(TEXT.GENERAL.DATE_FIELD.ERROR_INVALID) : undefined;
    }
    if (!typedDayKey) return t(TEXT.GENERAL.DATE_FIELD.ERROR_INVALID);
    if (min !== undefined && typedDayKey < min) {
      return t(TEXT.GENERAL.DATE_FIELD.ERROR_BEFORE_MIN, { date: dayKeyToInputText(min) });
    }
    if (max !== undefined && typedDayKey > max) {
      return t(TEXT.GENERAL.DATE_FIELD.ERROR_AFTER_MAX, { date: dayKeyToInputText(max) });
    }
    return undefined;
  })();
  const shownError = typedError ?? errorMessage ?? undefined;
  const errorId = `${id}-error`;

  return (
    <div className={tailwind('flex min-w-0 flex-col', className)}>
      <Popover className="relative">
        {({ open }) => (
          <>
            <input
              id={id}
              ref={inputRef}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={text}
              maxLength={DATE_INPUT_MAX_LENGTH}
              placeholder={t(TEXT.GENERAL.DATE_FIELD.PLACEHOLDER)}
              disabled={disabled}
              aria-label={ariaLabel}
              aria-invalid={shownError ? true : undefined}
              aria-describedby={shownError ? errorId : undefined}
              onChange={handleChange}
              onBlur={handleBlur}
              className={tailwind(inputBaseClasses, 'block min-w-0 pr-11')}
            />
            <PopoverButton
              disabled={disabled}
              aria-label={t(TEXT.GENERAL.DATE_FIELD.OPEN_CALENDAR)}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-ink-500 transition-colors hover:text-ink-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50 data-[open]:text-brand"
            >
              <Calendar className="h-4 w-4" aria-hidden />
            </PopoverButton>

            {isSheet && open && (
              <div aria-hidden className="fixed inset-0 z-40 animate-fade-in bg-ink-900/60" />
            )}
            <PopoverPanel
              ref={setPanelNode}
              portal={!isSheet}
              style={isSheet || !panelPosition ? undefined : panelPosition}
              aria-label={t(TEXT.GENERAL.DATE_FIELD.CALENDAR)}
              className={
                isSheet ? SHEET_CLASSES : tailwind(PANEL_CLASSES, !panelPosition && 'invisible')
              }
            >
              {({ close }) => (
                <DateCalendar
                  value={typedDayKey && !isOutOfRange(typedDayKey) ? typedDayKey : value}
                  min={min}
                  max={max}
                  onSelect={(dayKey) => handleSelect(dayKey, close)}
                />
              )}
            </PopoverPanel>
          </>
        )}
      </Popover>

      <div aria-live="polite">
        {shownError && (
          <Typography id={errorId} variant={TypographyVariant.ERROR} className="mt-1.5">
            {shownError}
          </Typography>
        )}
      </div>
    </div>
  );
};
