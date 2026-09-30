import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { DropZone } from '@/components/common/drop-zone/drop-zone';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { resolveSection } from '../agenda-presenter';
import { AppointmentListRow, SavingRow } from '../agenda-list-row';
import { RowDensity } from '../agenda-styles';
import { AgendaState } from '../use-agenda';
import { AgendaBoardState, BoardSlot } from './use-agenda-board';

interface HourSlotProps {
  slot: BoardSlot;
  agenda: AgendaState;
  board: AgendaBoardState;
}

/**
 * Un horario del día: la hora arriba y sus citas debajo, a todo el ancho de
 * la ventana. Todo el bloque recibe lo que se suelta, y admite varias citas a
 * la misma hora.
 */
export const HourSlot: React.FC<HourSlotProps> = ({ slot, agenda, board }) => {
  const { t } = useTranslation();
  const count = slot.appointments.length + slot.saving.length;
  const isEmpty = count === 0;
  const isDropHintVisible = board.isDragging && board.isDayOpen;
  const canTapToSchedule = Boolean(board.selectedPending) && board.isDayOpen;

  return (
    <DropZone
      accepts={board.acceptsOnSlot}
      onDrop={() => board.handleDropOnSlot(slot.hour)}
      isDisabled={!board.isDayOpen}
      ariaLabel={t(TEXT.AGENDA.BOARD.SLOT_ARIA, { hour: slot.label, count })}
      className="min-w-0 rounded-lg border-t border-ink-100 px-1 pb-2 pt-1.5 first:border-t-0"
    >
      <Typography variant={TypographyVariant.HELPER} className="mb-1 font-semibold text-ink-600">
        {slot.label}
      </Typography>

      <ul className="flex min-w-0 flex-col gap-1">
        {slot.appointments.map((appointment) => (
          <AppointmentListRow
            key={appointment.id}
            appointment={appointment}
            section={resolveSection(appointment, agenda.selectedTiming)}
            scheduledByLabel={agenda.resolveScheduledBy(appointment.userUUID)}
            typeColor={agenda.resolveTypeColor(appointment.typeUUID)}
            branchName={agenda.resolveBranchName(appointment.branchUUID)}
            drag={board.dragAppointment(appointment)}
            density={RowDensity.COMPACT}
            onClick={() => agenda.handleOpenAppointment(appointment.id)}
          />
        ))}
        {slot.saving.map((item) => (
          <SavingRow key={item.id} title={item.title} />
        ))}
      </ul>

      {canTapToSchedule && (
        <Button
          variant={ButtonVariant.SECONDARY}
          onClick={() => board.handleTapSlot(slot.hour)}
          icon={<Plus className="h-4 w-4" aria-hidden />}
          className="mt-1 min-h-[36px] w-full border-dashed border-brand/50 text-brand-700 hover:bg-brand-50"
        >
          {t(TEXT.AGENDA.BOARD.SELECTION.SCHEDULE_HERE)}
        </Button>
      )}

      {/* Mientras se arrastra, los horarios vacíos dicen dónde se puede soltar. */}
      {isEmpty && isDropHintVisible && (
        <Typography
          variant={TypographyVariant.HELPER}
          as="div"
          className="flex h-9 items-center rounded-lg border border-dashed border-ink-300 px-3 text-ink-400"
        >
          {t(TEXT.AGENDA.BOARD.DROP_HERE)}
        </Typography>
      )}
    </DropZone>
  );
};
