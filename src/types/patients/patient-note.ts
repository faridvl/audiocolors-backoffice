import { DocumentCategory } from '@/types/documents/document.types';

/** Nota de evolucion de un paciente. Bitacora libre: solo se crea y se lista, nunca se edita ni se borra. */
export interface PatientNote {
  id: number;
  uuid: string;
  patientUuid: string;
  tenantUuid: string;
  authorUuid: string;
  authorName: string | null;
  category: DocumentCategory;
  text: string;
  createdAt: string;
}

export interface CreatePatientNotePayload {
  text: string;
  category?: DocumentCategory;
}

export const PATIENT_NOTE_TEXT_MAX_LENGTH = 500;
