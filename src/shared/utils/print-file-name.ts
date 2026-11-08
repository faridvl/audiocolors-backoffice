/** Caracteres que el navegador no admite en el nombre de un archivo guardado. */
const INVALID_PRINT_NAME_CHARS = /[\/:*?"<>|\u0000-\u001f]+/g;
const PART_SEPARATOR = ' - ';

export interface PrintFileNameParts {
  /** Tipo de documento: "Resumen clínico", "Audiometría". */
  type: string;
  clinic?: string | null;
  patient?: string | null;
  documentId?: string | null;
}

const cleanPart = (part?: string | null) =>
  (part ?? '').replace(INVALID_PRINT_NAME_CHARS, ' ').replace(/\s+/g, ' ').trim();

/**
 * Nombre con el que el navegador propone guardar lo impreso (sale del título de la página):
 * "{Tipo} - {Clínica} - {Paciente} - {Cédula}". Un tramo vacío se omite sin dejar guiones sueltos.
 */
export function buildPrintFileName({ type, clinic, patient, documentId }: PrintFileNameParts) {
  return [type, clinic, patient, documentId].map(cleanPart).filter(Boolean).join(PART_SEPARATOR);
}
