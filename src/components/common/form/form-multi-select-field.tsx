import React from 'react';
import { useField } from 'formik';
import { useTranslation } from 'react-i18next';
import {
  PillSelect,
  PillSelectOption,
  PillSelectVariant,
} from '@/components/common/pill-select/pill-select';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { tailwind } from '@/utils/tailwind-utils';

interface FormMultiSelectFieldProps {
  name: string;
  label: string;
  options: PillSelectOption[];
  placeholder?: string;
  required?: boolean;
  optional?: boolean;
  isSheetOnMobile?: boolean;
  className?: string;
}

/** Como `FormSelectField`, pero el valor es una lista y la lista de opciones queda abierta al tocar. */
export const FormMultiSelectField: React.FC<FormMultiSelectFieldProps> = ({
  name,
  label,
  options,
  placeholder,
  required = false,
  optional = false,
  isSheetOnMobile = false,
  className,
}) => {
  const { t } = useTranslation();
  const [field, meta, helpers] = useField<string[]>(name);
  // El esquema entrega la key de i18n. Un error de `array().min()` llega como texto; uno de un elemento llegaría como lista.
  const error = typeof meta.error === 'string' ? meta.error : undefined;

  return (
    <div className={tailwind('flex flex-col gap-1.5', className)}>
      <Typography variant={TypographyVariant.BODY}>
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
        {optional && <span className="ml-1 text-ink-400">{t(TEXT.GENERAL.OPTIONAL)}</span>}
      </Typography>

      <PillSelect
        values={field.value}
        options={options}
        onValuesChange={(values) => void helpers.setValue(values)}
        ariaLabel={label}
        variant={PillSelectVariant.FIELD}
        placeholder={placeholder}
        isSheetOnMobile={isSheetOnMobile}
      />

      {meta.touched && error && (
        <Typography variant={TypographyVariant.ERROR}>{t(error)}</Typography>
      )}
    </div>
  );
};
