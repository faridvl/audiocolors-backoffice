import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  SegmentedControl,
  SegmentedOption,
} from '@/components/common/segmented-control/segmented-control';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { MaintenanceChoice, Patient } from '@/types/patients/patient';
import { MAINTENANCE_SELECTED_STYLES } from './patient-maintenance-styles';
import { usePatientMaintenance } from './use-patient-maintenance';

const MAINTENANCE_CHOICES = [
  MaintenanceChoice.UNMARKED,
  MaintenanceChoice.ATTENDED,
  MaintenanceChoice.MISSED,
];

/** Una fila por mantenimiento (1 a 4) con sus tres opciones; guarda al tocar. */
export const PatientMaintenanceList: React.FC<{ patient: Patient }> = ({ patient }) => {
  const { t } = useTranslation();
  const { rows, handleChange, isSaving } = usePatientMaintenance(patient);

  const options: SegmentedOption<MaintenanceChoice>[] = MAINTENANCE_CHOICES.map((choice) => ({
    value: choice,
    label: t(`${TEXT.PATIENTS.FLAGS.MAINTENANCE.OPTION_PREFIX}.${choice}`),
    selectedClassName: MAINTENANCE_SELECTED_STYLES[choice],
  }));

  return (
    <div className="flex flex-col divide-y divide-ink-100">
      {rows.map((row) => {
        const title = t(TEXT.PATIENTS.FLAGS.MAINTENANCE.ROW_TITLE, {
          number: row.maintenanceNumber,
        });
        return (
          <div key={row.maintenanceNumber} className="flex flex-col gap-2 py-3">
            <Typography variant={TypographyVariant.BODY} className="font-semibold text-ink-800">
              {title}
            </Typography>
            <SegmentedControl
              options={options}
              value={row.choice}
              onChange={(choice) => handleChange(row.maintenanceNumber, choice)}
              ariaLabel={title}
              isDisabled={isSaving}
              isFullWidth
            />
          </div>
        );
      })}
    </div>
  );
};
