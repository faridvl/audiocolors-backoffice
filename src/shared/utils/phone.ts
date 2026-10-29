/**
 * Teléfonos de Costa Rica (XXXX-XXXX) y de otros países (+ y solo dígitos).
 * `patient.phone` lleva `+506 XXXX-XXXX` y lo comparte Zynka; el contacto, `XXXX-XXXX`.
 */

const COSTA_RICA_CODE = '506';
const LOCAL_DIGITS = 8;
const LOCAL_PHONE_PATTERN = /^\d{4}-\d{4}$/;
const INTERNATIONAL_PREFIX = '+';
const DIALING_PREFIX = '00';
const MIN_INTERNATIONAL_DIGITS = 8;
const MAX_INTERNATIONAL_DIGITS = 15;
/** Largo máximo que acepta el API para un teléfono. */
export const PHONE_MAX_LENGTH = 20;
/** Un `+` con 8 dígitos que empiezan así es un número de Costa Rica escrito de más. */
const COSTA_RICA_LEADING_DIGIT = /^[245678]/;
const COUNTRY_CODE_START = /^[1-9]/;
const INTERNATIONAL_CHARS = /^\+[\d\s-]*$/;
/** Marcas de dirección, espacios no separables y otros invisibles que trae el pegado. */
const INVISIBLE_CHARS = /[​-‏‪- ⁦-⁩ ﻿]/g;
const BEFORE_FIRST_DIGIT = /^[^+\d]+/;

export enum PhoneError {
  LOCAL_FORMAT = 'local-format',
  INTERNATIONAL_FORMAT = 'international-format',
  COSTA_RICA_WITH_PLUS = 'costa-rica-with-plus',
}

const digitsOf = (value: string) => value.replace(/\D/g, '');

/** Quita invisibles y lo que haya antes del primer `+` o dígito ("Tel: "); un `00` inicial es `+`. */
function cleanPhone(value: string): string {
  const cleaned = value.replace(INVISIBLE_CHARS, '').replace(BEFORE_FIRST_DIGIT, '');
  return cleaned.startsWith(DIALING_PREFIX)
    ? `${INTERNATIONAL_PREFIX}${cleaned.slice(DIALING_PREFIX.length)}`
    : cleaned;
}

const isInternational = (value: string) => cleanPhone(value).startsWith(INTERNATIONAL_PREFIX);

/** 506 más 8 dígitos: un número de Costa Rica escrito con su código. */
const isCostaRicaWithCode = (digits: string) =>
  digits.length === COSTA_RICA_CODE.length + LOCAL_DIGITS && digits.startsWith(COSTA_RICA_CODE);

function formatLocalDigits(digits: string): string {
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
}

/** Solo dígitos, espacios y guiones, con los separadores repetidos reducidos a uno. */
function tidySeparators(value: string): string {
  return value.replace(/[^\d\s-]/g, '').replace(/[\s-]{2,}/g, (run) => run[0]);
}

/**
 * Lo que se ve en el campo al escribir. Con `+` es internacional y sin máscara. Sin `+`,
 * hasta 8 dígitos lleva la máscara XXXX-XXXX; un 506 con 8 dígitos se pasa a Costa Rica; con
 * más dígitos se dejan solos y la validación avisa.
 */
export function formatPhoneInput(value: string): string {
  const cleaned = cleanPhone(value);

  if (cleaned.startsWith(INTERNATIONAL_PREFIX)) {
    const body = tidySeparators(cleaned.slice(INTERNATIONAL_PREFIX.length)).trimStart();
    return `${INTERNATIONAL_PREFIX}${body}`.slice(0, PHONE_MAX_LENGTH);
  }

  const digits = digitsOf(cleaned);
  if (isCostaRicaWithCode(digits)) return formatLocalDigits(digits.slice(COSTA_RICA_CODE.length));
  if (digits.length <= LOCAL_DIGITS) return formatLocalDigits(digits);
  // Más de 8 dígitos sin `+` no es de Costa Rica: sin guion, para que no parezca válido.
  return digits.slice(0, PHONE_MAX_LENGTH);
}

