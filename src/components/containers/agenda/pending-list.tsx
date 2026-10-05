import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { getFullName } from '@/shared/utils/formatters';
import { TEXT } from '@/static/texts/i18n';
import { ListRow } from './agenda-list-row';
import { AgendaState } from './use-agenda';

export const PendingList: React.FC<{ agenda: AgendaState }> = ({ agenda }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2">
      <Typography variant={TypographyVariant.HELPER}>
        {t(TEXT.AGENDA.PENDING.SUBTITLE, {
          month: agenda.pendingMonthLabel,
          count: agenda.pendingPatients.length,
        })}
      </Typography>

      {agenda.pendingPatients.length === 0 ? (
        <Typography variant={TypographyVariant.HELPER} className="py-8 text-center">
          {t(TEXT.AGENDA.PENDING.EMPTY, { month: agenda.pendingMonthLabel })}
        </Typography>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {agenda.pendingPatients.map((patient) => (
            <ListRow
              key={patient.uuid}
              title={getFullName(patient.firstName, patient.lastName)}
              subtitle={patient.tentativeAppointmentTypeName ?? t(TEXT.AGENDA.ROW.NO_TYPE)}
              branchName={agenda.resolveBranchName(patient.branchUuid)}
              onClick={() => agenda.handleOpenPending(patient.uuid)}
            />
          ))}
        </ul>
      )}
    </div>
  );
};
