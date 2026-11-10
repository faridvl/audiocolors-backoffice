/** El motivo puede faltar (lo marcó Recepción u otra vía): vacío o solo espacios cuenta como ausente. */
export function getPriorityReasonText(reason?: string | null): string | null {
  const trimmed = reason?.trim();
  return trimmed || null;
}
