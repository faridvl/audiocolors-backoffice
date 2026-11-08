import React from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox } from '@/components/common/checkbox/checkbox';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { tailwind } from '@/utils/tailwind-utils';

interface SummaryOptionCardProps {
  title: string;
  isChecked: boolean;
  /** Sin datos que incluir: la tarjeta queda apagada con "Sin registros". */
  isAvailable: boolean;
  isLoading: boolean;
  onChange: (isChecked: boolean) => void;
  /** Contenido extra que se muestra cuando la tarjeta está marcada. */
  children?: React.ReactNode;
}

/** Tarjeta seleccionable del modal del resumen. */
export const SummaryOptionCard: React.FC<SummaryOptionCardProps> = ({
  title,
  isChecked,
  isAvailable,
  isLoading,
  onChange,
  children,
}) => {
  const { t } = useTranslation();
  const isDisabled = !isAvailable && !isLoading;

  return (
    <div
      className={tailwind(
        'rounded-lg border p-3 transition-colors',
        isChecked ? 'border-brand bg-brand/5' : 'border-ink-200 bg-white',
        isDisabled && 'bg-ink-50 opacity-70',
      )}
    >
      <div className="flex items-center justify-between gap-3">
        {isDisabled ? (
          <Typography variant={TypographyVariant.BODY} as="span">
            {title}
          </Typography>
        ) : (
          <Checkbox
            label={title}
            isChecked={isChecked}
            isLoading={isLoading}
            onChange={onChange}
            className="min-h-[32px]"
          />
        )}
        {isDisabled && (
          <Typography variant={TypographyVariant.HELPER} as="span">
            {t(TEXT.PATIENTS.CLINICAL_SUMMARY.NO_RECORDS)}
          </Typography>
        )}
      </div>
      {isChecked && children}
    </div>
  );
};
