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

export const APPOINTMENT_TYPE_NAME_MAX_LENGTH = 60;

/** Duraciones que se ofrecen al editar un tipo de cita, en minutos. */
export const APPOINTMENT_TYPE_DURATIONS = [15, 30, 45, 60, 90, 120];
