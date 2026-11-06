import React from 'react';
import { ChevronDown, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import {
  SegmentedControl,
  SegmentedControlSize,
  SegmentedOption,
} from '@/components/common/segmented-control/segmented-control';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { MaintenanceStatus } from '@/types/patients/patient';
import { tailwind } from '@/utils/tailwind-utils';
import { MaintenanceNotesPanel } from './maintenance-notes-panel';
import { MAINTENANCE_NOTES_BUTTON_STYLES } from './patient-maintenance-styles';
import { MaintenanceRow } from './use-patient-maintenance';

interface PatientMaintenanceRowProps {
  row: MaintenanceRow;
  patientUuid: string;
  options: SegmentedOption<MaintenanceStatus>[];
  isSaving: boolean;
  isLoadingNotes: boolean;
  isFetchingNotes: boolean;
  hasNotesError: boolean;
  isOpen: boolean;
  rowRef: (element: HTMLElement | null) => void;
  onStatusChange: (status: MaintenanceStatus) => void;
  onToggleNotes: () => void;
  onRetryNotes: () => void;
}

/** Una línea por mantenimiento: título, estado y botón de notas; el panel de notas se abre debajo. */
export const PatientMaintenanceRow: React.FC<PatientMaintenanceRowProps> = ({
  row,
  patientUuid,
  options,
  isSaving,
  isLoadingNotes,
  isFetchingNotes,
  hasNotesError,
  isOpen,
  rowRef,
  onStatusChange,
  onToggleNotes,
  onRetryNotes,
}) => {
  const { t } = useTranslation();
  const title = t(TEXT.PATIENTS.FLAGS.MAINTENANCE.ROW_TITLE, {
    number: row.maintenanceNumber,
  });
  const panelId = `maintenance-notes-${row.maintenanceNumber}`;
  const noteCount = row.notes.length;

  const renderNotesLabel = () => {
    if (isLoadingNotes) {
      return (
        <>
          <span aria-hidden="true" className="h-3 w-16 animate-pulse rounded bg-ink-200" />
          <span className="sr-only">{t(TEXT.PATIENTS.FLAGS.MAINTENANCE.NOTES_LOADING)}</span>
        </>
      );
    }
    if (hasNotesError) {
      return t(TEXT.PATIENTS.FLAGS.MAINTENANCE.NOTES_BUTTON_UNKNOWN);
    }
    if (noteCount > 0) {
      return t(TEXT.PATIENTS.FLAGS.MAINTENANCE.NOTES_BUTTON_COUNT, {
        count: noteCount,
      });
    }
    return t(TEXT.PATIENTS.FLAGS.MAINTENANCE.NOTES_BUTTON_EMPTY);
  };

  return (
    <div ref={rowRef} className="min-w-0">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 py-2 sm:grid-cols-[minmax(0,1fr)_13.5rem_9.5rem]">
        <Typography variant={TypographyVariant.BODY} className="min-w-0 font-semibold text-ink-800">
          {title}
        </Typography>
        <SegmentedControl
          options={options}
          value={row.status}
          onChange={onStatusChange}
          ariaLabel={title}
          size={SegmentedControlSize.COMPACT}
          isDisabled={isSaving}
          isFullWidth
          className="col-span-2 row-start-2 sm:col-span-1 sm:col-start-2 sm:row-start-1 [&>button]:min-h-[44px] sm:[&>button]:min-h-[36px] sm:[&>button]:flex-auto sm:[&>button]:px-1.5"
        />
        <Button
          variant={ButtonVariant.GHOST}
          onClick={onToggleNotes}
          disabled={isLoadingNotes}
          aria-expanded={isOpen}
          aria-controls={panelId}
          icon={<MessageSquare className="h-4 w-4" aria-hidden="true" />}
          className={tailwind(
            'col-start-2 row-start-1 min-h-[44px] min-w-[9.5rem] sm:col-start-3 justify-start px-2.5 py-1.5 text-brand-700 sm:min-h-[36px]',
            MAINTENANCE_NOTES_BUTTON_STYLES,
          )}
        >
          <span className="flex min-w-0 flex-1 items-center gap-2 text-left">
            {renderNotesLabel()}
          </span>
          <ChevronDown
            aria-hidden="true"
            className={tailwind('h-4 w-4 shrink-0 transition-transform', isOpen && 'rotate-180')}
          />
        </Button>
      </div>
      {isOpen && (
        <MaintenanceNotesPanel
          id={panelId}
          patientUuid={patientUuid}
          maintenanceNumber={row.maintenanceNumber}
          notes={row.notes}
          isLoading={isLoadingNotes}
          hasError={hasNotesError}
          isRetrying={isFetchingNotes}
          onRetry={onRetryNotes}
        />
      )}
    </div>
  );
};
