import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { tailwind } from '@/utils/tailwind-utils';

interface BackgroundAnswerRowProps {
  label: string;
  /** Null cuando la pregunta no se respondió. */
  answer: boolean | null;
  /** Detalle debajo de la fila cuando la respuesta es Sí (la tonalidad del acúfeno). */
  detail?: string | null;
}

/** Un antecedente ya respondido: el Sí resalta, el No y el sin responder quedan apagados. */
export const BackgroundAnswerRow: React.FC<BackgroundAnswerRowProps> = ({
  label,
  answer,
  detail,
}) => {
  const { t } = useTranslation();
  const isYes = answer === true;

  return (
    <div className="border-b border-ink-100 py-2 last:border-b-0">
      <div className="flex items-center justify-between gap-3">
        <Typography
          variant={isYes ? TypographyVariant.BODY_SEMIBOLD : TypographyVariant.BODY}
          className={tailwind(
            answer === false && 'text-ink-700',
            answer === null && 'text-ink-600',
          )}
        >
          {label}
        </Typography>
        {isYes ? (
          <Typography
            as="span"
            variant={TypographyVariant.BODY_SEMIBOLD}
            className="flex shrink-0 items-center gap-1 text-brand-700"
          >
            <Check className="h-4 w-4" aria-hidden />
            {t(TEXT.GENERAL.YES)}
          </Typography>
        ) : (
          <Typography
            as="span"
            variant={TypographyVariant.BODY}
            className={tailwind(
              'shrink-0',
              answer === null ? 'italic text-ink-500' : 'text-ink-700',
            )}
          >
            {t(answer === null ? TEXT.GENERAL.UNANSWERED : TEXT.GENERAL.NO)}
          </Typography>
        )}
      </div>
      {isYes && detail && (
        <Typography variant={TypographyVariant.HELPER} className="mt-0.5 text-ink-600">
          {detail}
        </Typography>
      )}
    </div>
  );
};
