import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { EMPTY_VALUE } from '@/shared/utils/formatters';
import { TEXT } from '@/static/texts/i18n';
import { Appointment } from '@/types/appointments/appointment';
import { resolveSlotHour } from './agenda-presenter';
import { HourGrid } from './hour-grid';
import { SheetDialog } from './sheet-dialog';
import { AgendaState } from './use-agenda';

/** Poner o cambiar la hora de una cita confirmada; guarda lo mismo que arrastrarla en escritorio. */
export const TimeSheet: React.FC<{ agenda: AgendaState; appointment: Appointment }> = ({
  agenda,
  appointment,
}) => {
  const { t } = useTranslation();

  return (
    <SheetDialog
      title={appointment.patientName ?? EMPTY_VALUE}
      status={t(TEXT.AGENDA.TIME_SHEET.STATUS)}
      onClose={agenda.handleCloseTime}
    >
      <div className="mt-4">
        <Typography variant={TypographyVariant.HELPER} className="font-semibold text-ink-700">
          {t(TEXT.AGENDA.CONFIRM_SHEET.HOURS)} · {agenda.dayTitle}
        </Typography>
        <HourGrid
          selectedHour={resolveSlotHour(appointment)}
          onSelectHour={(hour) => agenda.handleSetTimeAt(appointment, hour)}
        />
      </div>
    </SheetDialog>
  );
};
