import React from 'react';
import { Wrench } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TEXT } from '@/static/texts/i18n';
import { isMaintenanceDone, MAINTENANCE_NUMBERS, Patient } from '@/types/patients/patient';

/** Una sola píldora con el avance ("Mantenimientos 2 de 4", también en 0); al tocarla se abre el modal. */
export const PatientMaintenancePills: React.FC<{
  patient: Patient;
  onClick: () => void;
}> = ({ patient, onClick }) => {
  const { t } = useTranslation();
  const doneCount = MAINTENANCE_NUMBERS.filter((maintenanceNumber) =>
    isMaintenanceDone(patient, maintenanceNumber),
  ).length;

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex w-fit items-center gap-1 whitespace-nowrap rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700 hover:underline"
    >
      <Wrench className="h-3 w-3" aria-hidden />
      {t(TEXT.PATIENTS.FLAGS.MAINTENANCE.PILL, {
        count: doneCount,
        total: MAINTENANCE_NUMBERS.length,
      })}
    </button>
  );
};
