import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';

interface SettingsSectionLoadingProps {
  message: string;
}

interface SettingsSectionErrorProps {
  message: string;
  onRetry: () => void;
}

export const SettingsSectionLoading: React.FC<SettingsSectionLoadingProps> = ({ message }) => (
  <div className="flex items-center justify-center gap-2 py-12">
    <Loader2 className="h-5 w-5 animate-spin text-brand" aria-hidden />
    <Typography variant={TypographyVariant.BODY}>{message}</Typography>
  </div>
);

export const SettingsSectionError: React.FC<SettingsSectionErrorProps> = ({ message, onRetry }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center">
      <AlertTriangle className="h-8 w-8 text-danger" aria-hidden />
      <Typography variant={TypographyVariant.ACCENT}>{message}</Typography>
      <Button variant={ButtonVariant.SECONDARY} onClick={onRetry} className="mt-2">
        {t(TEXT.GENERAL.BUTTONS.RETRY)}
      </Button>
    </div>
  );
};
