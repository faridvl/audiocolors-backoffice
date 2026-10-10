import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { tailwind } from '@/utils/tailwind-utils';
import { TEXT } from '@/static/texts/i18n';
import { AgendaSection } from './agenda-presenter';
import { SECTION_TONES } from './agenda-styles';
import { AppointmentListRow } from './agenda-list-row';
import { AgendaEmpty, AgendaError, AgendaLoading } from './agenda-states';
import { AgendaState } from './use-agenda';

export const DayList: React.FC<{ agenda: AgendaState }> = ({ agenda }) => {
  const { t } = useTranslation();
  const { groups, isLoading, isError } = agenda;

  if (isLoading) return <AgendaLoading />;
  if (isError) return <AgendaError onRetry={() => void agenda.handleRetry()} />;
  if (groups.length === 0) return <AgendaEmpty />;

  return (
    <div className="flex flex-col gap-5">
      {groups.map((group) => (
        <div key={group.section}>
          <Typography
            variant={TypographyVariant.HELPER}
            as="h3"
            className={tailwind('mb-1.5 font-semibold', SECTION_TONES[group.section])}
          >
            {t(`${TEXT.AGENDA.SECTION_PREFIX}.${group.section}`)} · {group.appointments.length}
          </Typography>
          {group.section === AgendaSection.UNMARKED && (
            <Typography variant={TypographyVariant.HELPER} className="mb-1.5">
              {t(TEXT.AGENDA.UNMARKED_HINT)}
            </Typography>
          )}
          <ul className="flex flex-col gap-1.5">
            {group.appointments.map((appointment) => (
              <AppointmentListRow
                key={appointment.id}
                appointment={appointment}
                section={group.section}
                scheduledByLabel={agenda.resolveScheduledBy(appointment.userUUID)}
                typeColor={agenda.resolveTypeColor(appointment.typeUUID)}
                branchName={agenda.resolveBranchName(appointment.branchUUID)}
                onClick={() => agenda.handleOpenAppointment(appointment.id)}
              />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};
