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

export const DOCUMENT_TEMPLATE_NAME_MAX_LENGTH = 120;
export const DOCUMENT_TEMPLATE_DESCRIPTION_MAX_LENGTH = 300;
export const DOCUMENT_TEMPLATE_CONTENT_MAX_LENGTH = 20000;

export interface DocumentTemplateSummary {
  uuid: string;
  name: string;
  description: string | null;
  updatedAt: string;
}

export interface DocumentTemplate extends DocumentTemplateSummary {
  content: string;
  createdAt: string;
}

export interface SaveDocumentTemplatePayload {
  name: string;
  description?: string;
  content: string;
}
