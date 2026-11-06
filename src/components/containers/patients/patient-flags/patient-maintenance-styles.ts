import { MaintenanceStatus } from '@/types/patients/patient';

/** Estados que se eligen con un chip; "sin marcar" es no tener ninguno elegido. */
export type MaintenanceChipStatus = MaintenanceStatus.ATTENDED | MaintenanceStatus.MISSED;

/** Chip elegido de cada mantenimiento. */
export const MAINTENANCE_CHIP_SELECTED_STYLES: Record<MaintenanceChipStatus, string> = {
  [MaintenanceStatus.ATTENDED]: 'border-brand bg-brand text-white',
  [MaintenanceStatus.MISSED]: 'border-danger-700 bg-danger-700 text-white',
};

/** Chip sin elegir: el hover solo existe en dispositivos que lo soportan (en celular se queda pegado). */
export const MAINTENANCE_CHIP_UNSELECTED_STYLES =
  'border-ink-300 bg-white text-ink-600 [@media(hover:hover)]:group-hover:bg-ink-50';

/** Botón de notas de la fila: sin hover pegajoso en celular. */
export const MAINTENANCE_NOTES_BUTTON_STYLES =
  'hover:bg-transparent [@media(hover:hover)]:hover:bg-ink-100';

/** Píldora del expediente; sin marcar no se pinta. */
export const MAINTENANCE_PILL_STYLES: Record<MaintenanceStatus, string> = {
  [MaintenanceStatus.UNMARKED]: 'bg-ink-100 text-ink-500',
  [MaintenanceStatus.ATTENDED]: 'bg-brand-50 text-brand-700',
  [MaintenanceStatus.MISSED]: 'bg-danger/10 text-danger-700',
};
