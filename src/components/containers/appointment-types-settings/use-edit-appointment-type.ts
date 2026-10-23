import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TEXT } from '@/static/texts/i18n';
import {
  APPOINTMENT_TYPE_DURATIONS,
  APPOINTMENT_TYPE_NAME_MAX_LENGTH,
  AppointmentType,
  UpdateAppointmentTypePayload,
} from '@/types/appointments/appointment-type';

/** Qué le pasa a la tarjeta "Controles este mes" si se guarda así. */
export enum ControlChange {
  NONE = 'NONE',
  /** Pasa a ser el control y no había otro. */
  SET = 'SET',
  /** Pasa a ser el control en lugar de otro tipo. */
  REPLACE = 'REPLACE',
  /** Deja de ser el control y no queda ninguno. */
  REMOVE = 'REMOVE',
}

export function useEditAppointmentType(
  appointmentType: AppointmentType,
  currentControl: AppointmentType | null,
  onSave: (typeUuid: string, changes: UpdateAppointmentTypePayload) => void,
) {
  const { t } = useTranslation();
  const [name, setName] = useState(appointmentType.name);
  const [duration, setDuration] = useState<number | null>(appointmentType.duration);
  const [isControl, setIsControl] = useState(appointmentType.isControl);

  const trimmedName = name.trim();
  const isDirty =
    trimmedName !== appointmentType.name ||
    duration !== appointmentType.duration ||
    isControl !== appointmentType.isControl;

  // Una duración guardada fuera de la lista (por ejemplo 20) se sigue ofreciendo.
  const durationOptions = useMemo(() => {
    const minutes = new Set(APPOINTMENT_TYPE_DURATIONS);
    if (appointmentType.duration) minutes.add(appointmentType.duration);
    return [...minutes]
      .sort((first, second) => first - second)
      .map((value) => ({
        value,
        label: t(TEXT.SETTINGS.APPOINTMENT_TYPES.MINUTES, { count: value }),
      }));
  }, [appointmentType.duration, t]);

  let controlChange = ControlChange.NONE;
  if (isControl && !appointmentType.isControl) {
    controlChange = currentControl ? ControlChange.REPLACE : ControlChange.SET;
  } else if (!isControl && appointmentType.isControl) {
    controlChange = ControlChange.REMOVE;
  }

  const handleSave = () => {
    if (!trimmedName || !isDirty) return;
    const changes: UpdateAppointmentTypePayload = {};
    if (trimmedName !== appointmentType.name) changes.name = trimmedName;
    if (duration !== appointmentType.duration) changes.duration = duration;
    if (isControl !== appointmentType.isControl) changes.isControl = isControl;
    onSave(appointmentType.uuid, changes);
  };

  return {
    name,
    duration,
    durationOptions,
    isControl,
    controlChange,
    isDirty,
    isNameMissing: !trimmedName,
    handleNameChange: (value: string) => setName(value.slice(0, APPOINTMENT_TYPE_NAME_MAX_LENGTH)),
    handleDurationChange: (value: string) => setDuration(value ? Number(value) : null),
    handleControlChange: setIsControl,
    handleSave,
  };
}
