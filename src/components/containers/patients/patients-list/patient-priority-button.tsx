import React from "react";
import { Flag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TEXT } from "@/static/texts/i18n";
import { Button, ButtonVariant } from "@/components/common/button/button";
import { usePatientPriority } from "@/components/containers/patients/patient-flags/use-patient-priority";
import { getFullName } from "@/shared/utils/formatters";
import { Patient } from "@/types/patients/patient";
import { tailwind } from "@/utils/tailwind-utils";

/** Marca o quita la prioridad desde la lista o el expediente; no cambia el orden. */
export const PatientPriorityButton: React.FC<{ patient: Patient; className?: string }> = ({
  patient,
  className,
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
      icon={
        <Flag
          className={tailwind("h-4 w-4", isOn && "fill-current")}
          aria-hidden
        />
      }
      className={tailwind(
        "min-h-[44px] min-w-[44px] px-2 py-1.5 sm:min-h-0 sm:min-w-0",
        isOn ? "bg-danger/10 text-danger hover:bg-danger/20" : "text-ink-500",
        className,
      )}
    />
  );
};
