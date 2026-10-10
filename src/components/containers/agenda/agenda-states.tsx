import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle } from 'lucide-react';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';

/** Filas de relleno mientras cargan las citas. */
const LOADING_ROWS = 3;

export const AgendaLoading: React.FC = () => (
  <div className="flex flex-col gap-2" aria-hidden>
    {Array.from({ length: LOADING_ROWS }, (_, index) => (
      <div key={index} className="h-14 animate-pulse rounded-lg bg-ink-100" />
    ))}
  </div>
);

export const AgendaError: React.FC<{ onRetry: () => void }> = ({ onRetry }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <AlertCircle className="h-6 w-6 text-danger" aria-hidden />
      <Typography variant={TypographyVariant.BODY_SEMIBOLD}>
        {t(TEXT.AGENDA.STATES.ERROR_TITLE)}
      </Typography>
      <Button variant={ButtonVariant.SECONDARY} onClick={onRetry}>
        {t(TEXT.AGENDA.STATES.RETRY)}
      </Button>
    </div>
  );
};

export const AgendaEmpty: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      <Typography variant={TypographyVariant.BODY_SEMIBOLD}>
        {t(TEXT.AGENDA.STATES.EMPTY_TITLE)}
      </Typography>
      <Typography variant={TypographyVariant.HELPER} className="max-w-xs">
        {t(TEXT.AGENDA.STATES.EMPTY_DESCRIPTION)}
      </Typography>
    </div>
  );
};
