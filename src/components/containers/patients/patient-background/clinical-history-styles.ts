/**
 * Ancho máximo de la hoja: en pantallas anchas cada Sí/No queda cerca de su
 * antecedente en vez de irse al otro extremo.
 */
export const CLINICAL_SHEET_WIDTH = 'w-full max-w-4xl';

/**
 * Columnas que reparten las secciones por altura (1, 3, 3 y 7 antecedentes
 * quedan parejas), en vez de una grilla que deja huecos bajo las cortas.
 */
export const CLINICAL_SECTIONS_COLUMNS =
  'columns-1 gap-4 sm:columns-2 [&>*]:mb-4 [&>*]:break-inside-avoid';

export const CLINICAL_TEXTS_GRID = 'grid grid-cols-1 gap-3 sm:grid-cols-2';
