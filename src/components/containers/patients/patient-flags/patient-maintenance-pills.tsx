import React from 'react';
import { useTranslation } from 'react-i18next';
import { TEXT } from '@/static/texts/i18n';
import {
  getMaintenanceStatus,
  MAINTENANCE_NUMBERS,
  MaintenanceStatus,
  Patient,
} from '@/types/patients/patient';
import { tailwind } from '@/utils/tailwind-utils';
import { MAINTENANCE_PILL_STYLES } from './patient-maintenance-styles';

const PILL_CLASSES =
  'inline-block w-fit whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium hover:underline';

/** Una píldora por mantenimiento marcado: azul si asistió, roja si lo perdió; abre el modal. */
export const PatientMaintenancePills: React.FC<{
  patient: Patient;
  onClick: () => void;
}> = ({ patient, onClick }) => {
  const { t } = useTranslation();

  return (
    <>
      {MAINTENANCE_NUMBERS.map((maintenanceNumber) => {
        const status = getMaintenanceStatus(patient, maintenanceNumber);
        if (status === MaintenanceStatus.UNMARKED) return null;
        return (
          <button
            key={maintenanceNumber}
            type="button"
            onClick={onClick}
            aria-label={t(`${TEXT.PATIENTS.FLAGS.MAINTENANCE.PILL_LABEL_PREFIX}.${status}`, {
              number: maintenanceNumber,
            })}
            className={tailwind(PILL_CLASSES, MAINTENANCE_PILL_STYLES[status])}
          >
            {t(TEXT.PATIENTS.FLAGS.MAINTENANCE.PILL, { number: maintenanceNumber })}
          </button>
        );
      })}
    </>
  );
};
