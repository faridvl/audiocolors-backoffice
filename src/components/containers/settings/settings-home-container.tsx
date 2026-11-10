import React from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ButtonVariant, buttonClasses } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { routesPrivate } from '@/shared/navigation/routes';
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
      <div className="mx-auto flex max-w-md flex-col items-center gap-2 py-12 text-center">
        <Typography variant={TypographyVariant.BODY}>{t(TEXT.GENERAL.FORBIDDEN)}</Typography>
        <Link
          href={routesPrivate.patients.index}
          className={buttonClasses(ButtonVariant.SECONDARY, 'mt-2')}
        >
          {t(TEXT.GENERAL.BACK_HOME)}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <SettingsNav sections={sections} isList />
    </div>
  );
};
