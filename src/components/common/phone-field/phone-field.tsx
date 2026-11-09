import React, { useState } from "react";
import { useField } from "formik";
import { useTranslation } from "react-i18next";
import { FormField } from "@/components/common/input/input";
import { PhoneCountrySelect } from "@/components/common/phone-field/phone-country-select";
import { TEXT } from "@/static/texts/i18n";
import {
  composePhoneValue,
  detectPhoneCountry,
  formatPhoneInput,
  switchPhoneCountry,
  toNationalInput,
} from "@/shared/utils/phone";
import type { PhoneCountry } from "@/shared/utils/phone-countries";

interface PhoneFieldProps {
  name: string;
  label: string;
  required?: boolean;
  disabled?: boolean;
  /** Reemplaza la ayuda por defecto (cómo elegir otro país); '' la oculta. */
  hint?: string;
  /** Deja la ayuda a la vista aunque haya error. */
  isHintAlwaysVisible?: boolean;
  className?: string;
}

/**
 * Teléfono de Formik con selector de país (Costa Rica por defecto). El valor guardado en el
 * formulario es el mismo de siempre: `XXXX-XXXX` para Costa Rica y `+<código> <dígitos>` para
 * otro país. Un dato viejo que no se reconoce se muestra tal cual, sin máscara.
 */
export const PhoneField: React.FC<PhoneFieldProps> = ({
  name,
  label,
  required = false,
  disabled = false,
  hint,
  isHintAlwaysVisible,
  className,
}) => {
  const { t } = useTranslation();
  const [{ value }, , { setValue }] = useField<string>(name);
  // Recuerda el país elegido mientras el campo está vacío o el código es compartido (+1).
  const [chosenCountry, setChosenCountry] = useState<PhoneCountry>();
  const country = detectPhoneCountry(value, chosenCountry);

  const handleSelectCountry = (next: PhoneCountry) => {
    setChosenCountry(next);
    const national = country ? toNationalInput(value, country) : "";
    void setValue(switchPhoneCountry(next, national));
  };

  return (
    <FormField
      name={name}
      label={label}
      hint={hint ?? t(TEXT.GENERAL.PHONE_HINT)}
      isHintAlwaysVisible={isHintAlwaysVisible}
      inputMode="tel"
      required={required}
      disabled={disabled}
      startControl={
        <PhoneCountrySelect
          country={country}
          onSelect={handleSelectCountry}
          disabled={disabled}
        />
      }
      displayValue={country ? toNationalInput(value, country) : value}
      onChange={(event) =>
        void setValue(
          country
            ? composePhoneValue(country, event.target.value)
            : formatPhoneInput(event.target.value),
        )
      }
      className={className}
    />
  );
};
