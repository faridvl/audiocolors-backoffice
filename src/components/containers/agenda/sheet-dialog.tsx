import React from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { useEscapeKey } from '@/hooks/use-escape-key';
import { TEXT } from '@/static/texts/i18n';

interface SheetDialogProps {
  title: string;
  /** Estado o instrucción en palabras, bajo el título. */
  status: string;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Base de las fichas de la agenda. En móvil sube desde abajo (al alcance del
 * pulgar); en escritorio es un diálogo centrado. Cierra con la X, con Esc o
 * tocando fuera.
 */
export const SheetDialog: React.FC<SheetDialogProps> = ({ title, status, onClose, children }) => {
  const { t } = useTranslation();
  useEscapeKey(onClose);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/60 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[92dvh] w-full max-w-md animate-fade-in overflow-y-auto rounded-t-card bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:rounded-card sm:pb-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Typography variant={TypographyVariant.SUBTITLE} as="h2" className="break-words">
              {title}
            </Typography>
            <Typography variant={TypographyVariant.HELPER}>{status}</Typography>
          </div>
          <Button
            variant={ButtonVariant.GHOST}
            onClick={onClose}
            aria-label={t(TEXT.AGENDA.SHEET.CLOSE)}
            icon={<X className="h-4 w-4" aria-hidden />}
            className="-mr-2 -mt-2 h-11 w-11 shrink-0 px-0"
          />
        </div>

        {children}
      </div>
    </div>
  );
};
