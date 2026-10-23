import {
  DocumentCategory,
  DocumentItem,
  DocumentKind,
  DOCUMENT_CATEGORY_LABELS,
  PatientDocument,
} from '@/types/documents/document.types';
import { formatDate, formatFileSize } from '@/shared/utils/formatters';
import { repairFileName } from '@/shared/utils/file-name';

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];

/**
 * El tipo de archivo se decide por la URL (el archivo real en R2), nunca por
 * `name`: el nombre se puede editar libremente y el archivo subyacente no
 * cambia, así que basarse en el nombre rompería el preview en cuanto alguien
 * renombrara un PDF sin dejarle la extensión .pdf.
 */
function resolveDocumentKind(url: string): DocumentKind {
  const target = url.toLowerCase();

  if (target.endsWith('.pdf')) return DocumentKind.PDF;
  if (IMAGE_EXTENSIONS.some((extension) => target.endsWith(extension))) return DocumentKind.IMAGE;

  return DocumentKind.OTHER;
}

export function mapToDocumentItem(document: PatientDocument): DocumentItem {
  const category = DOCUMENT_CATEGORY_LABELS[document.category]
    ? document.category
    : DocumentCategory.OTHER;

  return {
    uuid: document.uuid,
    name: repairFileName(document.originalName),
    url: document.url,
    category,
    categoryLabel: DOCUMENT_CATEGORY_LABELS[category],
    kind: resolveDocumentKind(document.url),
    uploadedAtLabel: formatDate(document.uploadedAt),
    uploadedByUuid: document.uploadedByUuid,
    uploadedByName: document.uploadedByName,
    sizeLabel: formatFileSize(document.size),
  };
}
