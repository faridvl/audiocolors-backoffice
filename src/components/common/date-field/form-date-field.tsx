import React from 'react';
import { useField } from 'formik';
import { useTranslation } from 'react-i18next';
import { DateField } from '@/components/common/date-field/date-field';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { tailwind } from '@/utils/tailwind-utils';

interface FormDateFieldProps {
  name: string;
  label: string;
  required?: boolean;
  /** Marca el campo como "(Opcional)" junto al label. */
  optional?: boolean;
  disabled?: boolean;
  /** Primer día que se puede elegir o escribir ("YYYY-MM-DD"). */
  min?: string;
  /** Último día que se puede elegir o escribir ("YYYY-MM-DD"). */
  max?: string;
  className?: string;
}

/**
 * Fecha de Formik: mismo label y mismo marcado de error que `FormField`, con el valor guardado
 * como "YYYY-MM-DD" (o vacío), igual que con `<input type="date">`.
 */
export const FormDateField: React.FC<FormDateFieldProps> = ({
  name,
  label,
  required = false,
  optional = false,
  disabled = false,
  min,
  max,
  className,
}) => {
  const { t } = useTranslation();
  const [{ value }, { error, touched }, { setValue, setTouched }] = useField<string>(name);
  const errorText = touched && typeof error === 'string' ? error : undefined;

  return (
    <div className={tailwind('flex flex-col gap-1.5', className)}>
      <label htmlFor={name}>
        <Typography variant={TypographyVariant.BODY}>
          {label}
          {required && <span className="ml-0.5 text-danger">*</span>}
          {optional && <span className="ml-1 text-ink-400">{t(TEXT.GENERAL.OPTIONAL)}</span>}
        </Typography>
      </label>
      <DateField
        id={name}
        value={value ?? ''}
        onChange={(dayKey) => void setValue(dayKey)}
        onBlur={() => void setTouched(true)}
        min={min}
        max={max}
        disabled={disabled}
        errorMessage={errorText}
      />
    </div>
  );
};
