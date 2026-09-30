import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs } from '@/components/common/tabs/tabs';
import { TEXT } from '@/static/texts/i18n';
import { AgendaState, AgendaView } from './use-agenda';

/** Celular: "Por confirmar" primero, es la tarea principal; después las citas del día. */
export const ViewTabs: React.FC<{ agenda: AgendaState }> = ({ agenda }) => {
  const { t } = useTranslation();

  return (
    <Tabs
      ariaLabel={t(TEXT.AGENDA.TABS.ARIA)}
      value={agenda.view}
      onChange={agenda.handleViewChange}
      items={[
        {
          value: AgendaView.PENDING,
          label: t(TEXT.AGENDA.TABS.PENDING),
          count: agenda.pendingPatients.length,
        },
        { value: AgendaView.DAY, label: t(TEXT.AGENDA.TABS.DAY), count: agenda.dayCount },
      ]}
    />
  );
};
