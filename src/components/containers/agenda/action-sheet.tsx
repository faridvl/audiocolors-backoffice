import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, type LucideIcon } from 'lucide-react';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';

export interface SheetAction {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
}

interface ActionSheetProps {
  title: string;
  /** Estado en palabras ("Por llegar", "Por confirmar"), bajo el título. */
  status: string;
  details: { label: string; value: string }[];
  /** Lo que más se hace con este registro: botón grande arriba. */
  primaryAction?: SheetAction;
  isPrimaryLoading?: boolean;
  actions: SheetAction[];
  onClose: () => void;
}

/**
 * Ficha de una cita o de un paciente por confirmar. En móvil sube desde abajo
 * (al alcance del pulgar); en escritorio es un diálogo centrado. Reemplaza al
 * menú de tres puntos: las acciones quedan a la vista y con su nombre.
 */
export const ActionSheet: React.FC<ActionSheetProps> = ({
  title,
  status,
  details,
  primaryAction,
  isPrimaryLoading = false,
  actions,
  onClose,
}) => {
  const { t } = useTranslation();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/60 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md animate-fade-in rounded-t-card bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:rounded-card sm:pb-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Typography variant={TypographyVariant.SUBTITLE} as="h2" className="break-words">
              {title}
            </Typography>
            <Typography variant={TypographyVariant.HELPER}>{status}</Typography>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t(TEXT.AGENDA.SHEET.CLOSE)}
            className="-mr-2 -mt-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <dl className="mt-4 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 rounded-lg bg-ink-50 px-3 py-2.5">
          {details.map((detail) => (
            <React.Fragment key={detail.label}>
              <dt>
                <Typography variant={TypographyVariant.HELPER}>{detail.label}</Typography>
              </dt>
              <dd className="min-w-0">
                <Typography variant={TypographyVariant.BODY} className="break-words">
                  {detail.value}
                </Typography>
              </dd>
            </React.Fragment>
          ))}
        </dl>

        {primaryAction && (
          <Button
            onClick={primaryAction.onClick}
            isLoading={isPrimaryLoading}
            icon={<primaryAction.icon className="h-4 w-4" aria-hidden />}
            className="mt-4 w-full"
          >
            {primaryAction.label}
          </Button>
        )}

        <div className="mt-2 flex flex-col">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant={ButtonVariant.GHOST}
              onClick={action.onClick}
              icon={<action.icon className="h-4 w-4 text-ink-500" aria-hidden />}
              className="w-full justify-start font-medium"
            >
              {action.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
