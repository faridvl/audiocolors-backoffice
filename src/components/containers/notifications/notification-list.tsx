import React from 'react';
import { BellOff, ChevronRight, Rocket } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { formatDate } from '@/shared/utils/formatters';
import { ReleaseChangeKind } from '@/static/releases';
import { TEXT } from '@/static/texts/i18n';
import { tailwind } from '@/utils/tailwind-utils';
import { AppNotification } from './use-notifications';

interface NotificationListProps {
  notifications: AppNotification[];
  isUnread: (id: string) => boolean;
  onSelect: (id: string) => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  isUnread,
  onSelect,
}) => {
  const { t } = useTranslation();

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
        <BellOff className="h-7 w-7 text-ink-300" aria-hidden />
        <Typography variant={TypographyVariant.BODY_SEMIBOLD}>
          {t(TEXT.NOTIFICATIONS.EMPTY_TITLE)}
        </Typography>
        <Typography variant={TypographyVariant.HELPER}>
          {t(TEXT.NOTIFICATIONS.EMPTY_DESCRIPTION)}
        </Typography>
      </div>
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-ink-100">
      {notifications.map(({ id, release }) => {
        // "3 novedades · 5 mejoras · 1 corrección": cuenta por grupo, sin repetir el detalle.
        const summary = Object.values(ReleaseChangeKind)
          .map((kind) => ({
            kind,
            count: release.changes.filter((item) => item.kind === kind).length,
          }))
          .filter(({ count }) => count > 0)
          .map(({ kind, count }) => t(`${TEXT.NOTIFICATIONS.COUNT_PREFIX}.${kind}`, { count }))
          .join(' · ');
        const isNew = isUnread(id);

        return (
          <li key={id}>
            <button
              type="button"
              onClick={() => onSelect(id)}
              className={tailwind(
                'flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-ink-50',
                isNew && 'bg-brand-50/50',
              )}
            >
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                <Rocket className="h-4 w-4" aria-hidden />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="flex items-center gap-2">
                  <Typography variant={TypographyVariant.BODY_SEMIBOLD} inline className="truncate">
                    {t(TEXT.NOTIFICATIONS.RELEASE_TITLE, { version: release.version })}
                  </Typography>
                  {isNew && (
                    <span
                      className="h-2 w-2 shrink-0 rounded-full bg-brand"
                      aria-label={t(TEXT.NOTIFICATIONS.UNREAD)}
                    />
                  )}
                </span>
                <Typography variant={TypographyVariant.HELPER} inline>
                  {summary}
                </Typography>
                <Typography variant={TypographyVariant.HELPER} inline className="text-ink-400">
                  {formatDate(release.publishedAt)}
                </Typography>
              </span>
              <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-ink-400" aria-hidden />
            </button>
          </li>
        );
      })}
    </ul>
  );
};
