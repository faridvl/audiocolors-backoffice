import React from 'react';
import { useTranslation } from 'react-i18next';
import { tailwind } from '@/utils/tailwind-utils';
import { TEXT } from '@/static/texts/i18n';
import {
  getMaintenanceChoice,
  MAINTENANCE_NUMBERS,
  MaintenanceChoice,
  Patient,
} from '@/types/patients/patient';
import { MAINTENANCE_PILL_STYLES } from './patient-maintenance-styles';

const PILL_CLASSES =
  'inline-block w-fit whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium hover:underline';

/** Solo los mantenimientos marcados ("Mant. 2: asistido"); al tocarlos se abre el modal. */
export const PatientMaintenancePills: React.FC<{
  patient: Patient;
  onClick: () => void;
}> = ({ patient, onClick }) => {
  const { t } = useTranslation();

  return (
    <>
      {MAINTENANCE_NUMBERS.map((maintenanceNumber) => {
        const choice = getMaintenanceChoice(patient, maintenanceNumber);
        if (choice === MaintenanceChoice.UNMARKED) return null;
        return (
          <button
            key={maintenanceNumber}
            type="button"
            onClick={onClick}
            className={tailwind(PILL_CLASSES, MAINTENANCE_PILL_STYLES[choice])}
          >
            {t(`${TEXT.PATIENTS.FLAGS.MAINTENANCE.PILL_PREFIX}.${choice}`, {
              number: maintenanceNumber,
            })}
          </button>
        );
      })}
    </>
  );
};