/** El prefijo "+506" se ve mientras el número se lee como de Costa Rica (hasta 8 dígitos, sin `+`). */
export function shouldShowCountryPrefix(value: string): boolean {
  const cleaned = cleanPhone(value);
  return !cleaned.startsWith(INTERNATIONAL_PREFIX) && digitsOf(cleaned).length <= LOCAL_DIGITS;
}

/**
 * Forma de guardar el teléfono de un contacto: Costa Rica `XXXX-XXXX`, otro país `+` y
 * solo dígitos. Un `+506` o un 506 con 8 dígitos también es Costa Rica. Un valor que no
 * se reconoce (dato viejo) se devuelve tal cual, sin cortarlo.
 */
export function normalizePhone(value: string): string {
  const cleaned = cleanPhone(value).trim();
  if (!cleaned) return '';
  const digits = digitsOf(cleaned);

  if (isCostaRicaWithCode(digits)) return formatLocalDigits(digits.slice(COSTA_RICA_CODE.length));
  if (cleaned.startsWith(INTERNATIONAL_PREFIX)) return `${INTERNATIONAL_PREFIX}${digits}`;
  if (digits.length === LOCAL_DIGITS) return formatLocalDigits(digits);
  return tidySeparators(cleaned).trim();
}

/** Forma de guardar el teléfono del paciente: los de Costa Rica llevan `+506 `. */
export function toPatientPhone(value: string): string {
  const normalized = normalizePhone(value);
  return LOCAL_PHONE_PATTERN.test(normalized)
    ? `${INTERNATIONAL_PREFIX}${COSTA_RICA_CODE} ${normalized}`
    : normalized;
}

/** Devuelve null si el teléfono sirve (o está vacío: eso lo exige el campo obligatorio). */
export function validatePhone(value: string): PhoneError | null {
  const cleaned = cleanPhone(value).trim();
  if (!cleaned) return null;

  const normalized = normalizePhone(cleaned);
  if (LOCAL_PHONE_PATTERN.test(normalized)) return null;
  if (!cleaned.startsWith(INTERNATIONAL_PREFIX)) return PhoneError.LOCAL_FORMAT;
  if (!INTERNATIONAL_CHARS.test(cleaned)) return PhoneError.INTERNATIONAL_FORMAT;

  const digits = digitsOf(cleaned);
  if (digits.length === LOCAL_DIGITS && COSTA_RICA_LEADING_DIGIT.test(digits)) {
    return PhoneError.COSTA_RICA_WITH_PLUS;
  }

  const isValid =
    COUNTRY_CODE_START.test(digits) &&
    !digits.startsWith(COSTA_RICA_CODE) &&
    digits.length >= MIN_INTERNATIONAL_DIGITS &&
    digits.length <= MAX_INTERNATIONAL_DIGITS;
  return isValid ? null : PhoneError.INTERNATIONAL_FORMAT;
}

/** Un dato viejo de la base que no se tocó no se valida: así se puede editar lo demás. */
export function validatePhoneUnlessUnchanged(
  value: string,
  unchangedValues: ReadonlySet<string>,
): PhoneError | null {
  return unchangedValues.has(value) ? null : validatePhone(value);
}

/** Tiene código de país: es de Costa Rica (8 dígitos) o empieza con `+`. */
function hasCountryCode(normalized: string): boolean {
  return LOCAL_PHONE_PATTERN.test(normalized) || normalized.startsWith(INTERNATIONAL_PREFIX);
}

/** Dígitos con código de país: los de 8 dígitos son de Costa Rica. Sirve para WhatsApp y para comparar. */
export function toInternationalDigits(value: string): string {
  const normalized = normalizePhone(value);
  const digits = digitsOf(normalized);
  return LOCAL_PHONE_PATTERN.test(normalized) ? `${COSTA_RICA_CODE}${digits}` : digits;
}

export function toTelHref(value: string): string {
  const normalized = normalizePhone(value);
  const prefix = hasCountryCode(normalized) ? INTERNATIONAL_PREFIX : '';
  return `tel:${prefix}${toInternationalDigits(normalized)}`;
}

