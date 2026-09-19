/**
 * Design tokens de AudioColors — fuente unica de verdad para el estilo.
 *
 * REGLA: ningun componente escribe un hex propio. Los colores salen de
 * tailwind.config.js (`brand`, `ink`, `success`, `danger`...) y las decisiones
 * de significado, de este archivo.
 *
 * Decisiones de la identidad:
 * - Interfaz CLARA. El logo es multicolor sobre blanco; un chrome oscuro
 *   competiria con el.
 * - `brand` (azul #1f6fb1, la R del logo) es el UNICO acento: accion
 *   primaria, estado activo y foco.
 * - `ink` es una escala de grises NEUTROS, sin tinte azul.
 * - La franja de 6 colores es un gesto de bienvenida: vive en el login, no en
 *   las pantallas de trabajo.
 * - Tipografia Fira Sans, la del manual de marca oficial.
 */

/**
 * Colores de la marca: una letra de "COLORS" por color, en el orden del logo.
 * Hex oficiales del manual de marca (PALETA DE COLORES), no estimados a ojo.
 */
export const BRAND_COLORS = {
  red: '#e3211e',
  orange: '#ef7f2b',
  yellow: '#ffce33',
  green: '#66b335',
  blue: '#1f6fb1',
  purple: '#613f90',
} as const;

/**
 * Semantica de color: que significa cada uno en la interfaz.
 * Se nombran por funcion, no por tono, para que cambiar el tono no obligue a
 * tocar cada pantalla.
 */
export enum SurfaceToken {
  /** Fondo de la aplicacion. */
  APP = 'bg-ink-50',
  /** Tarjetas, tablas, paneles, barras de navegacion. */
  CARD = 'bg-white',
  /** Zonas secundarias: encabezado de tabla, paneles tenues. */
  MUTED = 'bg-ink-50',
  /** Fondo del elemento activo o seleccionado. */
  ACCENT = 'bg-brand-50',
}

export enum TextToken {
  /** Titulos y datos principales. */
  STRONG = 'text-ink-900',
  /** Texto de lectura. */
  DEFAULT = 'text-ink-700',
  /** Etiquetas y datos secundarios. */
  MUTED = 'text-ink-500',
  /** Texto del elemento activo. */
  ACCENT = 'text-brand-700',
  /** Texto sobre fondos de color solido. */
  INVERSE = 'text-white',
}

export enum BorderToken {
  DEFAULT = 'border-ink-200',
  SUBTLE = 'border-ink-100',
  STRONG = 'border-ink-300',
}

/**
 * Radios: uno para controles (inputs, botones, chips) y otro para contenedores
 * (tarjetas, tablas, modales).
 */
export enum RadiusToken {
  CONTROL = 'rounded-lg',
  CONTAINER = 'rounded-card',
  PILL = 'rounded-full',
}

/** Anillo de foco unico para todo elemento interactivo. */
export const FOCUS_RING =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';

/** Transicion estandar de estados hover/active. */
export const TRANSITION = 'transition-colors duration-150';

/** Estado de un registro, con su color semantico. */
export enum StatusTone {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export const STATUS_STYLES: Record<StatusTone, string> = {
  [StatusTone.ACTIVE]: 'bg-success/10 text-success',
  [StatusTone.INACTIVE]: 'bg-ink-100 text-ink-500',
};
