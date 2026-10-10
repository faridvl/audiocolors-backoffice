import React from 'react';
import { useTranslation } from 'react-i18next';
import { Ear } from 'lucide-react';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Switch } from '@/components/common/switch/switch';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { useEscapeKey } from '@/hooks/use-escape-key';
import { TEXT } from '@/static/texts/i18n';
import { Patient } from '@/types/patients/patient';
import { usePatientFlags } from './use-patient-flags';

interface PatientFlagsModalProps {
  patient: Patient;
  onClose: () => void;
}

/** Prender o apagar los indicadores: cada switch guarda al tocarlo, sin botón de guardar. */
export const PatientFlagsModal: React.FC<PatientFlagsModalProps> = ({ patient, onClose }) => {
  const { t } = useTranslation();
  const { flags, handleToggle } = usePatientFlags(patient);
  useEscapeKey(onClose);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t(TEXT.PATIENTS.FLAGS.TITLE)}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-card bg-white p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10">
            <Ear className="h-5 w-5 text-brand-700" aria-hidden />
          </span>
          <div className="min-w-0">
            <Typography variant={TypographyVariant.ACCENT}>
              {t(TEXT.PATIENTS.FLAGS.TITLE)}
            </Typography>
            <Typography variant={TypographyVariant.BODY} className="mt-1">
              {t(TEXT.PATIENTS.FLAGS.DESCRIPTION)}
            </Typography>
          </div>
        </div>

        <div className="mt-5 flex flex-col divide-y divide-ink-100 rounded-lg border border-ink-200 px-3">
          {flags.map((item) => (
            <Switch
              key={item.flag}
              isChecked={item.isOn}
              onChange={(isOn) => handleToggle(item.flag, isOn)}
              label={item.label}
              description={item.sinceLabel}
              isLoading={item.isUpdating}
              className="w-full py-2"
            />
          ))}
        </div>

        <div className="mt-5 flex justify-end">
          <Button variant={ButtonVariant.SECONDARY} onClick={onClose} className="w-full sm:w-auto">
            {t(TEXT.PATIENTS.FLAGS.DONE)}
          </Button>
        </div>
      </div>
    </div>
  );
};
