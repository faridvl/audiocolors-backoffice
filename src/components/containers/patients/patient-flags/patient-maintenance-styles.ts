import { MaintenanceStatus } from '@/types/patients/patient';

/** Botón de notas de la fila: el hover solo existe en dispositivos que lo soportan (en celular se queda pegado). */
export const MAINTENANCE_NOTES_BUTTON_STYLES =
  '[@media(hover:hover)]:hover:bg-brand-50 [@media(hover:hover)]:hover:text-brand-700';

/** Chevron del botón de notas: gira al abrir la fila. */
export const MAINTENANCE_NOTES_CHEVRON_STYLES = 'transition-transform';

/** Píldora del expediente; sin marcar no se pinta. */
export const MAINTENANCE_PILL_STYLES: Record<MaintenanceStatus, string> = {
  [MaintenanceStatus.UNMARKED]: 'bg-ink-100 text-ink-500',
  [MaintenanceStatus.ATTENDED]: 'bg-brand-50 text-brand-700',
  [MaintenanceStatus.MISSED]: 'bg-danger/10 text-danger-700',
};
