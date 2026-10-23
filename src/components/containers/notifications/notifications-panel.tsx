import React from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { useEscapeKey } from '@/hooks/use-escape-key';
import { TEXT } from '@/static/texts/i18n';
import { NotificationList } from './notification-list';
import { ReleaseDetail } from './release-detail';
import { AppNotification } from './use-notifications';

interface NotificationsPanelProps {
  notifications: AppNotification[];
  selected: AppNotification | null;
  isUnread: (id: string) => boolean;
  onSelect: (id: string) => void;
  onBack: () => void;
  onClear: () => void;
  onClose: () => void;
}

const ICON_BUTTON =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-800';

/**
 * La bandeja: en el celular ocupa toda la pantalla; en computadora es una
 * ventana centrada. La lista y el detalle de una notificación viven adentro.
 */
export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  notifications,
  selected,
  isUnread,
  onSelect,
  onBack,
  onClear,
  onClose,
}) => {
  const { t } = useTranslation();
  useEscapeKey(selected ? onBack : onClose);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t(TEXT.NOTIFICATIONS.TITLE)}
      className="fixed inset-0 z-50 flex justify-center bg-ink-900/60 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex h-[100dvh] w-full flex-col bg-white sm:h-auto sm:max-h-[min(44rem,85vh)] sm:max-w-lg sm:rounded-card sm:shadow-lg"
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex min-h-[60px] items-center gap-2 border-b border-ink-100 px-3">
          {selected ? (
            <button
              type="button"
              onClick={onBack}
              aria-label={t(TEXT.NOTIFICATIONS.BACK)}
              className={ICON_BUTTON}
            >
              <ArrowLeft className="h-5 w-5" aria-hidden />
            </button>
          ) : (
            <span className="w-2" aria-hidden />
          )}
          <Typography variant={TypographyVariant.ACCENT} className="flex-1 truncate">
            {t(TEXT.NOTIFICATIONS.TITLE)}
          </Typography>
          {!selected && notifications.length > 0 && (
            <Button type="button" variant={ButtonVariant.GHOST} onClick={onClear} className="px-3">
              {t(TEXT.NOTIFICATIONS.CLEAR)}
            </Button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label={t(TEXT.NOTIFICATIONS.CLOSE)}
            className={ICON_BUTTON}
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto overscroll-contain">
          {selected ? (
            <ReleaseDetail release={selected.release} icon={selected.icon} />
          ) : (
            <NotificationList
              notifications={notifications}
              isUnread={isUnread}
              onSelect={onSelect}
            />
          )}
        </div>
      </div>
    </div>
  );
};
