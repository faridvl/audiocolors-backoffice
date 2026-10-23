import React from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { SettingsNav } from './settings-nav';
import { useSettingsHome } from './use-settings-home';

/** Inicio de Configuración: en el celular, la lista de secciones; en computadora salta a la primera. */
export const SettingsHomeContainer: React.FC = () => {
  const { t } = useTranslation();
  const { sections, isLoading } = useSettingsHome();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-brand" aria-hidden />
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <Typography variant={TypographyVariant.BODY} className="py-12 text-center">
        {t(TEXT.GENERAL.FORBIDDEN)}
      </Typography>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <SettingsNav sections={sections} isList />
    </div>
  );
};
