import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check, ChevronRight, GripVertical, Loader2 } from 'lucide-react';
import { BranchBadge } from '@/components/common/badge/branch-badge';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { ColorDot } from '@/components/common/color-dot/color-dot';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { getBranchStripeColor, topStripeStyle } from '@/shared/design/tokens';
import { EMPTY_VALUE } from '@/shared/utils/formatters';
import { tailwind } from '@/utils/tailwind-utils';
import { TEXT } from '@/static/texts/i18n';
import { Appointment, AppointmentStatus } from '@/types/appointments/appointment';
import { AgendaSection } from './agenda-presenter';
import { ROW_DENSITY_STYLES, RowDensity, SECTION_ROW_STYLES } from './agenda-styles';

/** Arrastre nativo de una fila; si falta, la fila no se puede arrastrar. */
export interface RowDragProps {
  onDragStart: (event: React.DragEvent) => void;
  onDragEnd: () => void;
}

interface ListRowProps {
  title: string;
  subtitle: string;
  /** Punto de color: el tipo de cita. */
  accentColor?: string;
  /** Sede: franja superior de su color, como las tarjetas de pacientes. */
  branchName?: string;
  className?: string;
  isMuted?: boolean;
  trailing?: React.ReactNode;
  drag?: RowDragProps;
  density?: RowDensity;
  onClick: () => void;
}

/** Fila de lista: toda la fila es el único control (RULES §3.1). */
export const ListRow: React.FC<ListRowProps> = ({
  title,
  subtitle,
  accentColor,
  branchName,
  className,
  isMuted = false,
  trailing,
  drag,
  density = RowDensity.REGULAR,
  onClick,
}) => {
  const isCompact = density === RowDensity.COMPACT;

  return (
    <li className="min-w-0">
      <Button
        variant={ButtonVariant.CARD}
        onClick={onClick}
        draggable={Boolean(drag)}
        onDragStart={drag?.onDragStart}
        onDragEnd={drag?.onDragEnd}
        style={topStripeStyle(getBranchStripeColor(branchName))}
        className={tailwind(
          ROW_DENSITY_STYLES[density],
          className,
          drag && 'cursor-grab active:cursor-grabbing',
        )}
      >
        {/* El asa dice "esto se arrastra" sin texto; el punto del tipo sigue al lado. */}
        {drag && (
          <GripVertical
            className={tailwind(
              '-ml-1 shrink-0 text-ink-300',
              isCompact ? 'h-3.5 w-3.5' : 'h-4 w-4',
            )}
            aria-hidden
          />
        )}
        <ColorDot color={accentColor} />
        <Typography as="span" className="flex min-w-0 flex-1 flex-col">
          <Typography
            variant={TypographyVariant.BODY_SEMIBOLD}
            inline
            className={tailwind('block truncate', isMuted && 'text-ink-500')}
          >
            {title}
          </Typography>
          <Typography as="span" className="flex min-w-0 items-center gap-2">
            <Typography variant={TypographyVariant.HELPER} inline className="block truncate">
              {subtitle}
            </Typography>
            <BranchBadge name={branchName} />
          </Typography>
        </Typography>
        {trailing}
        {/* En compacto la flecha sobra: la fila ya se ve clicable y el ancho es poco. */}
        {!isCompact && <ChevronRight className="h-4 w-4 shrink-0 text-ink-400" aria-hidden />}
      </Button>
    </li>
  );
};

interface AppointmentListRowProps {
  appointment: Appointment;
  section: AgendaSection;
  scheduledByLabel: string;
  typeColor?: string;
  branchName?: string;
  drag?: RowDragProps;
  density?: RowDensity;
  onClick: () => void;
}

/** Una cita del día como fila: la misma en la lista del celular y en los horarios. */
export const AppointmentListRow: React.FC<AppointmentListRowProps> = ({
  appointment,
  section,
  scheduledByLabel,
  typeColor,
  branchName,
  drag,
  density,
  onClick,
}) => {
  const { t } = useTranslation();
  const isDone = appointment.status === AppointmentStatus.COMPLETED;

  return (
    <ListRow
      title={appointment.patientName ?? EMPTY_VALUE}
      subtitle={[appointment.typeName ?? t(TEXT.AGENDA.ROW.NO_TYPE), scheduledByLabel].join(' · ')}
      accentColor={typeColor}
      branchName={branchName}
      className={SECTION_ROW_STYLES[section]}
      isMuted={isDone}
      trailing={
        isDone ? <Check className="h-4 w-4 shrink-0 text-success" aria-hidden /> : undefined
      }
      drag={drag}
      density={density}
      onClick={onClick}
    />
  );
};

/** Lugar que ocupa una cita mientras se guarda el arrastre. */
export const SavingRow: React.FC<{ title: string }> = ({ title }) => {
  const { t } = useTranslation();

  return (
    <li className="flex min-h-[56px] items-center gap-3 rounded-lg border border-dashed border-brand/50 bg-brand-50 px-3 py-2.5">
      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-brand" aria-hidden />
      <div className="flex min-w-0 flex-col">
        <Typography variant={TypographyVariant.BODY_SEMIBOLD} className="truncate">
          {title}
        </Typography>
        <Typography variant={TypographyVariant.HELPER}>{t(TEXT.AGENDA.BOARD.SAVING)}</Typography>
      </div>
    </li>
  );
};
