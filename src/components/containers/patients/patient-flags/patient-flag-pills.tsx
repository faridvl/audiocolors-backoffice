import React from 'react';
import { useTranslation } from 'react-i18next';
import { tailwind } from '@/utils/tailwind-utils';
import { TEXT } from '@/static/texts/i18n';
import { EMPTY_VALUE } from '@/shared/utils/formatters';
import { Patient, PATIENT_FLAG_SINCE_FIELDS, PatientFlag } from '@/types/patients/patient';

const FLAG_TONES: Record<PatientFlag, string> = {
  [PatientFlag.HEARING_AIDS_IN_LAB]: 'bg-info/10 text-info',
  [PatientFlag.ACTIVE_WARRANTY]: 'bg-success/10 text-success',
  [PatientFlag.VIDEO_CANDIDATE]: 'bg-brand-50 text-brand-700',
};

const OFF_TONE = 'bg-ink-100 text-ink-500';

/**
 * Indicadores que también se nombran apagados ("Sin garantía"): saber que no
 * tiene garantía importa; que los audífonos no estén en laboratorio es lo normal.
 */
const FLAGS_SHOWN_WHEN_OFF: PatientFlag[] = [PatientFlag.ACTIVE_WARRANTY];

const PILL_CLASSES =
  'inline-block w-fit whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium';

const isFlagOn = (patient: Patient, flag: PatientFlag) =>
  Boolean(patient[PATIENT_FLAG_SINCE_FIELDS[flag]]);

/**
 * Etiquetas de los indicadores junto al estado del paciente. Con `onClick`
 * (en el expediente) son botones que abren el modal para cambiarlos.
 */
export const PatientFlagPills: React.FC<{
  patient: Patient;
  /** Qué indicadores mostrar; por defecto todos. */
  flags?: PatientFlag[];
  onClick?: () => void;
}> = ({ patient, flags = Object.values(PatientFlag), onClick }) => {
  const { t } = useTranslation();

  return (
    <>
      {flags
        .filter((flag) => isFlagOn(patient, flag) || FLAGS_SHOWN_WHEN_OFF.includes(flag))
        .map((flag) => {
          const isOn = isFlagOn(patient, flag);
          const label = isOn
            ? t(`${TEXT.PATIENTS.FLAGS.LABEL_PREFIX}.${flag}`)
            : t(`${TEXT.PATIENTS.FLAGS.OFF_PREFIX}.${flag}`);
          const className = tailwind(PILL_CLASSES, isOn ? FLAG_TONES[flag] : OFF_TONE);
          return onClick ? (
            <button
              key={flag}
              type="button"
              onClick={onClick}
              className={tailwind(className, 'hover:underline')}
            >
              {label}
            </button>
          ) : (
            <span key={flag} className={className}>
              {label}
            </span>
          );
        })}
    </>
  );
};

/** Celda de la lista: el valor con su color; apagado, "—" o su texto ("Sin garantía"). */
export const PatientFlagValue: React.FC<{ patient: Patient; flag: PatientFlag }> = ({
  patient,
  flag,
}) => {
  const { t } = useTranslation();

  if (!isFlagOn(patient, flag)) {
    if (!FLAGS_SHOWN_WHEN_OFF.includes(flag)) return <>{EMPTY_VALUE}</>;
    return (
      <span className={tailwind(PILL_CLASSES, OFF_TONE)}>
        {t(`${TEXT.PATIENTS.FLAGS.OFF_PREFIX}.${flag}`)}
      </span>
    );
  }

  return (
    <span className={tailwind(PILL_CLASSES, FLAG_TONES[flag])}>
      {t(`${TEXT.PATIENTS.FLAGS.VALUE_PREFIX}.${flag}`)}
    </span>
  );
};
