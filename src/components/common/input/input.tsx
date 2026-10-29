import React, { useState } from 'react';
import { Field, useField } from 'formik';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { tailwind } from '@/utils/tailwind-utils';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';

/**
 * Estilo unico de campo. En Zynka estas clases estaban duplicadas literal
 * entre patient-create y patient-edit; aqui viven en un solo sitio.
 *
 * `text-base` (16px) y no `text-sm`: por debajo de 16px, iOS hace zoom
 * automatico al enfocar el campo (se ve en cada input/select del formulario).
 */
export const inputBaseClasses =
  'w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-base text-ink-800 ' +
  'placeholder:text-ink-400 transition-colors ' +
  'focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 ' +
  'disabled:cursor-not-allowed disabled:bg-ink-50';

interface FormFieldProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  /** Marca el campo como "(Opcional)" junto al label, en vez de usar el placeholder para eso. */
  optional?: boolean;
  disabled?: boolean;
  as?: 'input' | 'select' | 'textarea';
  maxLength?: number;
  /** Muestra "escritos / máximo" debajo del campo. Requiere `maxLength`. */
  showCount?: boolean;
  hint?: string;
  className?: string;
  children?: React.ReactNode;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Teclado virtual correcto en iOS/Android para campos numéricos o de teléfono. */
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  /** Botón de ícono dentro del campo, a la derecha (posicionado `absolute`, ancho `w-11`). */
  endAdornment?: React.ReactNode;
  /** Texto gris dentro del campo, a la izquierda; no es parte del valor (p. ej. "+506"). */
  startAdornment?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  type = 'text',
  placeholder,
  required = false,
  optional = false,
  disabled = false,
  as = 'input',
  maxLength,
  showCount = false,
  hint,
  className,
  children,
  onChange,
  inputMode,
  endAdornment,
  startAdornment,
}) => {
  const { t } = useTranslation();
  const [{ value }, { error, touched }] = useField<unknown>(name);
  const [showPassword, setShowPassword] = useState(false);
  const isCountVisible = showCount && maxLength !== undefined;
  const length = typeof value === 'string' ? value.length : 0;
  const isPassword = as === 'input' && type === 'password';
  const resolvedType = isPassword && showPassword ? 'text' : type;
  // El error reemplaza a la ayuda en el mismo lugar: si se apilaran, el botón de guardar bajaría.
  const errorText = touched && typeof error === 'string' ? error : undefined;
  const hasMessage = Boolean(errorText || hint);
  const messageId = errorText ? `${name}-error` : hint ? `${name}-hint` : undefined;

  return (
    <div className={tailwind('flex flex-col gap-1.5', className)}>
      <label htmlFor={name}>
        <Typography variant={TypographyVariant.BODY}>
          {label}
          {required && <span className="ml-0.5 text-danger">*</span>}
          {optional && <span className="ml-1 text-ink-400">(Opcional)</span>}
        </Typography>
      </label>

      <div className="relative">
        <Field
          id={name}
          name={name}
          as={as === 'input' ? undefined : as}
          type={as === 'input' ? resolvedType : undefined}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          inputMode={inputMode}
          aria-invalid={errorText ? true : undefined}
          aria-describedby={messageId}
          className={tailwind(
            inputBaseClasses,
            as === 'textarea' && 'min-h-[88px] resize-none',
            (isPassword || endAdornment) && 'pr-11',
            startAdornment && 'pl-[4.5rem]',
          )}
          {...(onChange ? { onChange } : {})}
        >
          {children}
        </Field>

        {startAdornment && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-2.5 left-0 flex items-center border-r border-ink-200 pl-3 pr-2 text-base font-medium text-ink-500"
          >
            {startAdornment}
          </span>
        )}

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-ink-400 hover:text-ink-600"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden />
            ) : (
              <Eye className="h-4 w-4" aria-hidden />
            )}
          </button>
        )}

        {!isPassword && endAdornment}
      </div>

      {(hasMessage || isCountVisible) && (
        <div className="flex items-start justify-between gap-3">
          {errorText ? (
            <Typography id={messageId} variant={TypographyVariant.ERROR}>
              {errorText}
            </Typography>
          ) : (
            hint && (
              <Typography id={messageId} variant={TypographyVariant.HELPER}>
                {hint}
              </Typography>
            )
          )}
          {isCountVisible && (
            <Typography
              variant={TypographyVariant.HELPER}
              className="ml-auto shrink-0 tabular-nums"
              aria-live="polite"
            >
              {t(TEXT.GENERAL.CHARACTER_COUNT, {
                count: length,
                max: maxLength,
              })}
            </Typography>
          )}
        </div>
      )}
    </div>
  );
};
