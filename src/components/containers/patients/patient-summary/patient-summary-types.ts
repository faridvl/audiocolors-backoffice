import { Patient } from '@/types/patients/patient';
import { PatientBackground } from '@/types/patients/patient-background';
import { AudiometryPrintReportProps } from '../patient-audiometry/audiometry-print-report';

export interface SummaryTenant {
  name: string;
  logoUrl: string | null;
}

export interface SummaryPatient {
  patient: Patient;
  /** Nombres de las sedes del paciente, la principal primero. */
  branchNames: string[];
}

/** Plantilla de documento tal como se guardó, con sus variables sin llenar. */
export interface SummaryTemplate {
  uuid: string;
  name: string;
  content: string;
}

export interface SummaryBackground {
  background: PatientBackground;
  /** Quien la actualizó por última vez; vacío si no se conoce. */
  authorName: string;
}

/** Lo mismo que recibe el informe de audiometría suelto; el resumen pone la ficha y la firma. */
export type SummaryAudiometry = Omit<AudiometryPrintReportProps, 'isEmbedded'>;
