import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useUpdatePatientFlagMutation } from '@/shared/api/mutations/patients/update-patient-flag-mutation';
import { FETCH_PATIENT_KEY } from '@/shared/api/querys/get-patient-query';
import { FETCH_PATIENTS_KEY } from '@/shared/api/querys/patients-query';
import { FETCH_PATIENT_ACTIVITY_KEY } from '@/shared/api/querys/patient-activity-query';
import { TEXT } from '@/static/texts/i18n';
import { Patient, PATIENT_FLAG_SINCE_FIELDS, PatientFlag } from '@/types/patients/patient';

export interface PatientFlagItem {
  flag: PatientFlag;
  label: string;
  isOn: boolean;
  isUpdating: boolean;
}

/** Secciones del modal de indicadores. Candidato a video va aparte, como casilla en el expediente. */
export enum PatientFlagSection {
  LAB = 'lab',
  WARRANTY = 'warranty',
}

const SECTION_FLAGS: Record<PatientFlagSection, PatientFlag[]> = {
  [PatientFlagSection.LAB]: [PatientFlag.HEARING_AIDS_IN_LAB],
  [PatientFlagSection.WARRANTY]: [
    PatientFlag.ACTIVE_WARRANTY,
    PatientFlag.WARRANTY_EXPIRED,
    PatientFlag.RENEW_PRESCRIPTION,
  ],
};

export function usePatientFlags(patient: Patient) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { executeUpdatePatientFlag } = useUpdatePatientFlagMutation();
  const [updatingFlag, setUpdatingFlag] = useState<PatientFlag | null>(null);
  const [activeSection, setActiveSection] = useState(PatientFlagSection.LAB);

  // El API guarda desde cuándo está prendido, pero solo importa si lo está.
  const buildItem = (flag: PatientFlag): PatientFlagItem => ({
    flag,
    label: t(`${TEXT.PATIENTS.FLAGS.LABEL_PREFIX}.${flag}`),
    isOn: Boolean(patient[PATIENT_FLAG_SINCE_FIELDS[flag]]),
    isUpdating: updatingFlag === flag,
  });

  const sections = Object.values(PatientFlagSection).map((section) => ({
    key: section,
    title: t(`${TEXT.PATIENTS.FLAGS.SECTION_PREFIX}.${section}`),
    flags: SECTION_FLAGS[section].map(buildItem),
  }));
  const videoCandidate = buildItem(PatientFlag.VIDEO_CANDIDATE);

  const handleToggle = (flag: PatientFlag, isOn: boolean) => {
    setUpdatingFlag(flag);
    executeUpdatePatientFlag(
      { patientUuid: patient.uuid, flag, isOn },
      {
        onSuccess: (updated) => {
          const field = PATIENT_FLAG_SINCE_FIELDS[flag];
          queryClient.setQueryData([FETCH_PATIENT_KEY, patient.uuid], (previous?: Patient) =>
            previous ? { ...previous, [field]: updated[field] ?? null } : previous,
          );
          void queryClient.invalidateQueries({ queryKey: [FETCH_PATIENTS_KEY] });
          void queryClient.invalidateQueries({ queryKey: [FETCH_PATIENT_ACTIVITY_KEY] });
          const prefix = isOn
            ? TEXT.PATIENTS.FLAGS.TOAST_ON_PREFIX
            : TEXT.PATIENTS.FLAGS.TOAST_OFF_PREFIX;
          toast.success(t(`${prefix}.${flag}`));
        },
        onError: (error: Error) => toast.error(error.message),
        onSettled: () => setUpdatingFlag(null),
      },
    );
  };

  return {
    sections,
    activeSection,
    activeFlags: sections.find((section) => section.key === activeSection)?.flags ?? [],
    videoCandidate,
    handleToggle,
    isWarrantySection: activeSection === PatientFlagSection.WARRANTY,
    handleSectionChange: setActiveSection,
  };
}
