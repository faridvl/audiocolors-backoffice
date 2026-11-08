import React from "react";
import { Checkbox } from "@/components/common/checkbox/checkbox";
import { Patient } from "@/types/patients/patient";
import { usePatientPriority } from "./use-patient-priority";

/** Prioridad se marca directo en el expediente, igual que candidato a video. */
export const PatientPriorityCheck: React.FC<{ patient: Patient }> = ({
  patient,
}) => {
  const { isOn, isUpdating, label, handleToggle } = usePatientPriority(patient);

  return (
    <Checkbox
      isChecked={isOn}
      onChange={handleToggle}
      label={label}
      isLoading={isUpdating}
    />
  );
};
