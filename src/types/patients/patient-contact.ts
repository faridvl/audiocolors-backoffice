/** Telefono adicional de un paciente (ej. "Juan (hijo)"). Solo nombre libre + telefono. */
export interface PatientContact {
  id: number;
  uuid: string;
  patientUuid: string;
  tenantUuid: string;
  name: string;
  phone: string;
  createdAt: string;
}

export interface CreatePatientContactPayload {
  name: string;
  phone: string;
}

export interface SyncPatientContactItem {
  uuid?: string;
  name: string;
  phone: string;
}
