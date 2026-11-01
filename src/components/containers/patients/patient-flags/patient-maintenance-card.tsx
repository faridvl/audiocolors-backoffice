import React from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox } from '@/components/common/checkbox/checkbox';
import { inputBaseClasses } from '@/components/common/input/input';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { MAINTENANCE_NOTE_MAX_LENGTH, MaintenanceNumber, Patient } from '@/types/patients/patient';
import { tailwind } from '@/utils/tailwind-utils';
import { usePatientMaintenance } from './use-patient-maintenance';

/** Desde cuántos caracteres se muestra el contador aunque el campo no tenga el foco. */
const COUNTER_VISIBLE_FROM = 400;

/** Un mantenimiento: su check (guarda al tocarlo) y su nota opcional (guarda al salir del campo). */
export const PatientMaintenanceCard: React.FC<{
  patient: Patient;
  maintenanceNumber: MaintenanceNumber;
}> = ({ patient, maintenanceNumber }) => {
  const { t } = useTranslation();
  const {
    isDone,
    note,
    noteRef,
    isSavingDone,
    isSavingNote,
    isDoneSaved,
    isNoteSaved,
    isNoteFocused,
    hasNoteError,
    handleDoneChange,
    handleNoteChange,
    handleNoteFocus,
    handleNoteBlur,
  } = usePatientMaintenance(patient, maintenanceNumber);
  const noteId = `maintenance-note-${maintenanceNumber}`;
  const showCounter = isNoteFocused || note.length >= COUNTER_VISIBLE_FROM;

  return (
    <div className="flex min-w-0 flex-col gap-2 rounded-lg border border-ink-200 p-3">
      <Typography variant={TypographyVariant.BODY_SEMIBOLD}>
        {t(TEXT.PATIENTS.FLAGS.MAINTENANCE.ROW_TITLE, {
          number: maintenanceNumber,
        })}
      </Typography>
      <div className="flex items-center justify-between gap-2">
        <Checkbox
          isChecked={isDone}
          onChange={handleDoneChange}
          label={t(TEXT.PATIENTS.FLAGS.MAINTENANCE.DONE)}
          isLoading={isSavingDone}
          className="min-h-[44px]"
        />
        <div aria-live="polite">
          {isDoneSaved && (
            <Typography variant={TypographyVariant.HELPER}>
              {t(TEXT.PATIENTS.FLAGS.MAINTENANCE.SAVED)}
            </Typography>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={noteId}>
          <Typography variant={TypographyVariant.HELPER} as="span">
            {t(TEXT.PATIENTS.FLAGS.MAINTENANCE.NOTE_LABEL)}
          </Typography>
        </label>
        <textarea
          id={noteId}
          ref={noteRef}
          value={note}
          onChange={(event) => handleNoteChange(event.target.value)}
          onFocus={handleNoteFocus}
          onBlur={handleNoteBlur}
          maxLength={MAINTENANCE_NOTE_MAX_LENGTH}
          rows={3}
          aria-invalid={hasNoteError}
          className={tailwind(
            inputBaseClasses,
            'resize-none',
            hasNoteError && 'border-danger focus:border-danger focus:ring-danger/20',
          )}
        />
        <div className="flex items-start justify-between gap-2">
          <div aria-live="polite">
            {hasNoteError ? (
              <Typography variant={TypographyVariant.ERROR}>
                {t(TEXT.PATIENTS.FLAGS.MAINTENANCE.NOTE_ERROR)}
              </Typography>
            ) : isSavingNote ? (
              <Typography variant={TypographyVariant.HELPER}>
                {t(TEXT.PATIENTS.FLAGS.MAINTENANCE.SAVING)}
              </Typography>
            ) : (
              isNoteSaved && (
                <Typography variant={TypographyVariant.HELPER}>
                  {t(TEXT.PATIENTS.FLAGS.MAINTENANCE.SAVED)}
                </Typography>
              )
            )}
          </div>
          {showCounter && (
            <Typography variant={TypographyVariant.HELPER} className="shrink-0">
              {t(TEXT.GENERAL.CHARACTER_COUNT, {
                count: note.length,
                max: MAINTENANCE_NOTE_MAX_LENGTH,
              })}
            </Typography>
          )}
        </div>
      </div>
    </div>
  );
};
