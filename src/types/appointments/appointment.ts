/** Estados de una cita. Mismo catálogo que el API (`AppointmentStatus`). */
export enum AppointmentStatus {
  TENTATIVE = 'TENTATIVE',
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  /** El paciente llegó y está en sala. */
  WAITING = 'WAITING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  /** El job de medianoche pasa aquí toda cita CONFIRMED cuya fecha ya pasó. */
  EXPIRED = 'EXPIRED',
}

/** Una cita tal como la devuelve `GET /appointments`. */
export interface Appointment {
  id: string;
  patientUUID: string;
  /** Quien agendó la cita. El API todavía no guarda qué profesional la atiende. */
  userUUID: string;
  typeUUID?: string | null;
  branchUUID?: string | null;
  status: AppointmentStatus;
  schedule: {
    date: string;
    /** ISO. Hoy el API la fija a las 08:00 UTC: no es una hora real de la cita. */
    startTime: string;
    endTime: string;
  };
  notes?: string;
  patientName?: string;
  typeName?: string;
  createdAt: string;
  updatedAt: string;
}
