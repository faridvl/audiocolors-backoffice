import { MaintenanceStatus } from "@/types/patients/patient";

/** Botón de notas de la fila: el hover solo existe en dispositivos que lo soportan (en celular se queda pegado). */
export const MAINTENANCE_NOTES_BUTTON_STYLES =
  "[@media(hover:hover)]:hover:bg-brand-50 [@media(hover:hover)]:hover:text-brand-700";

/** Chevron del botón de notas: gira al abrir la fila. */
export const MAINTENANCE_NOTES_CHEVRON_STYLES = "transition-transform";

/** Botón de estado de la fila: inactivo neutro; activo azul (vino) o rojo (lo perdió). */
export const MAINTENANCE_CHOICE_BASE_STYLES =
  "flex min-h-[44px] shrink-0 items-center whitespace-nowrap gap-1.5 rounded-lg border px-3 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-wait";

export const MAINTENANCE_CHOICE_ICON_STYLES = "h-4 w-4 shrink-0";

export const MAINTENANCE_CHOICE_INACTIVE_STYLES =
  "border-ink-300 bg-white text-ink-700 focus-visible:outline-brand [@media(hover:hover)]:hover:bg-ink-50";

export const MAINTENANCE_CHOICE_ACTIVE_STYLES: Record<
  MaintenanceStatus.ATTENDED | MaintenanceStatus.MISSED,
  string
> = {
  [MaintenanceStatus.ATTENDED]:
    "border-brand bg-brand text-white focus-visible:outline-brand",
  [MaintenanceStatus.MISSED]:
    "border-danger bg-danger text-white focus-visible:outline-danger",
};

/** Píldora del expediente; sin marcar no se pinta. */
export const MAINTENANCE_PILL_STYLES: Record<MaintenanceStatus, string> = {
  [MaintenanceStatus.UNMARKED]: "bg-ink-100 text-ink-500",
  [MaintenanceStatus.ATTENDED]: "bg-brand-50 text-brand-700",
  [MaintenanceStatus.MISSED]: "bg-danger/10 text-danger-700",
};
