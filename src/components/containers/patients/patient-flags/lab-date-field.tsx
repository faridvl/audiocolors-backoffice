import React from 'react';
import { inputBaseClasses } from '@/components/common/input/input';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { tailwind } from '@/utils/tailwind-utils';

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
  onChange,
}) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id}>
      <Typography variant={TypographyVariant.BODY_SEMIBOLD} as="span">
        {label}
      </Typography>
    </label>
    <input
      id={id}
      type="date"
      min={min}
      max={max}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      // Safari de iOS dibuja el input de fecha con su propio estilo; sin apariencia nativa
      // queda alineado con el resto de campos.
      className={tailwind(
        inputBaseClasses,
        'block h-[46px] min-w-0 appearance-none text-left',
        '[&::-webkit-date-and-time-value]:text-left',
      )}
    />
  </div>
);
