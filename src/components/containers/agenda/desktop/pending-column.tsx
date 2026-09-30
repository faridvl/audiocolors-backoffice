import React from 'react';
import { useTranslation } from 'react-i18next';
import { DropZone } from '@/components/common/drop-zone/drop-zone';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { getFullName } from '@/shared/utils/formatters';
import { tailwind } from '@/utils/tailwind-utils';
import { TEXT } from '@/static/texts/i18n';
import { ListRow, SavingRow } from '../agenda-list-row';
import { AgendaState } from '../use-agenda';
import { SelectionBanner } from './selection-banner';
import { AgendaBoardState } from './use-agenda-board';

interface PendingColumnProps {
  agenda: AgendaState;
  board: AgendaBoardState;
  isDayPanelOpen: boolean;
}

/**
 * Columna derecha: pacientes del mes que todavía no tienen día. Se arrastran
 * a un horario para confirmarlos, y recibe una cita de vuelta para dejarla
 * otra vez solo con el mes.
 */
export const PendingColumn: React.FC<PendingColumnProps> = ({ agenda, board, isDayPanelOpen }) => {
  const { t } = useTranslation();
  const patients = agenda.pendingPatients;
  const { selectedPending } = board;

  return (
    <section className="flex flex-col gap-3 rounded-card border border-ink-200 bg-white p-4">
      <header>
        <Typography variant={TypographyVariant.SUBTITLE} as="h2">
          {t(TEXT.AGENDA.TABS.PENDING)}{' '}
          <Typography variant={TypographyVariant.SUBTITLE} inline className="text-ink-400">
            ({patients.length})
          </Typography>
        </Typography>
        <Typography variant={TypographyVariant.HELPER}>
          {t(TEXT.AGENDA.PENDING.SUBTITLE, {
            month: agenda.pendingMonthLabel,
            count: patients.length,
          })}
        </Typography>
      </header>

      {selectedPending && (
        <SelectionBanner
          patient={selectedPending}
          isDayPanelOpen={isDayPanelOpen}
          onViewDetails={() => agenda.handleOpenPending(selectedPending.uuid)}
          onCancel={board.handleClearSelection}
        />
      )}

      {!selectedPending && patients.length > 0 && (
        <Typography
          variant={TypographyVariant.HELPER}
          className="rounded-lg bg-brand-50 px-3 py-2 text-brand-700"
        >
          {t(TEXT.AGENDA.BOARD.PENDING_HINT)}
        </Typography>
      )}

      <DropZone
        accepts={board.acceptsOnPending}
        onDrop={board.handleDropOnPending}
        className={tailwind(
          'rounded-lg p-1',
          board.isDraggingAppointment && 'border border-dashed border-ink-300',
        )}
      >
        {board.isDraggingAppointment && (
          <Typography variant={TypographyVariant.HELPER} className="px-2 py-1 text-center">
            {t(TEXT.AGENDA.BOARD.RETURN_HERE)}
          </Typography>
        )}

        {patients.length === 0 && board.returningItems.length === 0 ? (
          <Typography variant={TypographyVariant.HELPER} className="py-8 text-center">
            {t(TEXT.AGENDA.PENDING.EMPTY, { month: agenda.pendingMonthLabel })}
          </Typography>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {board.returningItems.map((item) => (
              <SavingRow key={item.id} title={item.title} />
            ))}
            {patients.map((patient) => (
              <ListRow
                key={patient.uuid}
                title={getFullName(patient.firstName, patient.lastName)}
                subtitle={patient.tentativeAppointmentTypeName ?? t(TEXT.AGENDA.ROW.NO_TYPE)}
                branchName={agenda.resolveBranchName(patient.branchUuid)}
                drag={board.dragPending(patient)}
                className={tailwind(
                  patient.uuid === selectedPending?.uuid &&
                    'border-brand bg-brand-50 ring-2 ring-brand',
                )}
                onClick={() => board.handleTogglePending(patient)}
              />
            ))}
          </ul>
        )}
      </DropZone>
    </section>
  );
};
