import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { formatDate } from '@/shared/utils/formatters';
import { Release } from '@/static/releases';
import { TEXT } from '@/static/texts/i18n';

interface ReleaseDetailProps {
  release: Release;
  icon: string;
}

/** Una versión abierta: encabezado de color y cada cambio con su emoji. */
export const ReleaseDetail: React.FC<ReleaseDetailProps> = ({ release, icon }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col">
      <div className="flex flex-col items-center gap-1 bg-brand-50 px-6 py-6 text-center">
        <span className="text-4xl" aria-hidden>
          {icon}
        </span>
        <Typography variant={TypographyVariant.SUBTITLE} className="text-brand-800">
          {t(TEXT.NOTIFICATIONS.RELEASE_TITLE, { version: release.version })}
        </Typography>
        <Typography variant={TypographyVariant.HELPER} className="text-brand-700">
          {t(TEXT.NOTIFICATIONS.RELEASE_INTRO, { date: formatDate(release.publishedAt) })}
        </Typography>
      </div>

      <ul className="flex flex-col gap-4 px-5 py-5">
        {release.items.map((item) => (
          <li key={item.titleKey} className="flex gap-3">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink-50 text-lg"
              aria-hidden
            >
              {item.icon}
            </span>
            <span className="flex min-w-0 flex-col">
              <Typography variant={TypographyVariant.BODY_SEMIBOLD} inline>
                {t(item.titleKey)}
              </Typography>
              <Typography variant={TypographyVariant.HELPER} inline>
                {t(item.descriptionKey)}
              </Typography>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
