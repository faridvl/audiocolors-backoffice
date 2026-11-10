import { formatCalendarDate, formatDateTime, formatLongDate } from '@/shared/utils/formatters';
import { AudiometryEntry, ClinicalAudiometryEntry } from '@/types/patients/audiometry-entry';
import { DocumentTemplateVariable } from '@/types/document-templates/document-template';
import { formatPhoneForDisplay } from '@/shared/utils/phone';
import { OtoscopyEntry } from '@/types/patients/otoscopy-entry';
import { GENDER_LABELS, Patient, PatientGender } from '@/types/patients/patient';
import { Tenant } from '@/types/tenant/tenant';
import { buildAudiometryReportData } from '../patient-audiometry/audiometry-report-data';
import { AudiometryTypeCode } from '../patient-audiometry/audiometry-constants';
import {
  payloadToState,
  screeningPayloadToState,
} from '../patient-audiometry/audiometry-payload-mapper';
import { buildEmptyFormState, PrintReportHeader } from '../patient-audiometry/use-audiometry-poc';
import { SummaryAudiometry } from './patient-summary-types';

/** El resumen del paciente incluye solo audiometrías clínicas; el rastreo no lleva Weber ni logoaudiometría. */
export const isClinicalEntry = (
  entry: AudiometryEntry | undefined,
): entry is ClinicalAudiometryEntry =>
  entry !== undefined && entry.typeCode !== AudiometryTypeCode.SCREENING;

interface TemplateValuesInput {
  patient: Patient;
  branchNames: string[];
  professionalName: string;
  /** Edad ya redactada ("41 años"); vacía si no hay fecha de nacimiento. */
  ageText: string;
  issuedAt: string;
  /** Última otoscopía del paciente; sin ella, las variables salen vacías. */
  latestOtoscopy: OtoscopyEntry | null;
  /** Diagnóstico y observaciones de la última audiometría válida. */
  latestAudiometryNotes: ClinicalAudiometryEntry['payload']['notes'] | null;
  clinic: Tenant | null;
}

/** Todas las variables de la plantilla con su valor real: ninguna debe quedar como `{{...}}`. */
export function buildTemplateValues({
  patient,
  branchNames,
  professionalName,
  ageText,
  issuedAt,
  latestOtoscopy,
  latestAudiometryNotes,
  clinic,
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
    [DocumentTemplateVariable.OTOSCOPY_RIGHT]: latestOtoscopy?.otoscopyRight ?? '',
    [DocumentTemplateVariable.OTOSCOPY_LEFT]: latestOtoscopy?.otoscopyLeft ?? '',
    [DocumentTemplateVariable.DIAGNOSIS]: latestAudiometryNotes?.diagnosis ?? '',
    [DocumentTemplateVariable.OBSERVATIONS]: latestAudiometryNotes?.observations ?? '',
    [DocumentTemplateVariable.CLINIC_NAME]: clinic?.businessName ?? '',
    [DocumentTemplateVariable.CLINIC_PHONE]: clinic?.phone
      ? formatPhoneForDisplay(clinic.phone)
      : '',
    [DocumentTemplateVariable.CLINIC_EMAIL]: clinic?.email ?? '',
    [DocumentTemplateVariable.CLINIC_ADDRESS]: clinic?.address ?? '',
  };
}

/** Lo que recibe el informe de audiometría suelto, a partir de la audiometría guardada. */
export function buildSummaryAudiometry(
  entry: AudiometryEntry,
  header: PrintReportHeader,
  professional: string,
): SummaryAudiometry {
  const isScreening = entry.typeCode === AudiometryTypeCode.SCREENING;
  // El rastreo solo tiene vía aérea y observaciones: lo demás va vacío y el informe no lo muestra.
  const screeningState = isScreening ? screeningPayloadToState(entry.payload) : null;
  const state = screeningState
    ? { ...buildEmptyFormState(), marks: screeningState.marks, notes: screeningState.notes }
    : payloadToState(entry.payload as ClinicalAudiometryEntry['payload']);
  const { summaries, presentedWords } = buildAudiometryReportData(state);

  return {
    header,
    entryDate: formatDateTime(entry.createdAt),
    professional,
    typeName: entry.typeName,
    equipment: entry.equipment,
    screening: screeningState ? { result: screeningState.result } : undefined,
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
