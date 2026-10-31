import React from 'react';
import { useTranslation } from 'react-i18next';
import { TEXT } from '@/static/texts/i18n';
import { Patient } from '@/types/patients/patient';

/** Solo aparece con intentos registrados ("Contacto: 2"); al tocarla se abre el modal. */
export const PatientContactAttemptsPill: React.FC<{
  patient: Patient;
  onClick: () => void;
}> = ({ patient, onClick }) => {
  const { t } = useTranslation();
  const count = patient.contactAttempts ?? 0;
  if (count === 0) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-block w-fit whitespace-nowrap rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700 hover:underline"
    >
      {t(TEXT.PATIENTS.FLAGS.CONTACT.PILL, { count })}
    </button>
  );
};
