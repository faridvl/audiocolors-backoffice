import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { formatDate } from '@/shared/utils/formatters';
import { TEXT } from '@/static/texts/i18n';
import { tailwind } from '@/utils/tailwind-utils';
import { AppNotification } from './use-notifications';

/** Cuántos cambios se nombran en el resumen antes de "y N más". */
const SUMMARY_NAMED_ITEMS = 2;

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
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-16 text-center">
        <span className="text-4xl" aria-hidden>
          ✨
        </span>
        <Typography variant={TypographyVariant.ACCENT}>
          {t(TEXT.NOTIFICATIONS.EMPTY_TITLE)}
        </Typography>
        <Typography variant={TypographyVariant.BODY} className="text-ink-500">
          {t(TEXT.NOTIFICATIONS.EMPTY_DESCRIPTION)}
        </Typography>
      </div>
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-ink-100">
      {notifications.map((notification) => {
        const { release } = notification;
        const titles = release.items.map((item) => t(item.titleKey));
        const remaining = titles.length - SUMMARY_NAMED_ITEMS;
        const summary =
          remaining > 0
            ? t(TEXT.NOTIFICATIONS.RELEASE_SUMMARY, {
                names: titles.slice(0, SUMMARY_NAMED_ITEMS).join(', '),
                count: remaining,
              })
            : titles.join(', ');
        const isNew = isUnread(notification.id);

        return (
          <li key={notification.id}>
            <button
              type="button"
              onClick={() => onSelect(notification.id)}
              className={tailwind(
                'flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-ink-50',
                isNew && 'bg-brand-50/60',
              )}
            >
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xl"
                aria-hidden
              >
                {notification.icon}
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
                <Typography variant={TypographyVariant.HELPER} inline className="line-clamp-2">
                  {summary}
                </Typography>
                <Typography variant={TypographyVariant.HELPER} inline className="text-ink-400">
                  {formatDate(notification.publishedAt)}
                </Typography>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-ink-400" aria-hidden />
            </button>
          </li>
        );
      })}
    </ul>
  );
};
