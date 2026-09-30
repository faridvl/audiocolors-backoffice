import React from 'react';
import { useEscapeKey } from '@/hooks/use-escape-key';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { tailwind } from '@/utils/tailwind-utils';
import { TEXT } from '@/static/texts/i18n';
import { DayPanelSide, resolveSection } from '../agenda-presenter';
import { AppointmentListRow } from '../agenda-list-row';
import { RowDensity } from '../agenda-styles';
import { AgendaError, AgendaLoading } from '../agenda-states';
import { AgendaState } from '../use-agenda';
import { HourSlot } from './hour-slot';
import { AgendaBoardState } from './use-agenda-board';

/** Posición de la ventana sobre el calendario, según el lado que le toca. */
const SIDE_STYLES: Record<DayPanelSide, string> = {
  [DayPanelSide.LEFT]: 'left-3',
  [DayPanelSide.RIGHT]: 'right-3',
};

interface DayPanelProps {
  agenda: AgendaState;
  board: AgendaBoardState;
  side: DayPanelSide;
  onClose: () => void;
}

/** Citas confirmadas sin hora (desde el modal): arriba, para arrastrarlas a un horario. */
const UnscheduledBlock: React.FC<Pick<DayPanelProps, 'agenda' | 'board'>> = ({ agenda, board }) => {
  const { t } = useTranslation();
  if (board.unscheduledAppointments.length === 0) return null;

  return (
    <div className="rounded-lg border border-dashed border-ink-300 bg-ink-50 p-3">
      <Typography variant={TypographyVariant.HELPER} as="h3" className="font-semibold text-ink-700">
        {t(TEXT.AGENDA.BOARD.NO_TIME)} · {board.unscheduledAppointments.length}
      </Typography>
      <Typography variant={TypographyVariant.HELPER} className="mb-2">
        {t(TEXT.AGENDA.BOARD.NO_TIME_HINT)}
      </Typography>
      <ul className="flex flex-col gap-1.5">
        {board.unscheduledAppointments.map((appointment) => (
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
      </ul>
    </div>
  );
};

/**
 * Ventana de horarios del día elegido, flotando sobre el calendario. Se abre
 * al tocar un día y queda abierta mientras se arrastra desde "Por confirmar".
 */
export const DayPanel: React.FC<DayPanelProps> = ({ agenda, board, side, onClose }) => {
  const { t } = useTranslation();

  useEscapeKey(onClose);

  return (
    <section
      aria-label={agenda.dayTitle}
      className={tailwind(
        'absolute bottom-3 top-3 z-20 flex w-80 flex-col rounded-card border border-ink-200 bg-white shadow-xl',
        SIDE_STYLES[side],
      )}
    >
      <header className="flex items-start justify-between gap-3 border-b border-ink-100 p-4">
        <div className="min-w-0">
          <Typography variant={TypographyVariant.SUBTITLE} as="h2" className="truncate">
            {agenda.dayTitle}
          </Typography>
          <Typography variant={TypographyVariant.HELPER}>
            {t(TEXT.AGENDA.BOARD.COUNT, { count: agenda.dayCount })}
          </Typography>
        </div>
        <Button
          variant={ButtonVariant.GHOST}
          onClick={onClose}
          aria-label={t(TEXT.AGENDA.SHEET.CLOSE)}
          icon={<X className="h-5 w-5" aria-hidden />}
          className="min-h-[40px] shrink-0 px-2"
        />
      </header>

      <div className="flex min-w-0 flex-1 flex-col gap-3 overflow-y-auto overflow-x-hidden p-3">
        {!board.isDayOpen && (
          <Typography variant={TypographyVariant.HELPER} className="rounded-lg bg-ink-50 px-3 py-2">
            {t(TEXT.AGENDA.BOARD.PAST_DAY)}
          </Typography>
        )}

        {agenda.isLoading && <AgendaLoading />}
        {agenda.isError && <AgendaError onRetry={() => void agenda.handleRetry()} />}

        {!agenda.isLoading && !agenda.isError && (
          <>
            <UnscheduledBlock agenda={agenda} board={board} />
            <div>
              {board.slots.map((slot) => (
                <HourSlot key={slot.hour} slot={slot} agenda={agenda} board={board} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};
