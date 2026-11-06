import { MaintenanceStatus } from '@/types/patients/patient';

/** Opción elegida en el selector de cada mantenimiento. */
export const MAINTENANCE_SELECTED_STYLES: Record<MaintenanceStatus, string> = {
  [MaintenanceStatus.UNMARKED]:
    'bg-ink-100 font-bold text-ink-900 shadow-sm ring-1 ring-inset ring-ink-300',
  [MaintenanceStatus.ATTENDED]: 'bg-brand text-white shadow-sm',
  [MaintenanceStatus.MISSED]: 'bg-danger-700 text-white shadow-sm',
};

/** Opción sin elegir: el hover solo existe en dispositivos que lo soportan (en celular se queda pegado). */
export const MAINTENANCE_UNSELECTED_STYLES =
  'text-ink-500 [@media(hover:hover)]:hover:text-ink-800';

/** Botón de notas de la fila: sin hover pegajoso en celular. */
export const MAINTENANCE_NOTES_BUTTON_STYLES =
  'hover:bg-transparent [@media(hover:hover)]:hover:bg-ink-100';

/** Píldora del expediente; sin marcar no se pinta. */
export const MAINTENANCE_PILL_STYLES: Record<MaintenanceStatus, string> = {
  [MaintenanceStatus.UNMARKED]: 'bg-ink-100 text-ink-500',
  [MaintenanceStatus.ATTENDED]: 'bg-brand-50 text-brand-700',
  [MaintenanceStatus.MISSED]: 'bg-danger/10 text-danger-700',
};
