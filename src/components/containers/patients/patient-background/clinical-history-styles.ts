export const CLINICAL_SHEET_WIDTH = 'w-full';

/**
 * Hasta `xl`, dos columnas que reparten las secciones por altura (sin huecos
 * bajo las cortas). En pantalla ancha, una grilla con una sección por columna:
 * las columnas CSS dejarían vacías las de la derecha con pocas secciones.
 */
export const CLINICAL_SECTIONS_COLUMNS =
  'columns-1 gap-4 sm:columns-2 [&>*]:mb-4 [&>*]:break-inside-avoid ' +
  'xl:grid xl:grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] xl:items-start';

export const CLINICAL_TEXTS_GRID = 'grid grid-cols-1 gap-3 sm:grid-cols-2';
