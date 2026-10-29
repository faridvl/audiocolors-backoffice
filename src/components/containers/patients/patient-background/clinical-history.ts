import type { TFunction } from 'i18next';
import { TEXT } from '@/static/texts/i18n';
import {
  ClinicalAnswer,
  ClinicalField,
  ClinicalFieldType,
} from '@/types/clinical-templates/clinical-template';
import {
  BackgroundCondition,
  BackgroundText,
  PatientBackground,
  SavePatientBackgroundPayload,
} from '@/types/patients/patient-background';

/** Valores del formulario: Sí/No, el detalle de un Sí y los textos, por id de pregunta. */
export interface ClinicalHistoryFormValues {
  /** Null: la pregunta no se ha respondido. */
  checks: Record<string, boolean | null>;
  details: Record<string, string>;
  texts: Record<string, string>;
}

export interface ClinicalFieldGroup {
  key: string;
  /** Null cuando las preguntas van sueltas, sin título (Infecciones de oído). */
  title: string | null;
  booleans: ClinicalField[];
  texts: ClinicalField[];
}

enum StandardSection {
  SURGERIES = 'surgeries',
  CONDITIONS = 'conditions',
  SYMPTOMS = 'symptoms',
}

const STANDARD_LAYOUT: {
  section: StandardSection | null;
  conditions: BackgroundCondition[];
}[] = [
  { section: null, conditions: [BackgroundCondition.EAR_INFECTIONS] },
  {
    section: StandardSection.SURGERIES,
    conditions: [
      BackgroundCondition.NASAL_SURGERY,
      BackgroundCondition.THROAT_SURGERY,
      BackgroundCondition.EAR_SURGERY,
    ],
  },
  {
    section: StandardSection.CONDITIONS,
    conditions: [
      BackgroundCondition.DIABETES,
      BackgroundCondition.CHOLESTEROL,
      BackgroundCondition.HIGH_PRESSURE,
    ],
  },
  {
    section: StandardSection.SYMPTOMS,
    conditions: [
      BackgroundCondition.ALLERGIES,
      BackgroundCondition.RHINITIS,
      BackgroundCondition.VERTIGO,
      BackgroundCondition.DIZZINESS,
      BackgroundCondition.HEADACHE_NOISE,
      BackgroundCondition.CLOGGED_EAR,
      BackgroundCondition.TINNITUS,
    ],
  },
];

/**
 * La hoja en papel de la clínica: lo que se usa mientras el administrador no
 * cambie las preguntas, y para leer historias llenadas antes de que se pudieran
 * cambiar. Los ids coinciden con las columnas del API.
 */
export function buildStandardFields(t: TFunction): ClinicalField[] {
  const booleans = STANDARD_LAYOUT.flatMap(({ section, conditions }) =>
    conditions.map((condition) => ({
      id: condition,
      label: t(`${TEXT.PATIENTS.BACKGROUND.CONDITION_PREFIX}.${condition}`),
      fieldType: ClinicalFieldType.BOOLEAN,
      section: section ? t(`${TEXT.PATIENTS.BACKGROUND.SECTION_PREFIX}.${section}`) : undefined,
      detailLabel:
        condition === BackgroundCondition.TINNITUS
          ? t(TEXT.PATIENTS.BACKGROUND.TINNITUS_TONE)
          : undefined,
    })),
  );
  return booleans.map((field, index) => ({
    ...field,
    required: false,
    order: index,
  }));
}

/** La otoscopia vive en su propia tarjeta (exploración física): ya no es parte de la historia. */
const PHYSICAL_EXAM_IDS: string[] = ['otoscopyRight', 'otoscopyLeft'];

export const isPhysicalExamId = (id: string) => PHYSICAL_EXAM_IDS.includes(id);

export const withoutPhysicalExam = (fields: ClinicalField[]) =>
  fields.filter(({ id }) => !isPhysicalExamId(id));

export const sortFields = (fields: ClinicalField[]) =>
  [...fields].sort((first, second) => first.order - second.order);

/** Respuestas de una historia; las anteriores a las preguntas configurables salen de las columnas. */
export function resolveAnswers(background: PatientBackground): Record<string, ClinicalAnswer> {
  if (background.answers) return background.answers;
  const answers: Record<string, ClinicalAnswer> = Object.fromEntries(
    Object.values(BackgroundCondition).map((condition) => [condition, background[condition]]),
  );
  answers[BackgroundCondition.TINNITUS] = {
    value: background.tinnitus,
    detail: background.tinnitusTone,
  };
  return answers;
}

/** Sí, No o sin responder (null) de una pregunta Sí/No. */
export function yesNoOf(answer: ClinicalAnswer | undefined): boolean | null {
  if (typeof answer === 'boolean') return answer;
  if (answer && typeof answer === 'object') return answer.value;
  return null;
}

