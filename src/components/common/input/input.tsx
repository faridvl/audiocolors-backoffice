import React from 'react';
import { Field, ErrorMessage } from 'formik';
import { tailwind } from '@/utils/tailwind-utils';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';

/**
 * Estilo unico de campo. En Zynka estas clases estaban duplicadas literal
 * entre patient-create y patient-edit; aqui viven en un solo sitio.
 */
export const inputBaseClasses =
  'w-full rounded-lg border border-navy-200 bg-white px-3 py-2.5 text-sm text-navy-800 ' +
  'placeholder:text-navy-400 transition-colors ' +
  'focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 ' +
  'disabled:cursor-not-allowed disabled:bg-navy-50';

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
}) => (
  <div className={tailwind('flex flex-col gap-1.5', className)}>
    <label htmlFor={name}>
      <Typography variant={TypographyVariant.LABEL}>
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
      className={tailwind(inputBaseClasses, as === 'textarea' && 'min-h-[88px] resize-none')}
      {...(onChange ? { onChange } : {})}
    >
      {children}
    </Field>

    {hint && <Typography variant={TypographyVariant.CAPTION}>{hint}</Typography>}

    <ErrorMessage name={name}>
      {(message) => <Typography variant={TypographyVariant.ERROR}>{message}</Typography>}
    </ErrorMessage>
  </div>
);
