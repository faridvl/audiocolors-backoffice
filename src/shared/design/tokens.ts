import type { CSSProperties } from 'react';
import { BranchColor } from '@/types/branches/branch';

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
 * - `danger` es el rojo de relleno y de iconos; el texto rojo y el relleno que lleva
 *   texto blanco usan `danger-700` (contraste de 4.5:1 o más sobre blanco).
 * - `warning` es el ámbar de aviso: `warning-50` fondo, `warning-300` borde y `warning-700`/`warning-800`
 *   para ícono y texto (aviso que pide completar algo, sin alarmar como `danger`).
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

/** Mismo valor que `warning-700` de `tailwind.config.js`: contraste AA sobre blanco. */
const WARNING_TEXT_COLOR = '#b45309';

/**
 * Tonos más oscuros de la misma familia para el texto de la píldora: el color
 * de marca pleno no llega a 4.5:1 sobre su fondo suave (rojo, naranja, verde).
 */
const BRANCH_RED_TEXT_COLOR = '#d01d1a';
const BRANCH_ORANGE_TEXT_COLOR = '#b1530d';
const BRANCH_GREEN_TEXT_COLOR = '#457a24';

/**
 * Color de cada sede: `stripe` para la franja y los puntos (color de marca),
 * `text` para la píldora, con contraste AA sobre su fondo suave. Azul y morado
 * ya lo cumplen con el color pleno.
 */
const BRANCH_COLOR_STYLES: Record<BranchColor, { stripe: string; text: string }> = {
  [BranchColor.RED]: { stripe: BRAND_COLORS.red, text: BRANCH_RED_TEXT_COLOR },
  [BranchColor.ORANGE]: { stripe: BRAND_COLORS.orange, text: BRANCH_ORANGE_TEXT_COLOR },
  [BranchColor.YELLOW]: { stripe: BRAND_COLORS.yellow, text: WARNING_TEXT_COLOR },
  [BranchColor.GREEN]: { stripe: BRAND_COLORS.green, text: BRANCH_GREEN_TEXT_COLOR },
  [BranchColor.BLUE]: { stripe: BRAND_COLORS.blue, text: BRAND_COLORS.blue },
  [BranchColor.PURPLE]: { stripe: BRAND_COLORS.purple, text: BRAND_COLORS.purple },
};

/** Color de la franja de una sede; `undefined` si no se conoce la sede o su color. */
export function getBranchStripeColor(color: BranchColor | undefined | null): string | undefined {
  return color ? BRANCH_COLOR_STYLES[color]?.stripe : undefined;
}

/** Color del texto de la píldora de una sede; `undefined` si no se conoce. */
export function getBranchTextColor(color: BranchColor | undefined | null): string | undefined {
  return color ? BRANCH_COLOR_STYLES[color]?.text : undefined;
}

/** Opacidad en hex que se agrega a un color `#rrggbb`: fondo suave de una píldora. */
export enum ColorAlpha {
  /** ~10 %: fondo de una píldora con el texto en el color pleno. */
  SOFT = '1a',
}

/** `#1f6fb1` + `ColorAlpha.SOFT` -> `#1f6fb11a`. */
export function withAlpha(color: string, alpha: ColorAlpha): string {
  return `${color}${alpha}`;
}

/** Grosor en px de la franja de color de la sede, arriba de una fila o tarjeta. */
const TOP_STRIPE_WIDTH_PX = 3;

/** Estilo de la franja superior de color (sede); sin color, ninguno. */
export function topStripeStyle(color: string | undefined): CSSProperties | undefined {
  return color ? { boxShadow: `inset 0 ${TOP_STRIPE_WIDTH_PX}px 0 0 ${color}` } : undefined;
}
