/** Variables que el API reemplaza al armar el documento de un paciente. Mismas claves que el API. */
export enum DocumentTemplateVariable {
  NAME = 'nombre',
  LAST_NAMES = 'apellidos',
  FULL_NAME = 'nombre_completo',
  DOCUMENT_TYPE = 'tipo_documento',
  DOCUMENT = 'documento',
  BIRTH_DATE = 'fecha_nacimiento',
  AGE = 'edad',
  GENDER = 'genero',
  PHONE = 'telefono',
  EMAIL = 'correo',
  ADDRESS = 'direccion',
  BRANCHES = 'sedes',
  TODAY = 'fecha_hoy',
  PROFESSIONAL = 'profesional',
}

/** En el orden en que se ofrecen en el editor. */
export const DOCUMENT_TEMPLATE_VARIABLES: DocumentTemplateVariable[] =
  Object.values(DocumentTemplateVariable);

export enum DocumentTemplateVariableGroup {
  PATIENT = 'patient',
  DOCUMENT = 'document',
}

export const DOCUMENT_TEMPLATE_VARIABLE_GROUPS: Record<
  DocumentTemplateVariableGroup,
  DocumentTemplateVariable[]
> = {
  [DocumentTemplateVariableGroup.PATIENT]: [
    DocumentTemplateVariable.NAME,
    DocumentTemplateVariable.LAST_NAMES,
    DocumentTemplateVariable.FULL_NAME,
    DocumentTemplateVariable.DOCUMENT_TYPE,
    DocumentTemplateVariable.DOCUMENT,
    DocumentTemplateVariable.BIRTH_DATE,
    DocumentTemplateVariable.AGE,
    DocumentTemplateVariable.GENDER,
    DocumentTemplateVariable.PHONE,
    DocumentTemplateVariable.EMAIL,
    DocumentTemplateVariable.ADDRESS,
    DocumentTemplateVariable.BRANCHES,
  ],
  [DocumentTemplateVariableGroup.DOCUMENT]: [
    DocumentTemplateVariable.TODAY,
    DocumentTemplateVariable.PROFESSIONAL,
  ],
};

export const DOCUMENT_TEMPLATE_NAME_MAX_LENGTH = 120;
export const DOCUMENT_TEMPLATE_CONTENT_MAX_LENGTH = 20000;

export interface DocumentTemplateSummary {
  uuid: string;
  name: string;
  updatedAt: string;
}

export interface DocumentTemplate extends DocumentTemplateSummary {
  content: string;
  createdAt: string;
}

export interface SaveDocumentTemplatePayload {
  name: string;
  content: string;
}
