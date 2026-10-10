import { AgendaSection } from './agenda-presenter';

/**
 * Colores por grupo del día, en un solo lugar: los usan la lista del celular,
 * los horarios de escritorio y cualquier vista nueva de la agenda.
 */

/** Tono del encabezado de cada grupo del día. */
export const SECTION_TONES: Record<AgendaSection, string> = {
  [AgendaSection.IN_ROOM]: 'text-warning',
  [AgendaSection.UPCOMING]: 'text-brand-700',
  [AgendaSection.SCHEDULED]: 'text-brand-700',
  [AgendaSection.UNMARKED]: 'text-ink-500',
  [AgendaSection.DONE]: 'text-success',
};

/** Fondo de la fila según el grupo: solo "en sala" se destaca. */
export const SECTION_ROW_STYLES: Record<AgendaSection, string> = {
  [AgendaSection.IN_ROOM]: 'border-warning/40 bg-warning/5 hover:bg-warning/10',
  [AgendaSection.UPCOMING]: 'border-ink-200 bg-white hover:bg-ink-50',
  [AgendaSection.SCHEDULED]: 'border-ink-200 bg-white hover:bg-ink-50',
  [AgendaSection.UNMARKED]: 'border-dashed border-ink-300 bg-white hover:bg-ink-50',
  [AgendaSection.DONE]: 'border-ink-100 bg-ink-50 hover:bg-ink-100',
};

/** Qué tan apretada va una fila: normal en listas, compacta en la ventana de horarios. */
export enum RowDensity {
  REGULAR = 'REGULAR',
  COMPACT = 'COMPACT',
}

export const ROW_DENSITY_STYLES: Record<RowDensity, string> = {
  [RowDensity.REGULAR]: 'min-h-[56px] py-2.5',
  [RowDensity.COMPACT]: 'min-h-[44px] gap-2 px-2.5 py-1.5',
};
