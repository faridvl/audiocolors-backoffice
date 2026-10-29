import React from 'react';
import { useField } from 'formik';
import { useTranslation } from 'react-i18next';
import { FormField } from '@/components/common/input/input';
import { TEXT } from '@/static/texts/i18n';
import { formatPhoneInput, shouldShowCountryPrefix } from '@/shared/utils/phone';

/** Código que el sistema asume cuando el número no empieza con `+`. */
const DEFAULT_COUNTRY_LABEL = '+506';

interface PhoneFieldProps {
  name: string;
  label: string;
  required?: boolean;
  /** Reemplaza la ayuda por defecto (cómo escribir un número de otro país); '' la oculta. */
  hint?: string;
  className?: string;
}

/**
 * Teléfono de Formik: XXXX-XXXX para Costa Rica, con "+506" a la vista como adorno; con `+`
 * al inicio (o un número largo sin `+`, dato viejo), sin máscara y sin adorno.
 */
export const PhoneField: React.FC<PhoneFieldProps> = ({
  name,
  label,
  required = false,
  hint,
  className,
}) => {
  const { t } = useTranslation();
  const [{ value }, , { setValue }] = useField<string>(name);

  return (
    <FormField
      name={name}
      label={label}
      hint={hint ?? t(TEXT.GENERAL.PHONE_HINT)}
      inputMode="tel"
      required={required}
      startAdornment={shouldShowCountryPrefix(value) ? DEFAULT_COUNTRY_LABEL : undefined}
      onChange={(event) => void setValue(formatPhoneInput(event.target.value))}
      className={className}
    />
  );
};
