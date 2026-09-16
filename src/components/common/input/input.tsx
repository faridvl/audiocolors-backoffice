import React from 'react';
import { Field, ErrorMessage } from 'formik';
import { tailwind } from '@/utils/tailwind-utils';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';

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
  disabled?: boolean;
  as?: 'input' | 'select' | 'textarea';
  maxLength?: number;
  hint?: string;
  className?: string;
  children?: React.ReactNode;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Teclado virtual correcto en iOS/Android para campos numéricos o de teléfono. */
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
}

export const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  as = 'input',
  maxLength,
  hint,
  className,
  children,
  onChange,
  inputMode,
}) => (
  <div className={tailwind('flex flex-col gap-1.5', className)}>
    <label htmlFor={name}>
      <Typography variant={TypographyVariant.BODY_SEMIBOLD}>
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </Typography>
    </label>

    <Field
      id={name}
      name={name}
      as={as === 'input' ? undefined : as}
      type={as === 'input' ? type : undefined}
      placeholder={placeholder}
      disabled={disabled}
      maxLength={maxLength}
      inputMode={inputMode}
      className={tailwind(inputBaseClasses, as === 'textarea' && 'min-h-[88px] resize-none')}
      {...(onChange ? { onChange } : {})}
    >
      {children}
    </Field>

    {hint && <Typography variant={TypographyVariant.HELPER}>{hint}</Typography>}

    <ErrorMessage name={name}>
      {(message) => <Typography variant={TypographyVariant.ERROR}>{message}</Typography>}
    </ErrorMessage>
  </div>
);
