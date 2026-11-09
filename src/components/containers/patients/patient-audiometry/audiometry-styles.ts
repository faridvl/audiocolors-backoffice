import { AudiometryTool, Ear } from './audiometry-constants';

export interface SymbolTone {
  /** Trazo del símbolo y de su línea. */
  stroke: string;
  /** Relleno de las letras. */
  fill: string;
}

/** Rojo para el oído derecho, azul para el izquierdo (convención audiométrica). */
const EAR_TONES: Record<Ear, SymbolTone> = {
  [Ear.RIGHT]: { stroke: 'stroke-danger', fill: 'fill-danger' },
  [Ear.LEFT]: { stroke: 'stroke-info', fill: 'fill-info' },
};

/** El campo libre no pertenece a un oído. */
const FREE_FIELD_TONE: SymbolTone = {
  stroke: 'stroke-success',
  fill: 'fill-success',
};

export const getSymbolTone = (tool: AudiometryTool, ear: Ear): SymbolTone =>
  tool === AudiometryTool.FREE_FIELD ? FREE_FIELD_TONE : EAR_TONES[ear];

/** Fondo de las bandas de grado, alternando por posición para que se distingan sin color propio. */
export const BAND_FILL_STYLES: string[] = ['fill-ink-50', 'fill-ink-100'];
