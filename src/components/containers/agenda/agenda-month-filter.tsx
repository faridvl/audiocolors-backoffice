import React from 'react';
import { useTranslation } from 'react-i18next';
import { PillSelect } from '@/components/common/pill-select/pill-select';
import { TEXT } from '@/static/texts/i18n';
import { AgendaState } from './use-agenda';

/**
 * Filtro de mes de "Por confirmar". Va aparte del calendario: se puede ver a
 * los pendientes de septiembre y agendarlos en un día de octubre.
 */
export const AgendaMonthFilter: React.FC<{ agenda: AgendaState }> = ({ agenda }) => {
  const { t } = useTranslation();

  return (
    <div className="w-full sm:w-48">
      <PillSelect
        value={agenda.pendingMonthKey}
        options={agenda.monthOptions}
        onChange={agenda.handleSelectPendingMonth}
        ariaLabel={t(TEXT.AGENDA.FILTERS.MONTH_ARIA)}
      />
    </div>
  );
};
