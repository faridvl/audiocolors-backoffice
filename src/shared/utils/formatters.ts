/** Formatea una fecha ISO como "12 mar 2026". Devuelve '—' si no es valida. */
export function formatDate(isoDate?: string): string {
  if (!isoDate) return '—';
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return '—';

  return parsed.toLocaleDateString('es-CR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const MONTH_LABELS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

/** "2026-11" -> "Noviembre 2026". Devuelve '—' si el mes no es valido. */
export function formatMonthLabel(monthKey?: string | null): string {
  if (!monthKey) return '—';
  const [year, month] = monthKey.split('-');
  const label = MONTH_LABELS[Number(month) - 1];
  if (!label || !year) return '—';

  return `${label.charAt(0).toUpperCase()}${label.slice(1)} ${year}`;
}

/** Edad en anios cumplidos a partir de la fecha de nacimiento. */
export function calculateAge(birthDate?: string): number | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDelta = today.getMonth() - birth.getMonth();

  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birth.getDate())) age -= 1;

  return age >= 0 ? age : null;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getFullName(firstName?: string, lastName?: string): string {
  return [firstName, lastName].filter(Boolean).join(' ').trim() || '—';
}
