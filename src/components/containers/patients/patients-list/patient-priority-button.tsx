import React from "react";
import { Footprints } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TEXT } from "@/static/texts/i18n";
import { Button, ButtonVariant } from "@/components/common/button/button";
import { usePatientPriority } from "@/components/containers/patients/patient-flags/use-patient-priority";
import { getFullName } from "@/shared/utils/formatters";
import { Patient } from "@/types/patients/patient";
import { tailwind } from "@/utils/tailwind-utils";

/** Marca o quita la prioridad desde la fila de la lista; no cambia el orden. */
export const PatientPriorityButton: React.FC<{ patient: Patient }> = ({
  patient,
}) => {
  const { t } = useTranslation();
  const { isOn, isUpdating, handleToggle } = usePatientPriority(patient);
  const action = t(
    isOn
      ? TEXT.PATIENTS.FLAGS.PRIORITY.UNMARK
      : TEXT.PATIENTS.FLAGS.PRIORITY.MARK,
  );

  return (
    <Button
      variant={ButtonVariant.GHOST}
      onClick={handleToggle}
      isLoading={isUpdating}
      aria-pressed={isOn}
      title={action}
      aria-label={t(TEXT.PATIENTS.FLAGS.PRIORITY.PATIENT_ACTION, {
        action,
        name: getFullName(patient.firstName, patient.lastName),
      })}
      icon={<Footprints className="h-4 w-4" aria-hidden />}
      className={tailwind(
        "px-2 py-1.5",
        isOn && "bg-danger/10 text-danger hover:bg-danger/20",
      )}
    />
  );
};
