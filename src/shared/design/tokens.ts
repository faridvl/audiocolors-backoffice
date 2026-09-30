import type { CSSProperties } from 'react';

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

/**
 * Color de marca por sede, para la franja de identificacion en la lista de
 * pacientes (idea del login: cada row lleva "su" color, no las 6 juntas).
 * Las sedes son un catalogo de solo lectura del API sin campo de color ni
 * codigo/slug propio, solo `name` en texto libre (p.ej. "Centro Medico Yireh
 * Río Claro", no solo "Río Claro") - el mapeo empareja por la ciudad que
 * contiene el nombre, no por nombre exacto, para no depender del prefijo de
 * cada sede (que puede cambiar).
 */
enum BranchCity {
  RIO_CLARO = 'Río Claro',
  QUEPOS = 'Quepos',
  NEILY = 'Neily',
  PEREZ_ZELEDON = 'Pérez Zeledón',
  UVITA = 'Uvita',
}

const BRANCH_CITY_COLORS: Record<BranchCity, string> = {
  [BranchCity.RIO_CLARO]: BRAND_COLORS.blue,
  [BranchCity.QUEPOS]: BRAND_COLORS.yellow,
  [BranchCity.NEILY]: BRAND_COLORS.red,
  [BranchCity.PEREZ_ZELEDON]: BRAND_COLORS.orange,
  [BranchCity.UVITA]: BRAND_COLORS.purple,
};

const normalize = (value: string): string =>
  value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Color de la franja para una sede, buscando la ciudad dentro del nombre; `undefined` si no hay match. */
export function getBranchStripeColor(branchName: string | undefined): string | undefined {
  if (!branchName) return undefined;
  const normalizedName = normalize(branchName);
  const city = Object.values(BranchCity).find((candidate) =>
    normalizedName.includes(normalize(candidate)),
  );
  return city ? BRANCH_CITY_COLORS[city] : undefined;
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
