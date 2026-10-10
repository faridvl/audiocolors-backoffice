import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { Button } from '@/components/common/button/button';
import { PillSelect } from '@/components/common/pill-select/pill-select';
import { TEXT } from '@/static/texts/i18n';
import { ALL_BRANCHES, AgendaState } from './use-agenda';

/** Filtro de sede y "Agendar": iguales en el celular y en escritorio. */
export const AgendaActions: React.FC<{ agenda: AgendaState }> = ({ agenda }) => {
  const { t } = useTranslation();

  return (
    // En móvil cada control va en su fila, a todo lo ancho.
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      {agenda.hasBranches && (
        <div className="w-full sm:w-44">
          <PillSelect
            value={agenda.branchFilter}
            options={agenda.branchOptions}
            onChange={agenda.handleBranchFilter}
            ariaLabel={t(TEXT.AGENDA.FILTERS.BRANCH_ARIA)}
            isActive={agenda.branchFilter !== ALL_BRANCHES}
          />
        </div>
      )}
      <Button
        onClick={agenda.handleOpenPicker}
        icon={<Plus className="h-4 w-4" aria-hidden />}
        className="w-full shrink-0 rounded-full sm:w-auto"
      >
        {t(TEXT.AGENDA.SCHEDULE)}
      </Button>
    </div>
  );
};
