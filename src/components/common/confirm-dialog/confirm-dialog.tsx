import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { useBackdropClose } from '@/hooks/use-backdrop-close';
import { useEscapeKey } from '@/hooks/use-escape-key';
import { tailwind } from '@/utils/tailwind-utils';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  /** Por defecto la acción es destructiva (botón y aviso en rojo); en falso, el botón es el principal. */
  isDanger?: boolean;
  /** Deshabilita los botones y muestra carga mientras se ejecuta la acción. */
  isConfirming?: boolean;
  /** Si la acción falló, se muestra aquí y el diálogo sigue abierto. */
  errorMessage?: string | null;
}

/** Confirma una acción que pierde lo escrito; en el celular sube desde abajo como las demás ventanas. */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  isDanger = true,
  isConfirming = false,
  errorMessage = null,
}) => {
  useEscapeKey(onCancel);
  const backdropProps = useBackdropClose(onCancel);

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/70 sm:items-center sm:p-4"
      {...backdropProps}
    >
      <div
        className="w-full max-w-sm rounded-t-card bg-white p-5 sm:rounded-card"
        style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <span
            className={tailwind(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
              isDanger ? 'bg-danger/10' : 'bg-brand/10',
            )}
          >
            <AlertTriangle
              className={tailwind('h-5 w-5', isDanger ? 'text-danger' : 'text-brand-700')}
              aria-hidden
            />
          </span>
          <div className="min-w-0">
            <Typography variant={TypographyVariant.ACCENT}>{title}</Typography>
            <Typography variant={TypographyVariant.BODY} className="mt-1">
              {message}
            </Typography>
            {errorMessage && (
              <Typography variant={TypographyVariant.ERROR} className="mt-2" as="p">
                {errorMessage}
              </Typography>
            )}
          </div>
        </div>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant={ButtonVariant.SECONDARY} onClick={onCancel} disabled={isConfirming}>
            {cancelLabel}
          </Button>
          <Button
            variant={isDanger ? ButtonVariant.DANGER : ButtonVariant.PRIMARY}
            onClick={onConfirm}
            isLoading={isConfirming}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
