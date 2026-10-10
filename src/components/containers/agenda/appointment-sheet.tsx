import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  CalendarPlus,
  CalendarX2,
  CircleCheck,
  Clock,
  DoorOpen,
  MessageCircle,
  RotateCcw,
  Undo2,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import { TEXT } from '@/static/texts/i18n';
import { Appointment } from '@/types/appointments/appointment';
import {
  AppointmentAction,
  resolveAppointmentActions,
  resolveSection,
  resolveSlotHour,
} from './agenda-presenter';
import { ActionSheet, SheetAction } from './action-sheet';
import { AgendaState } from './use-agenda';
import { EMPTY_VALUE } from '@/shared/utils/formatters';
import { formatHour } from '@/shared/utils/dates';

const ACTION_ICONS: Record<AppointmentAction, LucideIcon> = {
  [AppointmentAction.MARK_ARRIVED]: DoorOpen,
  [AppointmentAction.MARK_DONE]: CircleCheck,
  [AppointmentAction.UNDO_ARRIVED]: RotateCcw,
  [AppointmentAction.SET_TIME]: Clock,
  [AppointmentAction.RESCHEDULE]: CalendarX2,
  [AppointmentAction.WHATSAPP]: MessageCircle,
  [AppointmentAction.CALENDAR]: CalendarPlus,
  [AppointmentAction.RETURN_TO_PENDING]: Undo2,
};

const ACTION_LABELS: Record<AppointmentAction, string> = {
  [AppointmentAction.MARK_ARRIVED]: TEXT.AGENDA.ROW.MARK_ARRIVED,
  [AppointmentAction.MARK_DONE]: TEXT.AGENDA.ROW.MARK_DONE,
  [AppointmentAction.UNDO_ARRIVED]: TEXT.AGENDA.MENU.UNDO_ARRIVED,
  [AppointmentAction.SET_TIME]: TEXT.AGENDA.MENU.SET_TIME,
  [AppointmentAction.RESCHEDULE]: TEXT.AGENDA.MENU.RESCHEDULE,
  [AppointmentAction.WHATSAPP]: TEXT.AGENDA.MENU.WHATSAPP,
  [AppointmentAction.CALENDAR]: TEXT.AGENDA.MENU.CALENDAR,
  [AppointmentAction.RETURN_TO_PENDING]: TEXT.AGENDA.MENU.RETURN_TO_PENDING,
};

export const AppointmentSheet: React.FC<{ agenda: AgendaState; appointment: Appointment }> = ({
  agenda,
  appointment,
}) => {
  const { t } = useTranslation();
  const { primary, secondary } = resolveAppointmentActions(appointment, agenda.selectedTiming);
  const section = resolveSection(appointment, agenda.selectedTiming);
  const slotHour = resolveSlotHour(appointment);

  const runAction = (action: AppointmentAction) => {
    switch (action) {
      case AppointmentAction.MARK_ARRIVED:
        return agenda.handleMarkArrived(appointment);
      case AppointmentAction.MARK_DONE:
        return agenda.handleMarkDone(appointment);
      case AppointmentAction.UNDO_ARRIVED:
        return agenda.handleUndoArrived(appointment);
      case AppointmentAction.SET_TIME:
        return agenda.handleOpenTime(appointment);
      case AppointmentAction.RESCHEDULE:
        return agenda.handleReschedule(appointment);
      case AppointmentAction.WHATSAPP:
        return void agenda.handleSendWhatsApp(appointment, agenda.selectedDayKey);
      case AppointmentAction.CALENDAR:
        return agenda.handleAddToCalendar(appointment, agenda.selectedDayKey);
      case AppointmentAction.RETURN_TO_PENDING:
        return agenda.handleReturnToPending(appointment);
    }
  };

  const toSheetAction = (action: AppointmentAction): SheetAction => ({
    label: t(
      action === AppointmentAction.SET_TIME && slotHour !== null
        ? TEXT.AGENDA.MENU.CHANGE_TIME
        : ACTION_LABELS[action],
    ),
    icon: ACTION_ICONS[action],
    onClick: () => runAction(action),
  });

  return (
    <ActionSheet
      title={appointment.patientName ?? EMPTY_VALUE}
      status={t(`${TEXT.AGENDA.STATUS_PREFIX}.${section}`)}
      details={[
        { label: t(TEXT.AGENDA.SHEET.DAY), value: agenda.dayTitle },
        {
          label: t(TEXT.AGENDA.SHEET.TIME),
          value: slotHour === null ? t(TEXT.AGENDA.BOARD.NO_TIME) : formatHour(slotHour),
        },
        {
          label: t(TEXT.AGENDA.SHEET.TYPE),
          value: appointment.typeName ?? t(TEXT.AGENDA.ROW.NO_TYPE),
        },
        {
          label: t(TEXT.AGENDA.SHEET.BRANCH),
          value: agenda.resolveBranchName(appointment.branchUUID) ?? EMPTY_VALUE,
        },
        {
          label: t(TEXT.AGENDA.SHEET.SCHEDULED_BY),
          value:
            agenda.resolveSchedulerName(appointment.userUUID) ??
            t(TEXT.AGENDA.SHEET.SCHEDULED_BY_UNKNOWN),
        },
      ]}
      primaryAction={primary ? toSheetAction(primary) : undefined}
      isPrimaryLoading={agenda.updatingAppointmentUuid === appointment.id}
      actions={[
        ...secondary.map(toSheetAction),
        {
          label: t(TEXT.AGENDA.MENU.VIEW_PATIENT),
          icon: UserRound,
          onClick: () => agenda.navigateToPatient(appointment.patientUUID),
        },
      ]}
      onClose={agenda.handleCloseAppointment}
    />
  );
};
