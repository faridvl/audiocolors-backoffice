import { DEFAULT_COUNTRY, findCountryByDigits, type PhoneCountry } from './phone-countries';

/**
 * Teléfonos de Costa Rica (XXXX-XXXX) y de otros países (`+<código> <dígitos>`).
 * `patient.phone` lleva `+506 XXXX-XXXX` y lo comparte Zynka; el contacto, `XXXX-XXXX`.
 */

const COSTA_RICA_CODE = '506';
const LOCAL_DIGITS = 8;
const LOCAL_PHONE_PATTERN = /^\d{4}-\d{4}$/;
const INTERNATIONAL_PREFIX = '+';
const DIALING_PREFIX = '00';
/** Total mínimo con el código de país: con menos no hay número real. */
const MIN_INTERNATIONAL_DIGITS = 8;
const MAX_INTERNATIONAL_DIGITS = 15;
/** Largo máximo que acepta el API para un teléfono. */
export const PHONE_MAX_LENGTH = 20;
const COUNTRY_CODE_START = /^[1-9]/;
const INTERNATIONAL_CHARS = /^\+[\d\s-]*$/;
/** Marcas de dirección, espacios no separables y otros invisibles que trae el pegado. */
const INVISIBLE_CHARS = /[​-‏‪- ⁦-⁩ ﻿]/g;
const BEFORE_FIRST_DIGIT = /^[^+\d]+/;
const TRUNK_PREFIX = /^0/;
/** Números ticos (fijos y móviles) empiezan en 2, 4, 5, 6, 7 u 8. */
const COSTA_RICA_LOCAL_START = /^[245678]/;
/**
 * Con el código repetido al frente (`57 300 1234567`) solo se quita si el resto tiene al menos
 * esto: más corto podría ser un número nacional que empieza igual (Brasil, `55 9…`).
 */
const MIN_NATIONAL_AFTER_REPEATED_CODE = 10;

