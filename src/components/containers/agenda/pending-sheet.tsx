import React from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarCheck, Phone, UserRound } from 'lucide-react';
import { EMPTY_VALUE, formatMonthLabel, getFullName } from '@/shared/utils/formatters';
import { TEXT } from '@/static/texts/i18n';
import { Patient } from '@/types/patients/patient';
import { ActionSheet } from './action-sheet';
import { AgendaState } from './use-agenda';

/** Ficha de un paciente con mes tentativo: confirmar día, llamar o ver expediente. */
export const PendingSheet: React.FC<{ agenda: AgendaState; patient: Patient }> = ({
  agenda,
  patient,
}) => {
  const { t } = useTranslation();

  return (
    <ActionSheet
      title={getFullName(patient.firstName, patient.lastName)}
      status={t(TEXT.AGENDA.TABS.PENDING)}
      details={[
        {
          label: t(TEXT.AGENDA.SHEET.MONTH),
          value: formatMonthLabel(patient.tentativeAppointmentMonth),
        },
        {
          label: t(TEXT.AGENDA.SHEET.TYPE),
          value: patient.tentativeAppointmentTypeName ?? t(TEXT.AGENDA.ROW.NO_TYPE),
        },
        { label: t(TEXT.AGENDA.SHEET.PHONE), value: patient.phone ?? EMPTY_VALUE },
      ]}
      primaryAction={{
        label: t(TEXT.AGENDA.PENDING.SET_DAY),
        icon: CalendarCheck,
        onClick: () => agenda.handleSetPendingDay(patient),
      }}
      actions={[
        ...(patient.phone
          ? [
              {
                label: t(TEXT.AGENDA.PENDING.CALL_SHORT),
                icon: Phone,
                onClick: () => agenda.handleCallPatient(patient),
              },
            ]
          : []),
        {
          label: t(TEXT.AGENDA.MENU.VIEW_PATIENT),
          icon: UserRound,
          onClick: () => agenda.navigateToPatient(patient.uuid),
        },
      ]}
      onClose={agenda.handleClosePending}
    />
  );
};
