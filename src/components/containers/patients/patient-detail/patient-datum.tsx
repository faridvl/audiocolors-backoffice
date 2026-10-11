import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { tailwind } from '@/utils/tailwind-utils';

interface PatientDatumProps {
  label: string;
  value?: string | null;
  className?: string;
}

/** Dato del expediente con su etiqueta encima; vacío dice "Sin registrar". */
export const PatientDatum: React.FC<PatientDatumProps> = ({ label, value, className }) => {
  const { t } = useTranslation();

  return (
    <div className={tailwind('flex min-w-0 flex-col gap-0.5', className)}>
      <Typography variant={TypographyVariant.HELPER} as="dt">
        {label}
      </Typography>
      <Typography
        variant={TypographyVariant.BODY}
        as="dd"
        className={tailwind('break-words', !value && 'text-ink-400')}
      >
        {value || t(TEXT.GENERAL.NOT_REGISTERED)}
      </Typography>
    </div>
  );
};