export enum PhoneError {
  LOCAL_FORMAT = 'local-format',
  INTERNATIONAL_FORMAT = 'international-format',
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

/** `+<código> <dígitos>` si el código se reconoce; si no, `+` y los dígitos tal cual. */
function formatInternational(digits: string): string {
  const country = findCountryByDigits(digits);
  if (!country) return `${INTERNATIONAL_PREFIX}${digits}`;
  const national = digits.slice(country.dialCode.length);
  return national
    ? `${INTERNATIONAL_PREFIX}${country.dialCode} ${national}`
    : `${INTERNATIONAL_PREFIX}${country.dialCode}`;
}

/**
 * País del número cargado: el del código si lo trae, Costa Rica si es local (hasta 8 dígitos
 * sin `+`) y `preferred` (o Costa Rica) si está vacío. `null` es un dato viejo que no se
 * reconoce: el campo lo deja tal cual y sin máscara. Con código compartido (+1) gana `preferred`.
 */
export function detectPhoneCountry(value: string, preferred?: PhoneCountry): PhoneCountry | null {
  const cleaned = cleanPhone(value).trim();
  if (!cleaned) return preferred ?? DEFAULT_COUNTRY;

  const digits = digitsOf(cleaned);
  if (cleaned.startsWith(INTERNATIONAL_PREFIX))
    return findCountryByDigits(digits, preferred) ?? null;
  if (digits.length <= LOCAL_DIGITS) return DEFAULT_COUNTRY;
  // Más de 8 dígitos sin `+` solo llega al pasar a Costa Rica con un número de otro país cargado.
  return preferred?.dialCode === COSTA_RICA_CODE ? preferred : null;
}

/** Lo que se ve en el campo junto al país elegido: el número sin su código. */
export function toNationalInput(value: string, country: PhoneCountry): string {
  const cleaned = cleanPhone(value).trim();
  const digits = digitsOf(cleaned);
  const nationalDigits = cleaned.startsWith(INTERNATIONAL_PREFIX)
    ? digits.slice(country.dialCode.length)
    : digits;
  return country.dialCode === DEFAULT_COUNTRY.dialCode
    ? formatLocalDigits(nationalDigits)
    : nationalDigits;
}

/** `+` y 8 dígitos ticos: un número de Costa Rica, no otro código (+222…). */
const isCostaRicaLocalAfterPlus = (digits: string) =>
  digits.length === LOCAL_DIGITS &&
  COSTA_RICA_LOCAL_START.test(digits) &&
  !digits.startsWith(COSTA_RICA_CODE);

/** Dígitos del país extranjero sin 0 de larga distancia ni el código si viene repetido. */
function toForeignNationalDigits(digits: string, country: PhoneCountry): string {
  const withoutTrunk = digits.replace(TRUNK_PREFIX, '');
  const hasRepeatedCode =
    withoutTrunk.startsWith(country.dialCode) &&
    withoutTrunk.length - country.dialCode.length >= MIN_NATIONAL_AFTER_REPEATED_CODE;
  return hasRepeatedCode
    ? withoutTrunk.slice(country.dialCode.length).replace(TRUNK_PREFIX, '')
    : withoutTrunk;
}

/**
 * Valor del formulario al escribir con un país elegido. Costa Rica: XXXX-XXXX; otro país:
 * `+<código> <dígitos>` (vacío si no hay dígitos, para que el campo obligatorio avise).
 * Un número pegado con `+` y código trae su propio país (salvo `+` y 8 dígitos ticos con
 * Costa Rica elegido). En otro país se quita el 0 de larga distancia y el código repetido.
 */
export function composePhoneValue(country: PhoneCountry, input: string): string {
  const cleaned = cleanPhone(input);
  const digits = digitsOf(cleaned);
  if (cleaned.startsWith(INTERNATIONAL_PREFIX)) {
    if (country.dialCode === COSTA_RICA_CODE && isCostaRicaLocalAfterPlus(digits)) {
      return formatLocalDigits(digits);
    }
    return normalizePhone(cleaned).slice(0, PHONE_MAX_LENGTH);
  }

  if (country.dialCode === COSTA_RICA_CODE) {
    if (isCostaRicaWithCode(digits)) return formatLocalDigits(digits.slice(COSTA_RICA_CODE.length));
    return formatLocalDigits(digits.slice(0, LOCAL_DIGITS));
  }
  const national = toForeignNationalDigits(digits, country).slice(
    0,
    MAX_INTERNATIONAL_DIGITS - country.dialCode.length,
  );
  return national ? `${INTERNATIONAL_PREFIX}${country.dialCode} ${national}` : '';
}

/**
 * Valor al elegir otro país con un número ya escrito: conserva todos los dígitos (no corta a 8
 * en Costa Rica) y la validación avisa si no calzan con el país nuevo.
 */
export function switchPhoneCountry(country: PhoneCountry, nationalInput: string): string {
  const digits = digitsOf(cleanPhone(nationalInput));
  if (country.dialCode === COSTA_RICA_CODE) return formatLocalDigits(digits);
  return digits ? `${INTERNATIONAL_PREFIX}${country.dialCode} ${digits}` : '';
}

/**
 * Lo que se ve en el campo de un número que no se reconoce (dato viejo): sin `+` y con más
 * de 8 dígitos se deja solo, sin máscara; con `+`, sin máscara.
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
  return digits.slice(0, PHONE_MAX_LENGTH);
}

/**
 * Forma de guardar el teléfono de un contacto: Costa Rica `XXXX-XXXX`, otro país
 * `+<código> <dígitos>`. Un `+506` o un 506 con 8 dígitos también es Costa Rica. Un valor que
 * no se reconoce (dato viejo) se devuelve tal cual, sin cortarlo.
 */
export function normalizePhone(value: string): string {
  const cleaned = cleanPhone(value).trim();
  if (!cleaned) return '';
  const digits = digitsOf(cleaned);

  if (isCostaRicaWithCode(digits)) return formatLocalDigits(digits.slice(COSTA_RICA_CODE.length));
  if (cleaned.startsWith(INTERNATIONAL_PREFIX)) return formatInternational(digits);
  if (digits.length === LOCAL_DIGITS) return formatLocalDigits(digits);
  return tidySeparators(cleaned).trim();
}

/**
 * Igual que `normalizePhone`, pero si el campo sigue como se mostró al abrir el formulario
 * devuelve el valor guardado tal cual: un dato viejo (`+13055551234`) no se reescribe.
 */
export function normalizePhoneUnlessUnchanged(value: string, storedValue?: string): string {
  if (storedValue !== undefined && value === formatPhoneForDisplay(storedValue)) {
    return storedValue;
  }
  return normalizePhone(value);
}

/**
 * Forma de guardar el teléfono del paciente: los de Costa Rica llevan `+506 `.
 * `isStored`: viene de la base sin tocar, un `+` se deja como está.
 */
export function toPatientPhone(value: string, isStored = false): string {
  if (isStored && value.startsWith(INTERNATIONAL_PREFIX)) return value;
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
const NORTH_AMERICA_CODE = '1';
const TEN_DIGIT_NATIONAL = 10;
const TEN_DIGIT_GROUPS = [3, 3, 4];

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
  const country = findCountryByDigits(digits);
  if (!country) return normalized;
  const code = country.dialCode;
  const national = digits.slice(code.length);

  let sizes = NATIONAL_GROUPS[national.length];
  if (code === NORTH_AMERICA_CODE && national.length === TEN_DIGIT_NATIONAL) {
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
