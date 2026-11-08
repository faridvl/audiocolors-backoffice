import React from 'react';
import { DateField } from '@/components/common/date-field/date-field';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';

interface LabDateFieldProps {
  id: string;
  label: string;
  /** "YYYY-MM-DD" elegido en el campo. */
  value: string;
  /** Primer día que se puede elegir. */
  min?: string;
  /** Último día que se puede elegir (hoy). */
  max: string;
  disabled?: boolean;
  /** Error del campo: se muestra debajo y marca el campo como inválido. */
  errorMessage?: string | null;
  onChange: (date: string) => void;
}

/** Campo de un solo día del laboratorio (envío y entrega de los audífonos). */
export const LabDateField: React.FC<LabDateFieldProps> = ({
  id,
  label,
  value,
  min,
  max,
  disabled,
  errorMessage,
  onChange,
}) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id}>
      <Typography variant={TypographyVariant.BODY_SEMIBOLD} as="span">
        {label}
      </Typography>
    </label>
    <DateField
      id={id}
      value={value}
      min={min}
      max={max}
      disabled={disabled}
      errorMessage={errorMessage}
      onChange={onChange}
    />
  </div>
);
