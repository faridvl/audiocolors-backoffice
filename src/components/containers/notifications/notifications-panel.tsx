import React from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-800';

/**
 * Desplegable que sale del avatar, como las notificaciones de cualquier sitio.
 * Va dentro de un contenedor `relative` junto al avatar; en el celular ocupa el
 * ancho de la pantalla con su margen.
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
    <>
      {/* Tocar fuera lo cierra, como un menú. */}
      <div className="fixed inset-0 z-40" aria-hidden onClick={onClose} />
      <div
        role="dialog"
        aria-label={t(TEXT.NOTIFICATIONS.TITLE)}
        className="absolute right-0 top-full z-50 mt-2 flex max-h-[min(36rem,calc(100dvh-6rem))] w-[min(24rem,calc(100vw-2rem))] origin-top-right flex-col overflow-hidden rounded-lg border border-ink-200 bg-white shadow-lg"
      >
        <div className="flex min-h-[52px] items-center gap-1 border-b border-ink-100 px-2">
          {selected && (
            <button
              type="button"
              onClick={onBack}
              aria-label={t(TEXT.NOTIFICATIONS.BACK)}
              className={ICON_BUTTON}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
            </button>
          )}
          <Typography variant={TypographyVariant.BODY_SEMIBOLD} className="flex-1 truncate px-2">
            {t(TEXT.NOTIFICATIONS.TITLE)}
          </Typography>
          {!selected && notifications.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="rounded-lg px-2 py-1.5 text-sm font-medium text-brand-600 hover:bg-ink-100 hover:text-brand-700"
            >
              {t(TEXT.NOTIFICATIONS.CLEAR)}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label={t(TEXT.NOTIFICATIONS.CLOSE)}
            className={ICON_BUTTON}
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {/* La clave reinicia el desplazamiento: el detalle siempre arranca desde arriba. */}
        <div key={selected?.id ?? 'list'} className="overflow-y-auto overscroll-contain">
          {selected ? (
            <ReleaseDetail release={selected.release} />
          ) : (
            <NotificationList
              notifications={notifications}
              isUnread={isUnread}
              onSelect={onSelect}
            />
          )}
        </div>
      </div>
    </>
  );
};
