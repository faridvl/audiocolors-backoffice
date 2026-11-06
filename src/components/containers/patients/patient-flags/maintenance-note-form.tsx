import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/common/button/button";
import { inputBaseClasses } from "@/components/common/input/input";
import {
  Typography,
  TypographyVariant,
} from "@/components/common/typography/typography";
import { TEXT } from "@/static/texts/i18n";
import {
  MAINTENANCE_NOTE_MAX_LENGTH,
  MaintenanceNumber,
} from "@/types/patients/patient";
import { tailwind } from "@/utils/tailwind-utils";
import { useMaintenanceNoteForm } from "./use-maintenance-note-form";

/** Campo con contador y Guardar; cada nota guardada queda en el historial. */
export const MaintenanceNoteForm: React.FC<{
  patientUuid: string;
  maintenanceNumber: MaintenanceNumber;
}> = ({ patientUuid, maintenanceNumber }) => {
  const { t } = useTranslation();
  const {
    draft,
    fieldRef,
    hasError,
    isSaving,
    canSave,
    handleChange,
    handleSave,
  } = useMaintenanceNoteForm(patientUuid, maintenanceNumber);
  const fieldId = `maintenance-note-${maintenanceNumber}`;

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label htmlFor={fieldId}>
        <Typography variant={TypographyVariant.HELPER} as="span">
          {t(TEXT.PATIENTS.FLAGS.MAINTENANCE.NOTE_LABEL)}
        </Typography>
      </label>
      <textarea
        id={fieldId}
        ref={fieldRef}
        value={draft}
        onChange={(event) => handleChange(event.target.value)}
        maxLength={MAINTENANCE_NOTE_MAX_LENGTH}
        rows={3}
        disabled={isSaving}
        aria-invalid={hasError}
        className={tailwind(
          inputBaseClasses,
          "resize-none",
          hasError && "border-danger focus:border-danger focus:ring-danger/20",
        )}
      />
      <div className="flex items-start justify-between gap-2">
        <div aria-live="polite">
          {hasError && (
            <Typography variant={TypographyVariant.ERROR}>
              {t(TEXT.PATIENTS.FLAGS.MAINTENANCE.NOTE_ERROR)}
            </Typography>
          )}
        </div>
        <Typography variant={TypographyVariant.HELPER} className="shrink-0">
          {t(TEXT.GENERAL.CHARACTER_COUNT, {
            count: draft.length,
            max: MAINTENANCE_NOTE_MAX_LENGTH,
          })}
        </Typography>
      </div>
      <div className="flex justify-end gap-2">
        <Button onClick={handleSave} isLoading={isSaving} disabled={!canSave}>
          {t(TEXT.PATIENTS.FLAGS.MAINTENANCE.SAVE)}
        </Button>
      </div>
    </div>
  );
};
