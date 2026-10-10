import React from 'react';
import { useField } from 'formik';
import {
  PillSelect,
  PillSelectOption,
  PillSelectVariant,
} from '@/components/common/pill-select/pill-select';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { tailwind } from '@/utils/tailwind-utils';

interface FormSelectFieldProps {
  name: string;
  label: string;
  options: PillSelectOption[];
  placeholder?: string;
  required?: boolean;
  optional?: boolean;
  className?: string;
}

/** `FormField` con la lista de la app (colores, opción marcada) en vez del `<select>` nativo. */
export const FormSelectField: React.FC<FormSelectFieldProps> = ({
  name,
  label,
  options,
  placeholder,
  required = false,
  optional = false,
  className,
}) => {
  const [field, meta, helpers] = useField<string>(name);

  return (
    <div className={tailwind('flex flex-col gap-1.5', className)}>
      <Typography variant={TypographyVariant.BODY}>
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
        {optional && <span className="ml-1 text-ink-400">(Opcional)</span>}
      </Typography>

      <PillSelect
        value={field.value}
        options={options}
        onChange={(value) => void helpers.setValue(value)}
        ariaLabel={label}
        variant={PillSelectVariant.FIELD}
        placeholder={placeholder}
      />

      {meta.touched && meta.error && (
        <Typography variant={TypographyVariant.ERROR}>{meta.error}</Typography>
      )}
    </div>
  );
};
