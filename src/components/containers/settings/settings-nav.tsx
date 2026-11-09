import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { tailwind } from '@/utils/tailwind-utils';
import {
  groupSettingsSections,
  groupTitleKey,
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

const FOCUS_CLASSES =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';

export const SettingsNav: React.FC<SettingsNavProps> = ({ sections, activeSection, isList }) => {
  const { t } = useTranslation();
  const groups = groupSettingsSections(sections);

  return (
    <nav aria-label={t(TEXT.SETTINGS.NAV)} className="flex flex-col gap-6">
      {groups.map(({ group, sections: groupSections }) => {
        const titleId = `settings-group-${group}`;
        return (
          <div key={group} role="group" aria-labelledby={titleId} className="flex flex-col gap-1.5">
            <Typography
              variant={TypographyVariant.HELPER}
              id={titleId}
              className="px-3 font-semibold uppercase tracking-wide"
            >
              {t(groupTitleKey(group))}
            </Typography>
            <div className={tailwind('flex flex-col', isList ? 'gap-2' : 'gap-0.5')}>
              {groupSections.map(({ section, href, icon: Icon }) => {
                const isActive = section === activeSection;
                return (
                  <Link
                    key={section}
                    href={href}
                    aria-current={isActive ? 'page' : undefined}
                    className={tailwind(
                      'relative flex items-center gap-3 rounded-lg px-3 transition-colors',
                      FOCUS_CLASSES,
                      isList
                        ? 'min-h-[64px] border border-ink-200 bg-white py-3 active:bg-ink-50'
                        : 'min-h-[44px] py-2',
                      !isList &&
                        (isActive
                          ? 'bg-brand-50 text-brand-700'
                          : 'text-ink-600 hover:text-ink-900'),
                    )}
                  >
                    {isActive && (
                      <span
                        aria-hidden
                        className="absolute inset-y-2 left-0 w-1 rounded-full bg-brand"
                      />
                    )}
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <Typography
                        variant={TypographyVariant.BODY_SEMIBOLD}
                        inline
                        className="text-inherit"
                      >
                        {t(sectionTitleKey(section))}
                      </Typography>
                      {isList && (
                        <Typography variant={TypographyVariant.HELPER} inline>
                          {t(sectionDescriptionKey(section))}
                        </Typography>
                      )}
                    </span>
                    {isList && (
                      <ChevronRight className="h-4 w-4 shrink-0 text-ink-400" aria-hidden />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
};
