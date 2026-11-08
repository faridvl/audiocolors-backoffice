export interface AppointmentType {
  uuid: string;
  name: string;
  duration: number | null;
  color: string | null;
  speciality: string | null;
  /** El tipo que cuenta en "Controles este mes". Uno por clínica como máximo. */
  isControl: boolean;
}

export type UpdateAppointmentTypePayload = Partial<
  Pick<AppointmentType, 'name' | 'duration' | 'isControl'>
>;

/** Un tipo nuevo: nombre y duración; los demás campos los decide el API. */
export type CreateAppointmentTypePayload = Pick<AppointmentType, 'name' | 'duration' | 'isControl'>;

export const APPOINTMENT_TYPE_NAME_MAX_LENGTH = 60;

/** Duraciones que se ofrecen al editar un tipo de cita, en minutos. */
export const APPOINTMENT_TYPE_DURATIONS = [15, 30, 45, 60, 90, 120];

/** Duración que trae preseleccionada un tipo nuevo, en minutos. */
export const NEW_APPOINTMENT_TYPE_DURATION = 30;
