/** Caracteres que delatan un nombre UTF-8 leído como latin1 ("Ã", "Ì" y controles C1). */
const MISDECODED_PATTERN = /[\u0080-\u009fÂ-ß]/;
const LATIN1_MAX_CODE = 0xff;

/**
 * Repara nombres de archivo que el API guardó desarmados antes de corregir la
 * subida ("CALDEROÌ\u0081N" → "CALDERÓN"). Si el texto no es un UTF-8 mal
 * leído, se devuelve tal cual.
 */
export function repairFileName(name: string): string {
  if (!MISDECODED_PATTERN.test(name)) return name;

  const codes = Array.from(name, (char) => char.charCodeAt(0));
  if (codes.some((code) => code > LATIN1_MAX_CODE)) return name;

  try {
    return new TextDecoder('utf-8', { fatal: true })
      .decode(Uint8Array.from(codes))
      .normalize('NFC');
  } catch {
    return name;
  }
}

/**
 * Separa el nombre de su extensión. La extensión se conserva al guardar: el API
 * arma la clave en R2 con ella y el preview depende de ella.
 */
export function splitFileName(fileName: string): { baseName: string; extension: string } {
  const dotIndex = fileName.lastIndexOf('.');
  if (dotIndex <= 0) return { baseName: fileName, extension: '' };

  return { baseName: fileName.slice(0, dotIndex), extension: fileName.slice(dotIndex) };
}

/** El nombre como se muestra: sin ".pdf", ".jpg"... */
export const stripFileExtension = (fileName: string) => splitFileName(fileName).baseName;

/** Caracteres que un sistema de archivos no admite en un nombre. */
const INVALID_FILE_NAME_CHARS = /[\/:*?"<>|\u0000-\u001f]+/g;
const FILE_NAME_MAX_LENGTH = 80;

/** Nombre de descarga `<texto>.pdf` a partir de un texto libre; `fallback` si no queda nada usable. */
export function buildDownloadFileName(text: string, fallback: string, extension = '.pdf'): string {
  const cleanText = text
    .replace(INVALID_FILE_NAME_CHARS, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, FILE_NAME_MAX_LENGTH)
    .trim();
  return `${cleanText || fallback}${extension}`;
}
