import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { MAX_CONTACT_ATTEMPTS, Patient } from '@/types/patients/patient';
import { usePatientContactAttempts } from './use-patient-contact-attempts';

/** Cuántas veces se llamó al paciente: "Registrar intento" suma uno y "Reiniciar" vuelve a 0. */
export const PatientContactAttempts: React.FC<{ patient: Patient }> = ({ patient }) => {
  const { t } = useTranslation();
  const { count, handleRegister, handleReset, isRegisterDisabled, isResetDisabled, isSaving } =
    usePatientContactAttempts(patient);

  return (
    <div className="flex flex-col gap-3 py-3">
      <div>
        <Typography variant={TypographyVariant.BODY} className="font-semibold text-ink-800">
          {t(TEXT.PATIENTS.FLAGS.CONTACT.TITLE)}
        </Typography>
        <Typography variant={TypographyVariant.ACCENT} className="mt-1">
          {count === 0
            ? t(TEXT.PATIENTS.FLAGS.CONTACT.NONE)
            : t(TEXT.PATIENTS.FLAGS.CONTACT.VALUE, {
                count,
                max: MAX_CONTACT_ATTEMPTS,
              })}
        </Typography>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          onClick={handleRegister}
          disabled={isRegisterDisabled}
          isLoading={isSaving}
          className="w-full sm:w-auto"
        >
          {t(TEXT.PATIENTS.FLAGS.CONTACT.REGISTER)}
        </Button>
        <Button
          variant={ButtonVariant.SECONDARY}
          onClick={handleReset}
          disabled={isResetDisabled}
          className="w-full sm:w-auto"
        >
          {t(TEXT.PATIENTS.FLAGS.CONTACT.RESET)}
        </Button>
      </div>
    </div>
  );
};
