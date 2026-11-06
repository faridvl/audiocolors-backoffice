import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { MAINTENANCE_NOTE_MAX_LENGTH, MaintenanceNumber } from '@/types/patients/patient';
import { tailwind } from '@/utils/tailwind-utils';
import { useMaintenanceNoteForm } from './use-maintenance-note-form';

/** Desde cuántos caracteres aparece el contador. */
const NOTE_COUNTER_THRESHOLD = 400;

/** Una línea para escribir, sin marco, con Guardar al lado; cada nota guardada queda en el historial. */
export const MaintenanceNoteForm: React.FC<{
  patientUuid: string;
  maintenanceNumber: MaintenanceNumber;
}> = ({ patientUuid, maintenanceNumber }) => {
  const { t } = useTranslation();
  const { draft, fieldRef, hasError, isSaving, canSave, handleChange, handleKeyDown, handleSave } =
    useMaintenanceNoteForm(patientUuid, maintenanceNumber);
  const placeholder = t(TEXT.PATIENTS.FLAGS.MAINTENANCE.NOTE_PLACEHOLDER);
  const showCounter = draft.length > NOTE_COUNTER_THRESHOLD;

  return (
    <div className="flex min-w-0 flex-col">
      <div className="flex items-center gap-1 border-t border-ink-100">
        <textarea
          id={`maintenance-note-${maintenanceNumber}`}
          ref={fieldRef}
          value={draft}
          onChange={(event) => handleChange(event.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={MAINTENANCE_NOTE_MAX_LENGTH}
          rows={1}
          placeholder={placeholder}
          aria-label={placeholder}
          readOnly={isSaving}
          aria-invalid={hasError}
          className={tailwind(
            'min-w-0 flex-1 resize-none border-0 bg-transparent px-0 py-2.5 text-base text-ink-800 placeholder:text-ink-400 focus:outline-none focus:ring-0',
            hasError && 'text-danger-700',
          )}
        />
        <Button
          variant={ButtonVariant.GHOST}
          onClick={handleSave}
          isLoading={isSaving}
          disabled={!canSave}
          className="shrink-0 px-2 text-brand-700"
        >
          {t(TEXT.PATIENTS.FLAGS.MAINTENANCE.SAVE)}
        </Button>
      </div>
      <div aria-live="polite">
        {hasError && (
          <Typography variant={TypographyVariant.ERROR}>
            {t(TEXT.PATIENTS.FLAGS.MAINTENANCE.NOTE_ERROR)}
          </Typography>
        )}
      </div>
      {showCounter && (
        <Typography variant={TypographyVariant.HELPER} className="text-right">
          {t(TEXT.GENERAL.CHARACTER_COUNT, {
            count: draft.length,
            max: MAINTENANCE_NOTE_MAX_LENGTH,
          })}
        </Typography>
      )}
    </div>
  );
};
