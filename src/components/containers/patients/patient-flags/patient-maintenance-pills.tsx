import React from 'react';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TEXT } from '@/static/texts/i18n';
import { isMaintenanceDone, MAINTENANCE_NUMBERS, Patient } from '@/types/patients/patient';

/** Solo los mantenimientos hechos ("Mant. 2" con check); al tocarlos se abre el modal. */
export const PatientMaintenancePills: React.FC<{
  patient: Patient;
  onClick: () => void;
}> = ({ patient, onClick }) => {
  const { t } = useTranslation();

  return (
    <>
      {MAINTENANCE_NUMBERS.filter((maintenanceNumber) =>
        isMaintenanceDone(patient, maintenanceNumber),
      ).map((maintenanceNumber) => (
        <button
          key={maintenanceNumber}
          type="button"
          onClick={onClick}
          className="inline-flex w-fit items-center gap-1 whitespace-nowrap rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700 hover:underline"
        >
          <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
          {t(TEXT.PATIENTS.FLAGS.MAINTENANCE.PILL, { number: maintenanceNumber })}
        </button>
      ))}
    </>
  );
};
