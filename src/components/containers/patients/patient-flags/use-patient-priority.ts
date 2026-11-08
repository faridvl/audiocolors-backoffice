import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useUpdatePatientFlagMutation } from "@/shared/api/mutations/patients/update-patient-flag-mutation";
import { FETCH_PATIENT_KEY } from "@/shared/api/querys/get-patient-query";
import { FETCH_PATIENTS_KEY } from "@/shared/api/querys/patients-query";
import { FETCH_PATIENT_ACTIVITY_KEY } from "@/shared/api/querys/patient-activity-query";
import { TEXT } from "@/static/texts/i18n";
import { Patient, PatientFlag } from "@/types/patients/patient";

const FLAG = PatientFlag.PRIORITY;

/**
 * Prioridad del paciente, sin el resto de `usePatientFlags` (que consulta los envíos a
 * laboratorio): sirve igual en cada fila de la lista y en el expediente.
 */
export function usePatientPriority(patient: Patient) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { executeUpdatePatientFlag } = useUpdatePatientFlagMutation();
  const [isUpdating, setIsUpdating] = useState(false);
  const isOn = Boolean(patient.prioritySince);

  const handleToggle = () => {
    const nextIsOn = !isOn;
    setIsUpdating(true);
    executeUpdatePatientFlag(
      { patientUuid: patient.uuid, flag: FLAG, isOn: nextIsOn },
      {
        onSuccess: (updated) => {
          queryClient.setQueryData(
            [FETCH_PATIENT_KEY, patient.uuid],
            (previous?: Patient) =>
              previous
                ? { ...previous, prioritySince: updated.prioritySince ?? null }
                : previous,
          );
          void queryClient.invalidateQueries({
            queryKey: [FETCH_PATIENTS_KEY],
          });
          void queryClient.invalidateQueries({
            queryKey: [FETCH_PATIENT_ACTIVITY_KEY],
          });
          const prefix = nextIsOn
            ? TEXT.PATIENTS.FLAGS.TOAST_ON_PREFIX
            : TEXT.PATIENTS.FLAGS.TOAST_OFF_PREFIX;
          toast.success(t(`${prefix}.${FLAG}`));
        },
        onError: (error: Error) => toast.error(error.message),
        onSettled: () => setIsUpdating(false),
      },
    );
  };

  return {
    isOn,
    isUpdating,
    label: t(`${TEXT.PATIENTS.FLAGS.LABEL_PREFIX}.${FLAG}`),
    handleToggle,
  };
}
