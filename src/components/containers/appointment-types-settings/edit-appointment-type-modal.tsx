import React from 'react';
import { CalendarClock, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { inputBaseClasses } from '@/components/common/input/input';
import { Switch } from '@/components/common/switch/switch';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { useEscapeKey } from '@/hooks/use-escape-key';
import { TEXT } from '@/static/texts/i18n';
import {
  APPOINTMENT_TYPE_NAME_MAX_LENGTH,
  AppointmentType,
  CreateAppointmentTypePayload,
  UpdateAppointmentTypePayload,
} from '@/types/appointments/appointment-type';
import { ControlChange, useEditAppointmentType } from './use-edit-appointment-type';

interface EditAppointmentTypeModalProps {
  /** Sin tipo, la ventana crea uno nuevo. */
  appointmentType: AppointmentType | null;
  currentControl: AppointmentType | null;
  /** Nombres de los demás tipos, para avisar de un duplicado. */
  existingNames: string[];
  isSaving: boolean;
  onSave: (typeUuid: string, changes: UpdateAppointmentTypePayload) => void;
  onCreate: (payload: CreateAppointmentTypePayload) => void;
  onClose: () => void;
}

const NAME_ID = 'appointment-type-name';
const DURATION_ID = 'appointment-type-duration';
const DUPLICATE_ID = 'appointment-type-duplicate';

export const EditAppointmentTypeModal: React.FC<EditAppointmentTypeModalProps> = ({
  appointmentType,
  currentControl,
  existingNames,
  isSaving,
  onSave,
  onCreate,
  onClose,
}) => {
  const { t } = useTranslation();
  useEscapeKey(onClose);
  const {
    name,
    duration,
    durationOptions,
    isControl,
    controlChange,
    isDirty,
    isNameMissing,
    isDuplicateName,
    isNew,
    handleNameChange,
    handleDurationChange,
    handleControlChange,
    handleSave,
  } = useEditAppointmentType(appointmentType, currentControl, existingNames, onSave, onCreate);
  const title = t(
    isNew ? TEXT.SETTINGS.APPOINTMENT_TYPES.NEW_TITLE : TEXT.SETTINGS.APPOINTMENT_TYPES.EDIT_TITLE,
  );

  const controlNotice = {
    [ControlChange.NONE]: null,
    [ControlChange.SET]: t(TEXT.SETTINGS.APPOINTMENT_TYPES.CONTROL_SET, {
      name: name.trim() || (appointmentType?.name ?? ''),
    }),
    [ControlChange.REPLACE]: t(TEXT.SETTINGS.APPOINTMENT_TYPES.CONTROL_REPLACE, {
      name: name.trim() || (appointmentType?.name ?? ''),
      previous: currentControl?.name ?? '',
    }),
    [ControlChange.REMOVE]: t(TEXT.SETTINGS.APPOINTMENT_TYPES.CONTROL_REMOVE),
  }[controlChange];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      // En el celular sube desde abajo, como las demás ventanas.
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/70 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-card bg-white p-5 sm:rounded-card sm:p-6"
        style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10">
            <CalendarClock className="h-5 w-5 text-brand-700" aria-hidden />
          </span>
          <Typography variant={TypographyVariant.ACCENT}>{title}</Typography>
        </div>

        <div className="mt-5 flex flex-col gap-4">
          <label htmlFor={NAME_ID} className="flex flex-col gap-1.5">
            <Typography variant={TypographyVariant.BODY}>
              {t(TEXT.SETTINGS.APPOINTMENT_TYPES.NAME)}
            </Typography>
            <input
              id={NAME_ID}
              value={name}
              onChange={(event) => handleNameChange(event.target.value)}
              maxLength={APPOINTMENT_TYPE_NAME_MAX_LENGTH}
              aria-invalid={isDuplicateName}
              aria-describedby={isDuplicateName ? DUPLICATE_ID : undefined}
              className={inputBaseClasses}
            />
            {isDuplicateName && (
              <Typography
                id={DUPLICATE_ID}
                variant={TypographyVariant.HELPER}
                className="text-danger-700"
              >
                {t(TEXT.SETTINGS.APPOINTMENT_TYPES.DUPLICATE_NAME)}
              </Typography>
            )}
          </label>

          <label htmlFor={DURATION_ID} className="flex flex-col gap-1.5">
            <Typography variant={TypographyVariant.BODY}>
              {t(TEXT.SETTINGS.APPOINTMENT_TYPES.DURATION)}
            </Typography>
            <select
              id={DURATION_ID}
              value={duration ?? ''}
              onChange={(event) => handleDurationChange(event.target.value)}
              className={inputBaseClasses}
            >
              {duration === null && (
                <option value="">{t(TEXT.SETTINGS.APPOINTMENT_TYPES.NO_DURATION)}</option>
              )}
              {durationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="border-t border-ink-100 pt-3">
            <Switch
              isChecked={isControl}
              onChange={handleControlChange}
              label={t(TEXT.SETTINGS.APPOINTMENT_TYPES.IS_CONTROL)}
              description={t(TEXT.SETTINGS.APPOINTMENT_TYPES.IS_CONTROL_HINT)}
            />
            {controlNotice && (
              <div className="mt-2 flex items-start gap-2 rounded-lg bg-brand-50 px-3 py-2">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" aria-hidden />
                <Typography variant={TypographyVariant.HELPER} className="text-brand-800">
                  {controlNotice}
                </Typography>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant={ButtonVariant.SECONDARY}
            onClick={onClose}
            disabled={isSaving}
          >
            {t(TEXT.GENERAL.BUTTONS.CANCEL)}
          </Button>
          <Button
            type="button"
            variant={ButtonVariant.PRIMARY}
            onClick={handleSave}
            disabled={!isDirty || isNameMissing || isDuplicateName}
            isLoading={isSaving}
          >
            {t(TEXT.GENERAL.BUTTONS.SAVE)}
          </Button>
        </div>
      </div>
    </div>
  );
};
