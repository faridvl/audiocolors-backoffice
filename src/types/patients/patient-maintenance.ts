import { MaintenanceNumber, MaintenanceStatus } from './patient';

export interface MaintenanceNote {
  uuid: string;
  text: string;
  createdAt: string;
  createdByUuid: string | null;
  /** Null si el usuario ya no existe. */
  createdByName: string | null;
}

/** Un mantenimiento con su historial de notas, la más nueva primero. */
export interface PatientMaintenance {
  number: MaintenanceNumber;
  status: MaintenanceStatus;
  notes: MaintenanceNote[];
}

export interface CreateMaintenanceNotePayload {
  text: string;
}
