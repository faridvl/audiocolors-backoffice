import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
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
  /** La consulta de la tarjeta falló: dice "No se pudo cargar" y ofrece reintentar. */
  isError: boolean;
  onRetry: () => void;
  onChange: (isChecked: boolean) => void;
  /** Contenido extra que se muestra cuando la tarjeta está marcada. */
  children?: React.ReactNode;
}

const ROW_CLASSES = 'min-h-[44px] w-full px-3';

/** Tarjeta seleccionable del modal del resumen: toda la fila es área de toque. */
export const SummaryOptionCard: React.FC<SummaryOptionCardProps> = ({
  title,
  isChecked,
  isAvailable,
  isLoading,
  isError,
  onRetry,
  onChange,
  children,
}) => {
  const { t } = useTranslation();
  const isDisabled = (!isAvailable && !isLoading) || isError;

  return (
    <div
      className={tailwind(
        'rounded-lg border transition-colors',
        isChecked && !isDisabled ? 'border-brand bg-brand/5' : 'border-ink-200 bg-white',
        isDisabled && 'bg-ink-50',
      )}
    >
      {isDisabled ? (
        <div className="flex min-h-[44px] items-center justify-between gap-3 px-3 py-1">
          <Typography variant={TypographyVariant.BODY} as="span" className="opacity-70">
            {title}
          </Typography>
          {isError ? (
            <div className="flex items-center gap-2">
              <Typography variant={TypographyVariant.HELPER} as="span" className="text-danger">
                {t(TEXT.PATIENTS.CLINICAL_SUMMARY.CARD_LOAD_ERROR)}
              </Typography>
              <Button type="button" variant={ButtonVariant.SECONDARY} onClick={onRetry}>
                {t(TEXT.PATIENTS.CLINICAL_SUMMARY.RETRY)}
              </Button>
            </div>
          ) : (
            <Typography variant={TypographyVariant.HELPER} as="span">
              {t(TEXT.PATIENTS.CLINICAL_SUMMARY.NO_RECORDS)}
            </Typography>
          )}
        </div>
      ) : (
        <Checkbox
          label={title}
          isChecked={isChecked}
          isLoading={isLoading}
          onChange={onChange}
          className={ROW_CLASSES}
        />
      )}
      {isChecked && !isDisabled && children}
    </div>
  );
};
