import React from 'react';
import { type LucideIcon } from 'lucide-react';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { SheetDialog } from './sheet-dialog';

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
 * Ficha de una cita o de un paciente por confirmar: datos y acciones a la
 * vista y con su nombre, en vez de un menú de tres puntos.
 */
export const ActionSheet: React.FC<ActionSheetProps> = ({
  title,
  status,
  details,
  primaryAction,
  isPrimaryLoading = false,
  actions,
  onClose,
}) => (
  <SheetDialog title={title} status={status} onClose={onClose}>
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
  </SheetDialog>
);
