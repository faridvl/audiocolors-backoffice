import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { MaintenanceNumber } from '@/types/patients/patient';
import { MaintenanceNote } from '@/types/patients/patient-maintenance';
import { MaintenanceNoteForm } from './maintenance-note-form';
import { MaintenanceNoteHistory } from './maintenance-note-history';

interface MaintenanceNotesPanelProps {
  id: string;
  patientUuid: string;
  maintenanceNumber: MaintenanceNumber;
  notes: MaintenanceNote[];
  isMissedPending: boolean;
  onMissedSaved: () => void;
  onMissedCancel: () => void;
  isLoading: boolean;
  hasError: boolean;
  isRetrying: boolean;
  onRetry: () => void;
}

/** Bajo la fila, con sangría a la altura del título: notas como texto y una línea para agregar otra. */
export const MaintenanceNotesPanel: React.FC<MaintenanceNotesPanelProps> = ({
  id,
  patientUuid,
  maintenanceNumber,
  notes,
  isMissedPending,
  onMissedSaved,
  onMissedCancel,
  isLoading,
  hasError,
  isRetrying,
  onRetry,
}) => {
  const { t } = useTranslation();

  return (
    <div id={id} className="flex min-w-0 flex-col pl-8">
      {isLoading ? (
        <Typography variant={TypographyVariant.HELPER}>
          {t(TEXT.PATIENTS.FLAGS.MAINTENANCE.NOTES_LOADING)}
        </Typography>
      ) : hasError ? (
        <div className="flex flex-wrap items-center gap-x-3" role="alert">
          <Typography variant={TypographyVariant.ERROR}>
            {t(TEXT.PATIENTS.FLAGS.MAINTENANCE.NOTES_ERROR)}
          </Typography>
          <Button
            variant={ButtonVariant.GHOST}
            onClick={onRetry}
            isLoading={isRetrying}
            className="px-2 text-brand-700"
          >
            {t(TEXT.PATIENTS.FLAGS.MAINTENANCE.NOTES_RETRY)}
          </Button>
        </div>
      ) : (
        <MaintenanceNoteHistory notes={notes} />
      )}
      <MaintenanceNoteForm
        patientUuid={patientUuid}
        maintenanceNumber={maintenanceNumber}
        isMissedPending={isMissedPending}
        onMissedSaved={onMissedSaved}
        onMissedCancel={onMissedCancel}
      />
    </div>
  );
};
