import React, { useCallback, useState } from 'react';
import { ConfirmDialog } from '@/components/common/confirm-dialog/confirm-dialog';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { useBackdropClose } from '@/hooks/use-backdrop-close';
import { useEscapeKey } from '@/hooks/use-escape-key';
import { TEXT } from '@/static/texts/i18n';
import { useTranslation } from 'react-i18next';

interface UserModalShellProps {
  title: string;
  icon: React.ReactNode;
  /** Hay cambios sin guardar: Esc o el fondo piden confirmar antes de cerrar. */
  isDirty: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/** Ventana de los formularios de usuarios; en el celular sube desde abajo, como las demás. */
export const UserModalShell: React.FC<UserModalShellProps> = ({
  title,
  icon,
  isDirty,
  onClose,
  children,
}) => {
  const { t } = useTranslation();
  const [isConfirmingDiscard, setIsConfirmingDiscard] = useState(false);

  const requestClose = useCallback(() => {
    if (isDirty) {
      setIsConfirmingDiscard(true);
      return;
    }
    onClose();
  }, [isDirty, onClose]);

  useEscapeKey(requestClose, !isConfirmingDiscard);
  const backdropProps = useBackdropClose(requestClose);

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/70 sm:items-center sm:p-4"
        {...backdropProps}
      >
        <div
          className="flex max-h-[92dvh] w-full max-w-md flex-col rounded-t-card bg-white p-5 sm:rounded-card sm:p-6"
          style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex shrink-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10">
              {icon}
            </span>
            <Typography variant={TypographyVariant.ACCENT}>{title}</Typography>
          </div>
          {children}
        </div>
      </div>
      {isConfirmingDiscard && (
        <ConfirmDialog
          title={t(TEXT.GENERAL.DISCARD.TITLE)}
          message={t(TEXT.GENERAL.DISCARD.MESSAGE)}
          confirmLabel={t(TEXT.GENERAL.DISCARD.CONFIRM)}
          cancelLabel={t(TEXT.GENERAL.DISCARD.KEEP_EDITING)}
          onConfirm={onClose}
          onCancel={() => setIsConfirmingDiscard(false)}
        />
      )}
    </>
  );
};
