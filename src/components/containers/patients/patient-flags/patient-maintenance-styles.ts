import { MaintenanceStatus } from '@/types/patients/patient';

/** Texto de notas de la fila: el hover solo existe en dispositivos que lo soportan (en celular se queda pegado). */
export const MAINTENANCE_NOTES_BUTTON_STYLES = '[@media(hover:hover)]:hover:text-ink-800';

/** Píldora del expediente; sin marcar no se pinta. */
export const MAINTENANCE_PILL_STYLES: Record<MaintenanceStatus, string> = {
  [MaintenanceStatus.UNMARKED]: 'bg-ink-100 text-ink-500',
  [MaintenanceStatus.ATTENDED]: 'bg-brand-50 text-brand-700',
  [MaintenanceStatus.MISSED]: 'bg-danger/10 text-danger-700',
};
