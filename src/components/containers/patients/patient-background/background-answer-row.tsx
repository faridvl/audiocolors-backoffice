import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { tailwind } from '@/utils/tailwind-utils';

interface BackgroundAnswerRowProps {
  label: string;
  isChecked: boolean;
  /** Detalle debajo de la fila cuando la respuesta es Sí (la tonalidad del acúfeno). */
  detail?: string | null;
}

/** Un antecedente ya respondido: el Sí resalta, el No queda apagado, como en la hoja. */
export const BackgroundAnswerRow: React.FC<BackgroundAnswerRowProps> = ({
  label,
  isChecked,
  detail,
}) => {
  const { t } = useTranslation();

  return (
    <div className="border-b border-ink-100 py-1.5 last:border-b-0">
      <div className="flex items-center justify-between gap-3">
        <Typography
          variant={isChecked ? TypographyVariant.BODY_SEMIBOLD : TypographyVariant.BODY}
          className={tailwind(!isChecked && 'text-ink-400')}
        >
          {label}
        </Typography>
        {isChecked ? (
          <Typography
            as="span"
            variant={TypographyVariant.BODY_SEMIBOLD}
            className="flex shrink-0 items-center gap-1 text-brand-700"
          >
            <Check className="h-4 w-4" aria-hidden />
            {t(TEXT.GENERAL.YES)}
          </Typography>
        ) : (
          <Typography as="span" variant={TypographyVariant.BODY} className="shrink-0 text-ink-400">
            {t(TEXT.GENERAL.NO)}
          </Typography>
        )}
      </div>
      {isChecked && detail && (
        <Typography variant={TypographyVariant.HELPER} className="mt-0.5 text-ink-600">
          {detail}
        </Typography>
      )}
    </div>
  );
};