/**
 * Mismo número completo (con código de país). Si uno no trae código (dato viejo de Zynka,
 * "3055551234"), se compara por la terminación del más corto, de 8 dígitos como mínimo.
 */
export function isSamePhone(first: string, second: string): boolean {
  const firstDigits = toInternationalDigits(first);
  const secondDigits = toInternationalDigits(second);
  if (!firstDigits || !secondDigits) return false;

  const bothHaveCode =
    hasCountryCode(normalizePhone(first)) && hasCountryCode(normalizePhone(second));
  if (bothHaveCode) return firstDigits === secondDigits;

  const [shorter, longer] =
    firstDigits.length <= secondDigits.length
      ? [firstDigits, secondDigits]
      : [secondDigits, firstDigits];
  return shorter.length >= LOCAL_DIGITS && longer.endsWith(shorter);
}

// Códigos de país de 2 dígitos (UIT); los de 1 son 1 y 7, y los demás tienen 3.
const ONE_DIGIT_COUNTRY_CODES = ['1', '7'];
const TWO_DIGIT_COUNTRY_CODES = new Set([
  '20',
  '27',
  '30',
  '31',
  '32',
  '33',
  '34',
  '36',
  '39',
  '40',
  '41',
  '43',
  '44',
  '45',
  '46',
  '47',
  '48',
  '49',
  '51',
  '52',
  '53',
  '54',
  '55',
  '56',
  '57',
  '58',
  '60',
  '61',
  '62',
  '63',
  '64',
  '65',
  '66',
  '81',
  '82',
  '84',
  '86',
  '90',
  '91',
  '92',
  '93',
  '94',
  '95',
  '98',
]);
const NATIONAL_GROUP_SIZE = 4;
/** Cómo se parte el número nacional según su largo (el resto se agrupa de a 4). */
const NATIONAL_GROUPS: Record<number, number[]> = {
  5: [2, 3],
  6: [3, 3],
  7: [3, 4],
  8: [4, 4],
  9: [3, 3, 3],
  10: [2, 4, 4],
  11: [3, 4, 4],
  12: [4, 4, 4],
};
const TEN_DIGIT_NATIONAL = 10;
const TEN_DIGIT_GROUPS = [3, 3, 4];

function countryCodeLength(digits: string): number {
  if (ONE_DIGIT_COUNTRY_CODES.includes(digits[0])) return 1;
  return TWO_DIGIT_COUNTRY_CODES.has(digits.slice(0, 2)) ? 2 : 3;
}

function splitInGroups(digits: string, sizes: number[]): string[] {
  let start = 0;
  return sizes.map((size) => {
    const group = digits.slice(start, start + size);
    start += size;
    return group;
  });
}

/**
 * Cómo se muestra un teléfono guardado: Costa Rica `8888-7777`; otro país con el código
 * separado y el resto en bloques (`+1 305 555 1234`). Solo se ve así: se guarda compacto.
 */
export function formatPhoneForDisplay(value: string): string {
  const normalized = normalizePhone(value);
  if (!normalized.startsWith(INTERNATIONAL_PREFIX)) return normalized;

  const digits = digitsOf(normalized);
  const codeLength = countryCodeLength(digits);
  const code = digits.slice(0, codeLength);
  const national = digits.slice(codeLength);

  let sizes = NATIONAL_GROUPS[national.length];
  if (ONE_DIGIT_COUNTRY_CODES.includes(code) && national.length === TEN_DIGIT_NATIONAL) {
    sizes = TEN_DIGIT_GROUPS;
  }
  if (!sizes) {
    sizes =
      national.length <= NATIONAL_GROUP_SIZE
        ? [national.length]
        : Array.from(
            { length: Math.ceil(national.length / NATIONAL_GROUP_SIZE) },
            () => NATIONAL_GROUP_SIZE,
          );
  }

  return [`${INTERNATIONAL_PREFIX}${code}`, ...splitInGroups(national, sizes)]
    .filter(Boolean)
    .join(' ');
}
