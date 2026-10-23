import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { formatDate } from '@/shared/utils/formatters';
import { Release, ReleaseChangeKind } from '@/static/releases';
import { TEXT } from '@/static/texts/i18n';

/** Una versión abierta: grupos Novedades, Mejoras y Correcciones, con "Tema: descripción". */
export const ReleaseDetail: React.FC<{ release: Release }> = ({ release }) => {
  const { t } = useTranslation();
  const groups = Object.values(ReleaseChangeKind)
    .map((kind) => ({ kind, changes: release.changes.filter((item) => item.kind === kind) }))
    .filter((group) => group.changes.length > 0);

  return (
    <div className="flex flex-col gap-5 px-5 py-5">
      <div className="flex flex-col gap-0.5">
        <Typography variant={TypographyVariant.SUBTITLE}>
          {t(TEXT.NOTIFICATIONS.RELEASE_TITLE, { version: release.version })}
        </Typography>
        <Typography variant={TypographyVariant.HELPER}>
          {formatDate(release.publishedAt)}
        </Typography>
      </div>

      {groups.map((group) => (
        <section key={group.kind} className="flex flex-col gap-2">
          <Typography
            variant={TypographyVariant.HELPER}
            className="font-semibold uppercase tracking-wide text-ink-500"
          >
            {t(`${TEXT.NOTIFICATIONS.KIND_PREFIX}.${group.kind}`)}
          </Typography>
          <ul className="flex flex-col gap-2">
            {group.changes.map((item) => (
              <li key={item.titleKey} className="flex gap-2.5">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
                <Typography variant={TypographyVariant.BODY} className="text-ink-700">
                  <span className="font-semibold text-ink-900">{t(item.titleKey)}:</span>{' '}
                  {t(item.descriptionKey)}
                </Typography>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
};
