export enum DocumentCategory {
  RECEIPT = 'RECEIPT',
  WARRANTY = 'WARRANTY',
  EXTERNAL_TEST = 'EXTERNAL_TEST',
  OTHER = 'OTHER',
}

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  [DocumentCategory.RECEIPT]: 'Recibos',
  [DocumentCategory.WARRANTY]: 'Garantias',
  [DocumentCategory.EXTERNAL_TEST]: 'Pruebas externas',
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
  sizeLabel: string;
}
