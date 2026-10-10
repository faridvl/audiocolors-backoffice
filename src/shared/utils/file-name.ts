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
