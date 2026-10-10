import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { formatLongDay, resolveInitialConfirmDay, toMonthKey } from '@/shared/utils/dates';
import { getFullName } from '@/shared/utils/formatters';
import { TEXT } from '@/static/texts/i18n';
import { Patient } from '@/types/patients/patient';
import { DayTiming, getDayTiming } from './agenda-presenter';
import { HourGrid } from './hour-grid';
import { MonthCalendar } from './month-calendar';
import { SheetDialog } from './sheet-dialog';
import { AgendaState } from './use-agenda';

interface ConfirmDaySheetProps {
  agenda: AgendaState;
  patient: Patient;
}

/**
 * Confirmar un pendiente sin formulario: el calendario propio de la ficha y
 * las horas debajo; tocar una hora confirma. El calendario es independiente de
 * la lista, así que alguien de septiembre se puede agendar el 1 de octubre.
 * Es el mismo guardado que arrastrar en escritorio.
 */
export const ConfirmDaySheet: React.FC<ConfirmDaySheetProps> = ({ agenda, patient }) => {
  const { t } = useTranslation();
  const { todayKey } = agenda;
  const [dayKey, setDayKey] = useState(() =>
    resolveInitialConfirmDay(patient.tentativeAppointmentMonth, todayKey),
  );
  const [visibleMonthKey, setVisibleMonthKey] = useState(toMonthKey(dayKey));
  const isPastDay = getDayTiming(dayKey, todayKey) === DayTiming.PAST;

  const handleSelectDay = (nextDayKey: string) => {
    setDayKey(nextDayKey);
    setVisibleMonthKey(toMonthKey(nextDayKey));
  };

  return (
    <SheetDialog
      title={getFullName(patient.firstName, patient.lastName)}
      status={[
        patient.tentativeAppointmentTypeName ?? t(TEXT.AGENDA.ROW.NO_TYPE),
        t(TEXT.AGENDA.CONFIRM_SHEET.STATUS),
      ].join(' · ')}
      onClose={agenda.handleCloseConfirm}
    >
      <div className="mt-4">
        <MonthCalendar
          visibleMonthKey={visibleMonthKey}
          onVisibleMonthChange={setVisibleMonthKey}
          selectedDayKey={dayKey}
          todayKey={todayKey}
          onSelectDay={handleSelectDay}
          onSelectToday={() => handleSelectDay(todayKey)}
        />
      </div>

      <div className="mt-4 border-t border-ink-100 pt-3">
        <Typography variant={TypographyVariant.HELPER} className="font-semibold text-ink-700">
          {t(TEXT.AGENDA.CONFIRM_SHEET.HOURS)} · {formatLongDay(dayKey, todayKey)}
        </Typography>

        {isPastDay ? (
          <Typography
            variant={TypographyVariant.HELPER}
            className="mt-2 rounded-lg bg-ink-50 px-3 py-2"
          >
            {t(TEXT.AGENDA.BOARD.PAST_DAY)}
          </Typography>
        ) : (
          <HourGrid onSelectHour={(hour) => agenda.handleConfirmAt(dayKey, hour)} />
        )}
      </div>

      <Button
        variant={ButtonVariant.GHOST}
        onClick={() => agenda.handleOpenScheduleOptions(patient)}
        className="mt-3 w-full"
      >
        {t(TEXT.AGENDA.CONFIRM_SHEET.MORE_OPTIONS)}
      </Button>
    </SheetDialog>
  );
};
