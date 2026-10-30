import { MaintenanceChoice } from '@/types/patients/patient';

/** Opción elegida en el selector de cada mantenimiento. */
export const MAINTENANCE_SELECTED_STYLES: Record<MaintenanceChoice, string> = {
  [MaintenanceChoice.UNMARKED]: 'bg-white text-ink-900 shadow-sm',
  [MaintenanceChoice.ATTENDED]: 'bg-brand text-white shadow-sm',
  [MaintenanceChoice.MISSED]: 'bg-danger-700 text-white shadow-sm',
};

/** Píldora del expediente; sin marcar no se pinta. */
export const MAINTENANCE_PILL_STYLES: Record<MaintenanceChoice, string> = {
  [MaintenanceChoice.UNMARKED]: 'bg-ink-100 text-ink-500',
  [MaintenanceChoice.ATTENDED]: 'bg-brand-50 text-brand-700',
  [MaintenanceChoice.MISSED]: 'bg-danger/10 text-danger-700',
};
