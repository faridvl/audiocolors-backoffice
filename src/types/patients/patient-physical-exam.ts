export interface PatientPhysicalExam {
  otoscopyRight: string | null;
  otoscopyLeft: string | null;
  createdAt: string;
  updatedAt: string;
  createdByUuid: string | null;
  updatedByUuid: string | null;
}

export interface SavePatientPhysicalExamPayload {
  otoscopyRight: string | null;
  otoscopyLeft: string | null;
}

export const PHYSICAL_EXAM_TEXT_MAX_LENGTH = 1000;
