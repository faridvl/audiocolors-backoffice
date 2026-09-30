import React from 'react';
import { ScheduleAppointmentModal } from '@/components/containers/patients/schedule-appointment/schedule-appointment-modal';
import { AgendaMobile } from './agenda-mobile';
import { AgendaDesktop } from './desktop/agenda-desktop';
import { AppointmentSheet } from './appointment-sheet';
import { CalendarSyncSheet } from './calendar-sync/calendar-sync-sheet';
import { ConfirmDaySheet } from './confirm-day-sheet';
import { PatientPickerModal } from './patient-picker-modal';
import { PendingSheet } from './pending-sheet';
import { useAgenda } from './use-agenda';

/**
 * Dos distribuciones sobre el mismo estado: el celular conserva la franja
 * semanal con pestañas; escritorio (`lg`) muestra el mes, los horarios del
 * día y "Por confirmar" a la vez, para agendar arrastrando. Fichas y modales
 * son comunes a las dos.
 */
export const AgendaContainer: React.FC = () => {
  const agenda = useAgenda();
  const { openAppointment, openPendingPatient, confirmTarget, scheduleTarget } = agenda;

  return (
    <>
      <div className="lg:hidden">
        <AgendaMobile agenda={agenda} />
      </div>
      <div className="hidden lg:block">
        <AgendaDesktop agenda={agenda} />
      </div>

      {openAppointment && <AppointmentSheet agenda={agenda} appointment={openAppointment} />}

      {openPendingPatient && <PendingSheet agenda={agenda} patient={openPendingPatient} />}

      {confirmTarget && <ConfirmDaySheet agenda={agenda} patient={confirmTarget} />}

      {agenda.isCalendarSyncOpen && <CalendarSyncSheet onClose={agenda.handleCloseCalendarSync} />}

      {agenda.isPickerOpen && (
        <PatientPickerModal onPick={agenda.handlePickPatient} onClose={agenda.handleClosePicker} />
      )}

      {scheduleTarget && (
        <ScheduleAppointmentModal
          patientUuid={scheduleTarget.patientUuid}
          tentativeMonth={scheduleTarget.tentativeMonth}
          tentativeTypeUuid={scheduleTarget.typeUuid}
          branchUuid={scheduleTarget.branchUuid}
          initialMode={scheduleTarget.initialMode}
          onClose={agenda.handleCloseSchedule}
        />
      )}
    </>
  );
};
