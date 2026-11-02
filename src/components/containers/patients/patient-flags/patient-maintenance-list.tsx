import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  SegmentedControl,
  SegmentedOption,
} from '@/components/common/segmented-control/segmented-control';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { MaintenanceStatus, Patient } from '@/types/patients/patient';
import { MaintenanceNoteForm } from './maintenance-note-form';
import { MaintenanceNoteHistory } from './maintenance-note-history';
import { MAINTENANCE_SELECTED_STYLES } from './patient-maintenance-styles';
import { usePatientMaintenance } from './use-patient-maintenance';

const MAINTENANCE_STATUSES = [
  MaintenanceStatus.UNMARKED,
  MaintenanceStatus.ATTENDED,
  MaintenanceStatus.MISSED,
];

/** Una fila por mantenimiento (1 a 4): su estado se guarda al tocar y debajo van sus notas. */
export const PatientMaintenanceList: React.FC<{ patient: Patient }> = ({ patient }) => {
  const { t } = useTranslation();
  const { rows, handleStatusChange, isSaving, isLoadingNotes, hasNotesError } =
    usePatientMaintenance(patient);

  const options: SegmentedOption<MaintenanceStatus>[] = MAINTENANCE_STATUSES.map((status) => ({
    value: status,
    label: t(`${TEXT.PATIENTS.FLAGS.MAINTENANCE.OPTION_PREFIX}.${status}`),
    selectedClassName: MAINTENANCE_SELECTED_STYLES[status],
  }));

  return (
    <div className="flex flex-col divide-y divide-ink-100">
      {rows.map((row) => {
        const title = t(TEXT.PATIENTS.FLAGS.MAINTENANCE.ROW_TITLE, {
          number: row.maintenanceNumber,
        });
        return (
          <div key={row.maintenanceNumber} className="flex min-w-0 flex-col gap-2 py-3">
            <Typography variant={TypographyVariant.BODY} className="font-semibold text-ink-800">
              {title}
            </Typography>
            <SegmentedControl
              options={options}
              value={row.status}
              onChange={(status) => handleStatusChange(row.maintenanceNumber, status)}
              ariaLabel={title}
              isDisabled={isSaving}
              isFullWidth
            />
            {isLoadingNotes ? (
              <Typography variant={TypographyVariant.HELPER}>
                {t(TEXT.PATIENTS.FLAGS.MAINTENANCE.NOTES_LOADING)}
              </Typography>
            ) : hasNotesError ? (
              <Typography variant={TypographyVariant.ERROR}>
                {t(TEXT.PATIENTS.FLAGS.MAINTENANCE.NOTES_ERROR)}
              </Typography>
            ) : (
              <MaintenanceNoteHistory notes={row.notes} />
            )}
            <MaintenanceNoteForm
              patientUuid={patient.uuid}
              maintenanceNumber={row.maintenanceNumber}
            />
          </div>
        );
      })}
    </div>
  );
};
