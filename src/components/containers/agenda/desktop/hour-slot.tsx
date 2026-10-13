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
 * la ventana. La pista de soltar va en la línea de la hora, así aparece sin
 * correr la lista mientras se arrastra.
 */
export const HourSlot: React.FC<HourSlotProps> = ({ slot, agenda, board }) => {
  const { t } = useTranslation();
  const count = slot.appointments.length + slot.saving.length;
  const canTapToSchedule = Boolean(board.selectedPending) && board.isDayOpen;
  const hasRows = count > 0 || canTapToSchedule;

  return (
    <DropZone
      accepts={board.acceptsOnSlot}
      onDrop={() => board.handleDropOnSlot(slot.hour)}
      isDisabled={!board.isDayOpen}
      ariaLabel={t(TEXT.AGENDA.BOARD.SLOT_ARIA, { hour: slot.label, count })}
      className="min-w-0 rounded-lg border-t border-ink-100 px-1.5 py-1.5 first:border-t-0"
    >
      {(isOver) => (
        <>
          <div className="flex min-h-[28px] items-center justify-between gap-2">
            <Typography variant={TypographyVariant.HELPER} className="font-semibold text-ink-600">
              {slot.label}
            </Typography>
            {isOver && (
              <Typography variant={TypographyVariant.HELPER} className="font-semibold text-brand-700">
                {t(TEXT.AGENDA.BOARD.DROP_HERE)}
              </Typography>
            )}
          </div>

          {hasRows && (
            <ul className="mt-1 flex min-w-0 flex-col gap-1">
              {slot.appointments.map((appointment) => (
                <AppointmentListRow
                  key={appointment.id}
                  appointment={appointment}
                  section={resolveSection(appointment, agenda.selectedTiming)}
                  scheduledByLabel={agenda.resolveScheduledBy(appointment.userUUID)}
                  typeColor={agenda.resolveTypeColor(appointment.typeUUID)}
                  branchName={agenda.resolveBranchName(appointment.branchUUID)}
                  drag={board.dragAppointment(appointment)}
                  isDragSource={board.isDragSource(appointment.id)}
                  density={RowDensity.COMPACT}
                  onClick={() => agenda.handleOpenAppointment(appointment.id)}
                />
              ))}
              {slot.saving.map((item) => (
                <SavingRow key={item.id} title={item.title} />
              ))}
              {canTapToSchedule && (
                <li>
                  <Button
                    variant={ButtonVariant.SECONDARY}
                    onClick={() => board.handleTapSlot(slot.hour)}
                    icon={<Plus className="h-4 w-4" aria-hidden />}
                    className="min-h-[36px] w-full border-dashed border-brand/50 text-brand-700 hover:bg-brand-50"
                  >
                    {t(TEXT.AGENDA.BOARD.SELECTION.SCHEDULE_HERE)}
                  </Button>
                </li>
              )}
            </ul>
          )}
        </>
      )}
    </DropZone>
  );
};
