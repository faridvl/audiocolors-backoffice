import React, { useState } from "react";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TEXT } from "@/static/texts/i18n";
import { tailwind } from "@/utils/tailwind-utils";
import {
  searchCountries,
  type PhoneCountry,
} from "@/shared/utils/phone-countries";
import {
  Typography,
  TypographyVariant,
} from "@/components/common/typography/typography";

interface PhoneCountrySelectProps {
  /** `null`: número que no se reconoce (dato viejo), sin país. */
  country: PhoneCountry | null;
  onSelect: (country: PhoneCountry) => void;
}

/**
 * Selector de país del teléfono: bandera y código en el campo; la lista se abre con buscador
 * (nombre, ISO o código). Esc cierra solo la lista, no la ventana que la contiene.
 */
export const PhoneCountrySelect: React.FC<PhoneCountrySelectProps> = ({
  country,
  onSelect,
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const countries = searchCountries(query);

  return (
    <Popover className="flex">
      {({ close }) => (
        <>
          <PopoverButton
            aria-label={t(TEXT.GENERAL.PHONE_COUNTRY.LABEL)}
            className="flex min-w-[6.5rem] items-center gap-1.5 rounded-l-lg border-r border-ink-200 pl-3 pr-2 text-base font-medium text-ink-600 focus:outline-none data-[focus]:outline data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-brand"
          >
            {country ? (
              <>
                <span aria-hidden>{country.flag}</span>
                <span>+{country.dialCode}</span>
              </>
            ) : (
              <Globe className="h-4 w-4" aria-hidden />
            )}
            <ChevronDown
              className="ml-auto h-4 w-4 shrink-0 text-ink-400"
              aria-hidden
            />
          </PopoverButton>

          <PopoverPanel
            focus
            anchor={{ to: "bottom start", gap: 8 }}
            onKeyDown={(event: React.KeyboardEvent) => {
              if (event.key !== "Escape") return;
              event.stopPropagation();
              close();
            }}
            className="z-50 w-80 max-w-[calc(100vw-2rem)] rounded-card border border-ink-200 bg-white p-2 shadow-lg focus:outline-none"
          >
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t(TEXT.GENERAL.PHONE_COUNTRY.SEARCH)}
              aria-label={t(TEXT.GENERAL.PHONE_COUNTRY.SEARCH)}
              className="mb-2 w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-base text-ink-800 placeholder:text-ink-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
            {countries.length === 0 ? (
              <Typography
                variant={TypographyVariant.HELPER}
                className="px-2 py-3 text-center"
              >
                {t(TEXT.GENERAL.PHONE_COUNTRY.EMPTY)}
              </Typography>
            ) : (
              <ul className="max-h-60 overflow-y-auto">
                {countries.map((option) => (
                  <li key={option.iso}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(option);
                        setQuery("");
                        close();
                      }}
                      className={tailwind(
                        "flex min-h-[44px] w-full items-center gap-3 rounded-lg px-2 text-left text-base text-ink-800 hover:bg-ink-50 focus:bg-ink-50 focus:outline-none",
                        option.iso === country?.iso &&
                          "bg-ink-50 font-semibold",
                      )}
                    >
                      <span aria-hidden>{option.flag}</span>
                      <span className="min-w-0 flex-1 truncate">
                        {option.name}
                      </span>
                      <span className="shrink-0 text-ink-500">
                        +{option.dialCode}
                      </span>
                      {option.iso === country?.iso && (
                        <Check
                          className="h-4 w-4 shrink-0 text-brand"
                          aria-hidden
                        />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </PopoverPanel>
        </>
      )}
    </Popover>
  );
};
