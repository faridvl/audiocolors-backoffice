import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { ColorDot } from '@/components/common/color-dot/color-dot';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { getBranchStripeColor, topStripeStyle } from '@/shared/design/tokens';
import { formatMinuteOfDay } from '@/shared/utils/dates';
import { EMPTY_VALUE } from '@/shared/utils/formatters';
import { tailwind } from '@/utils/tailwind-utils';
import { TEXT } from '@/static/texts/i18n';
import { AppointmentStatus } from '@/types/appointments/appointment';
import { AgendaSection, TimelineBlock as TimelineBlockData } from '../agenda-presenter';
import { RowDragProps } from '../agenda-list-row';
import { SECTION_ROW_STYLES, TIMELINE_TWO_LINES_MIN_PX } from '../agenda-styles';

interface TimelineBlockProps {
  block: TimelineBlockData;
  section: AgendaSection;
  typeColor?: string;
  branchName?: string;
  style: React.CSSProperties;
  heightPx: number;
  drag?: RowDragProps;
  isDragSource: boolean;
  /** Mientras se arrastra algo, los bloques dejan pasar el puntero a la línea de tiempo. */
  isPassThrough: boolean;
  onClick: () => void;
}

/** Una cita en la línea de tiempo: alto según su duración, como un evento de Teams. */
export const TimelineBlock: React.FC<TimelineBlockProps> = ({
  block,
  section,
  typeColor,
  branchName,
  style,
  heightPx,
  drag,
  isDragSource,
  isPassThrough,
  onClick,
}) => {
  const { t } = useTranslation();
  const { appointment, startMinute, endMinute } = block;
  const isDone = appointment.status === AppointmentStatus.COMPLETED;
  const timeRange = t(TEXT.AGENDA.BOARD.TIME_RANGE, {
    start: formatMinuteOfDay(startMinute),
    end: formatMinuteOfDay(endMinute),
  });
  const hasTwoLines = heightPx >= TIMELINE_TWO_LINES_MIN_PX;

  return (
    <Button
      variant={ButtonVariant.CARD}
      onClick={(event) => {
        // El clic no llega a la línea de tiempo: ahí tocar es agendar.
        event.stopPropagation();
        onClick();
      }}
      draggable={Boolean(drag)}
      onDragStart={drag?.onDragStart}
      onDragEnd={drag?.onDragEnd}
      title={[appointment.patientName ?? EMPTY_VALUE, timeRange, appointment.typeName]
        .filter(Boolean)
        .join(' · ')}
      style={{ ...style, ...topStripeStyle(getBranchStripeColor(branchName)) }}
      className={tailwind(
        // El alto y el ancho los da la duración (style), no el mínimo táctil de una fila.
        'absolute min-h-0 flex-col items-stretch justify-start gap-0 overflow-hidden rounded-md px-2 py-0.5 text-left',
        SECTION_ROW_STYLES[section],
        drag && 'cursor-grab active:cursor-grabbing',
        isDragSource && 'opacity-40',
        isPassThrough && 'pointer-events-none',
      )}
    >
      <span className="flex min-w-0 items-center gap-1.5">
        <ColorDot color={typeColor} className="h-2 w-2" />
        <Typography
          variant={TypographyVariant.HELPER}
          inline
          className={tailwind('truncate font-semibold text-ink-900', isDone && 'text-ink-500')}
        >
          {appointment.patientName ?? EMPTY_VALUE}
        </Typography>
        {isDone && <Check className="h-3.5 w-3.5 shrink-0 text-success" aria-hidden />}
      </span>
      {hasTwoLines && (
        <Typography variant={TypographyVariant.HELPER} inline className="truncate">
          {[timeRange, appointment.typeName ?? t(TEXT.AGENDA.ROW.NO_TYPE)].join(' · ')}
        </Typography>
      )}
    </Button>
  );
};