export function isYes(answer: ClinicalAnswer | undefined): boolean {
  return yesNoOf(answer) === true;
}

/** Texto de una respuesta Sí/No para mostrar en el resumen, el PDF y los cambios. */
export function yesNoLabel(t: TFunction, answer: boolean | null): string {
  if (answer === null) return t(TEXT.GENERAL.UNANSWERED);
  return t(answer ? TEXT.GENERAL.YES : TEXT.GENERAL.NO);
}

export function detailOf(answer: ClinicalAnswer | undefined): string {
  return answer && typeof answer === 'object' ? (answer.detail ?? '').trim() : '';
}

export function textOf(answer: ClinicalAnswer | undefined): string {
  return typeof answer === 'string' ? answer.trim() : '';
}

/** Agrupa por sección en el orden en que aparece cada una: Sí/No en columnas, textos aparte. */
export function groupFields(fields: ClinicalField[]): ClinicalFieldGroup[] {
  const groups = new Map<string, ClinicalFieldGroup>();
  sortFields(fields).forEach((field) => {
    const title = field.section?.trim() || null;
    const key = title ?? '';
    const group = groups.get(key) ?? { key, title, booleans: [], texts: [] };
    (field.fieldType === ClinicalFieldType.BOOLEAN ? group.booleans : group.texts).push(field);
    groups.set(key, group);
  });
  return [...groups.values()];
}

export function buildFormValues(
  fields: ClinicalField[],
  answers: Record<string, ClinicalAnswer>,
): ClinicalHistoryFormValues {
  const values: ClinicalHistoryFormValues = {
    checks: {},
    details: {},
    texts: {},
  };
  fields.forEach(({ id, fieldType }) => {
    if (fieldType === ClinicalFieldType.BOOLEAN) {
      values.checks[id] = yesNoOf(answers[id]);
      values.details[id] = detailOf(answers[id]);
    } else {
      values.texts[id] = textOf(answers[id]);
    }
  });
  return values;
}

/** Preguntas que la clínica quitó de la plantilla pero que la historia ya respondida conserva. */
export interface RemovedQuestions {
  answers: Record<string, ClinicalAnswer>;
  fields: ClinicalField[];
}

export function collectRemovedQuestions(
  currentFields: ClinicalField[],
  originalAnswers: Record<string, ClinicalAnswer>,
  originalFields: ClinicalField[],
): RemovedQuestions {
  const currentIds = new Set(currentFields.map(({ id }) => id));
  const removedAnswers = Object.entries(originalAnswers).filter(
    ([id]) => !currentIds.has(id) && !isPhysicalExamId(id),
  );
  const removedIds = new Set(removedAnswers.map(([id]) => id));
  return {
    answers: Object.fromEntries(removedAnswers),
    fields: originalFields.filter(({ id }) => removedIds.has(id)),
  };
}

/** Las columnas de otoscopia de la historia, que ya no se editan aquí. */
export interface LegacyOtoscopy {
  otoscopyRight: string | null;
  otoscopyLeft: string | null;
}

const toNullableText = (value: string | undefined) => value?.trim() || null;

/**
 * Lo que se manda al API: las respuestas con la copia de las preguntas, y las
 * columnas fijas de las preguntas estándar para que se sigan leyendo igual.
 */
export function buildPayload(
  fields: ClinicalField[],
  values: ClinicalHistoryFormValues,
  notes: string | null,
  removed?: RemovedQuestions,
  legacyOtoscopy?: LegacyOtoscopy,
): SavePatientBackgroundPayload {
  const answers: Record<string, ClinicalAnswer> = {};
  fields.forEach(({ id, fieldType, detailLabel }) => {
    if (fieldType !== ClinicalFieldType.BOOLEAN) {
      answers[id] = values.texts[id]?.trim() ?? '';
      return;
    }
    const value = values.checks[id] ?? null;
    // Sin responder no se manda la clave: el API no acepta null.
    if (value === null) return;
    // Sin Sí, un detalle escrito antes no tiene sentido guardarlo.
    answers[id] = detailLabel
      ? { value, detail: value ? toNullableText(values.details[id]) : null }
      : value;
  });

  // El API reemplaza todo: sin esto, la respuesta de una pregunta ya quitada se perdería.
  if (removed) Object.assign(answers, removed.answers);

  const conditions = Object.fromEntries(
    Object.values(BackgroundCondition).map((condition) => [condition, isYes(answers[condition])]),
  ) as Record<BackgroundCondition, boolean>;

  return {
    ...conditions,
    // Un API anterior pone en null lo que no llega: se devuelven tal como vinieron.
    ...legacyOtoscopy,
    tinnitusTone: detailOf(answers[BackgroundCondition.TINNITUS]) || null,
    notes,
    answers,
    templateSnapshot: removed ? [...fields, ...removed.fields] : fields,
  };
}
