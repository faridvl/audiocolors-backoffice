import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { tailwind } from '@/utils/tailwind-utils';
import {
  sectionDescriptionKey,
  sectionTitleKey,
  SettingsSection,
  SettingsSectionItem,
} from './settings-sections';

interface SettingsNavProps {
  sections: SettingsSectionItem[];
  activeSection?: SettingsSection;
  /** En el celular la lista es la pantalla de inicio: cada sección con su descripción. */
  isList?: boolean;
}

export const SettingsNav: React.FC<SettingsNavProps> = ({ sections, activeSection, isList }) => {
  const { t } = useTranslation();

  return (
    <nav className={tailwind('flex flex-col', isList ? 'gap-2' : 'gap-1')}>
      {sections.map(({ section, href, icon: Icon }) => {
        const isActive = section === activeSection;
        return (
          <Link
            key={section}
            href={href}
            aria-current={isActive ? 'page' : undefined}
            className={tailwind(
              'flex items-center gap-3 rounded-lg px-3 transition-colors',
              isList
                ? 'min-h-[64px] border border-ink-200 bg-white py-3 hover:bg-ink-50'
                : 'min-h-[44px] py-2',
              !isList &&
                (isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-100'),
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            <span className="flex min-w-0 flex-1 flex-col">
              <Typography variant={TypographyVariant.BODY_SEMIBOLD} inline className="text-inherit">
                {t(sectionTitleKey(section))}
              </Typography>
              {isList && (
                <Typography variant={TypographyVariant.HELPER} inline>
                  {t(sectionDescriptionKey(section))}
                </Typography>
              )}
            </span>
            {isList && <ChevronRight className="h-4 w-4 shrink-0 text-ink-400" aria-hidden />}
          </Link>
        );
      })}
    </nav>
  );
};
