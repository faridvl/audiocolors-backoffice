import { formatCalendarDate, formatDateTime, formatLongDate } from '@/shared/utils/formatters';
import { AudiometryEntry } from '@/types/patients/audiometry-entry';
import { DocumentTemplateVariable } from '@/types/document-templates/document-template';
import { formatPhoneForDisplay } from '@/shared/utils/phone';
import { GENDER_LABELS, Patient, PatientGender } from '@/types/patients/patient';
import { buildAudiometryReportData } from '../patient-audiometry/audiometry-report-data';
import { payloadToState } from '../patient-audiometry/audiometry-payload-mapper';
import { PrintReportHeader } from '../patient-audiometry/use-audiometry-poc';
import { SummaryAudiometry } from './patient-summary-types';

interface TemplateValuesInput {
  patient: Patient;
  branchNames: string[];
  professionalName: string;
  /** Edad ya redactada ("41 años"); vacía si no hay fecha de nacimiento. */
  ageText: string;
  issuedAt: string;
}

/** Todas las variables de la plantilla con su valor real: ninguna debe quedar como `{{...}}`. */
export function buildTemplateValues({
  patient,
  branchNames,
  professionalName,
  ageText,
  issuedAt,
}: TemplateValuesInput): Record<DocumentTemplateVariable, string> {
  return {
    [DocumentTemplateVariable.NAME]: patient.firstName,
    [DocumentTemplateVariable.LAST_NAMES]: patient.lastName,
    [DocumentTemplateVariable.FULL_NAME]: `${patient.firstName} ${patient.lastName}`.trim(),
    // El paciente no guarda el tipo de documento.
    [DocumentTemplateVariable.DOCUMENT_TYPE]: '',
    [DocumentTemplateVariable.DOCUMENT]: patient.documentId ?? '',
    [DocumentTemplateVariable.BIRTH_DATE]: formatCalendarDate(patient.birthDate),
    [DocumentTemplateVariable.AGE]: ageText,
    [DocumentTemplateVariable.GENDER]: patient.gender
      ? (GENDER_LABELS[patient.gender as PatientGender] ?? patient.gender)
      : '',
    [DocumentTemplateVariable.PHONE]: patient.phone ? formatPhoneForDisplay(patient.phone) : '',
    [DocumentTemplateVariable.EMAIL]: patient.email ?? '',
    [DocumentTemplateVariable.ADDRESS]: patient.address ?? '',
    [DocumentTemplateVariable.BRANCHES]: branchNames.join(', '),
    [DocumentTemplateVariable.TODAY]: formatLongDate(issuedAt),
    [DocumentTemplateVariable.PROFESSIONAL]: professionalName,
  };
}

/** Lo que recibe el informe de audiometría suelto, a partir de la audiometría guardada. */
export function buildSummaryAudiometry(
  entry: AudiometryEntry,
  header: PrintReportHeader,
  professional: string,
): SummaryAudiometry {
  const state = payloadToState(entry.payload);
  const { summaries, presentedWords } = buildAudiometryReportData(state);

  return {
    header,
    entryDate: formatDateTime(entry.createdAt),
    professional,
    marks: state.marks,
    gradingScale: state.gradingScale,
    speechMarks: state.speechMarks,
    weber: state.weber,
    summaries,
    ptaType: state.ptaType,
    speechFieldValues: state.speechFieldValues,
    failedWords: state.failedWords,
    presentedWords,
    notes: state.notes,
  };
}
