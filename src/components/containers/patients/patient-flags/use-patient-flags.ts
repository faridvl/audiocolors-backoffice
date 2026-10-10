import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useUpdatePatientFlagMutation } from '@/shared/api/mutations/patients/update-patient-flag-mutation';
import { FETCH_PATIENT_KEY } from '@/shared/api/querys/get-patient-query';
import { FETCH_PATIENTS_KEY } from '@/shared/api/querys/patients-query';
import { FETCH_PATIENT_ACTIVITY_KEY } from '@/shared/api/querys/patient-activity-query';
import { formatDate } from '@/shared/utils/formatters';
import { TEXT } from '@/static/texts/i18n';
import { Patient, PATIENT_FLAG_SINCE_FIELDS, PatientFlag } from '@/types/patients/patient';

export interface PatientFlagItem {
  flag: PatientFlag;
  label: string;
  isOn: boolean;
  sinceLabel?: string;
  isUpdating: boolean;
}

export function usePatientFlags(patient: Patient) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { executeUpdatePatientFlag } = useUpdatePatientFlagMutation();
  const [updatingFlag, setUpdatingFlag] = useState<PatientFlag | null>(null);

  const flags: PatientFlagItem[] = Object.values(PatientFlag).map((flag) => {
    const since = patient[PATIENT_FLAG_SINCE_FIELDS[flag]] ?? null;
    return {
      flag,
      label: t(`${TEXT.PATIENTS.FLAGS.LABEL_PREFIX}.${flag}`),
      isOn: since !== null,
      sinceLabel: since ? t(TEXT.PATIENTS.FLAGS.SINCE, { date: formatDate(since) }) : undefined,
      isUpdating: updatingFlag === flag,
    };
  });

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

  return { flags, handleToggle };
}
