import React from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/common/layout/app-layout';
import { RequirePermission } from '@/components/common/permission/require-permission';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { useIsDesktop } from '@/hooks/use-is-desktop';
import { routesPrivate } from '@/shared/navigation/routes';
import { TEXT } from '@/static/texts/i18n';
import { SettingsNav } from './settings-nav';
import {
  sectionDescriptionKey,
  sectionTitleKey,
  SETTINGS_SECTIONS,
  SettingsSection,
} from './settings-sections';
import { useSettingsNavigation } from './use-settings-navigation';

interface SettingsLayoutProps {
  section: SettingsSection;
  children: React.ReactNode;
}

/**
 * Una sección de Configuración: en computadora con la lista de secciones a la
 * izquierda; en el celular sola, con "atrás" a la lista.
 */
export const SettingsLayout: React.FC<SettingsLayoutProps> = ({ section, children }) => {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  const { sections } = useSettingsNavigation();
  const permission = SETTINGS_SECTIONS.find((item) => item.section === section)?.permission;

  return (
    <AppLayout
      title={t(sectionTitleKey(section))}
      subtitle={t(TEXT.SETTINGS.TITLE)}
      backHref={isDesktop ? undefined : routesPrivate.settings.index}
    >
      <div className="lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:items-start lg:gap-6">
        <aside className="hidden lg:sticky lg:top-0 lg:block">
          <SettingsNav sections={sections} activeSection={section} />
        </aside>
        {/* Todas las secciones arrancan igual (misma línea, mismo ancho): cambiar de una a otra no salta. */}
        <div className="flex w-full min-w-0 max-w-3xl flex-col gap-4">
          <Typography variant={TypographyVariant.BODY} className="text-ink-600">
            {t(sectionDescriptionKey(section))}
          </Typography>
          {permission ? (
            <RequirePermission permission={permission}>{children}</RequirePermission>
          ) : (
            children
          )}
        </div>
      </div>
    </AppLayout>
  );
};
