export enum DocumentCategory {
  EVOLUTION_CONTROL = 'EVOLUTION_CONTROL',
  WARRANTY = 'WARRANTY',
  EXTERNAL_TEST = 'EXTERNAL_TEST',
  CLINICAL_HISTORY = 'CLINICAL_HISTORY',
  OTHER = 'OTHER',
}

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  [DocumentCategory.EVOLUTION_CONTROL]: 'Control de evolución',
  [DocumentCategory.WARRANTY]: 'Garantías',
  [DocumentCategory.EXTERNAL_TEST]: 'Pruebas',
  [DocumentCategory.CLINICAL_HISTORY]: 'Historia clínica',
  [DocumentCategory.OTHER]: 'Otros',
};

export const ALL_CATEGORIES_FILTER = 'ALL' as const;
export type DocumentFilter = DocumentCategory | typeof ALL_CATEGORIES_FILTER;

export enum DocumentKind {
  IMAGE = 'IMAGE',
  PDF = 'PDF',
  OTHER = 'OTHER',
}

/** Respuesta del API para un documento de paciente. */
export interface PatientDocument {
  id: number;
  uuid: string;
  originalName: string;
  category: DocumentCategory;
  uploadedAt: string;
  uploadedByUuid: string;
  size: number;
  url: string;
}

/** Documento ya normalizado para la UI. */
export interface DocumentItem {
  uuid: string;
  name: string;
  url: string;
  category: DocumentCategory;
  categoryLabel: string;
  kind: DocumentKind;
  uploadedAtLabel: string;
  uploadedByUuid: string;
  sizeLabel: string;
}

export const DOCUMENT_NAME_MAX_LENGTH = 255;
