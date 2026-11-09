import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  composePhoneValue,
  detectPhoneCountry,
  formatPhoneForDisplay,
  isSamePhone,
  normalizePhone,
  normalizePhoneUnlessUnchanged,
  toInternationalDigits,
  switchPhoneCountry,
  toNationalInput,
  toPatientPhone,
  toTelHref,
  validatePhone,
  PhoneError,
} from "./phone";
import {
  DEFAULT_COUNTRY,
  getCountryByIso,
  searchCountries,
} from "./phone-countries";

const unitedStates = getCountryByIso("US");
const spain = getCountryByIso("ES");
const canada = getCountryByIso("CA");
const colombia = getCountryByIso("CO");
const unitedKingdom = getCountryByIso("GB");

describe("Costa Rica guarda igual que antes", () => {
  it("el paciente lleva +506 y el contacto solo XXXX-XXXX", () => {
    assert.equal(toPatientPhone("8888-7777"), "+506 8888-7777");
    assert.equal(toPatientPhone("88887777"), "+506 8888-7777");
    assert.equal(normalizePhone("+506 8888-7777"), "8888-7777");
    assert.equal(normalizePhone("88887777"), "8888-7777");
  });

  it("componer con Costa Rica da XXXX-XXXX y corta a 8 dígitos", () => {
    assert.equal(composePhoneValue(DEFAULT_COUNTRY, "88887777"), "8888-7777");
    assert.equal(composePhoneValue(DEFAULT_COUNTRY, "8888"), "8888");
    assert.equal(
      composePhoneValue(DEFAULT_COUNTRY, "888877779999"),
      "8888-7777",
    );
  });

  it("valida 8 dígitos", () => {
    assert.equal(validatePhone("8888-7777"), null);
    assert.equal(validatePhone("8888-77"), PhoneError.LOCAL_FORMAT);
    assert.equal(validatePhone(""), null);
  });
});

describe("otros países", () => {
  it("+1 guarda y recarga", () => {
    assert.ok(unitedStates);
    const value = composePhoneValue(unitedStates, "305 555 1234");
    assert.equal(value, "+1 3055551234");
    assert.equal(detectPhoneCountry(value)?.iso, "US");
    assert.equal(toNationalInput(value, unitedStates), "(305) 555-1234");
    assert.equal(toPatientPhone(value), "+1 3055551234");
    assert.equal(formatPhoneForDisplay(value), "+1 (305) 555-1234");
    assert.equal(validatePhone(value), null);
  });

  it("+1 se enmascara mientras se escribe y se guarda compacto", () => {
    assert.ok(unitedStates);
    assert.equal(toNationalInput("+1 305", unitedStates), "305");
    assert.equal(toNationalInput("+1 3055", unitedStates), "(305) 5");
    assert.equal(toNationalInput("+1 305555", unitedStates), "(305) 555");
    assert.equal(toNationalInput("+1 3055551", unitedStates), "(305) 555-1");
    assert.equal(toNationalInput("+1 30555512345", unitedStates), "30555512345");
    assert.equal(composePhoneValue(unitedStates, "(305) 555-1234"), "+1 3055551234");
  });

  it("+34 guarda y recarga", () => {
    assert.ok(spain);
    const value = composePhoneValue(spain, "612 345 678");
    assert.equal(value, "+34 612345678");
    assert.equal(detectPhoneCountry(value)?.iso, "ES");
    assert.equal(toNationalInput(value, spain), "612345678");
    assert.equal(formatPhoneForDisplay(value), "+34 612 345 678");
    assert.equal(validatePhone(value), null);
  });

  it("con código compartido manda el país elegido", () => {
    assert.ok(canada);
    assert.equal(detectPhoneCountry("+1 4165551234", canada)?.iso, "CA");
    assert.equal(detectPhoneCountry("+1 4165551234")?.iso, "US");
  });

  it("sin dígitos queda vacío para que el campo obligatorio avise", () => {
    assert.ok(spain);
    assert.equal(composePhoneValue(spain, ""), "");
  });

  it("valida de 8 a 15 dígitos en total, contando el código", () => {
    assert.equal(validatePhone("+34 6"), PhoneError.INTERNATIONAL_FORMAT);
    assert.equal(validatePhone("+1 305"), PhoneError.INTERNATIONAL_FORMAT);
    assert.equal(validatePhone("+34 61234"), PhoneError.INTERNATIONAL_FORMAT);
    assert.equal(validatePhone("+34 612345"), null);
    assert.equal(
      validatePhone("+1 234567890123456"),
      PhoneError.INTERNATIONAL_FORMAT,
    );
  });

  it("un número pegado con + trae su propio país", () => {
    assert.ok(spain);
    assert.equal(composePhoneValue(spain, "+1 (305) 555-1234"), "+1 3055551234");
  });
});

describe("valores viejos", () => {
  it("uno largo sin + no se rompe ni se corta", () => {
    const old = "30555512345678";
    assert.equal(detectPhoneCountry(old), null);
    assert.equal(normalizePhone(old), old);
    assert.equal(toPatientPhone(old), old);
    assert.equal(formatPhoneForDisplay(old), old);
  });

  it("con código desconocido se deja tal cual", () => {
    assert.equal(detectPhoneCountry("+0123456"), null);
  });

  it("uno local de Costa Rica se detecta", () => {
    assert.equal(detectPhoneCountry("8888-7777")?.iso, "CR");
    assert.equal(detectPhoneCountry("")?.iso, "CR");
  });
});

describe("comparar y enlazar", () => {
  it("isSamePhone, toInternationalDigits y toTelHref siguen igual", () => {
    assert.equal(isSamePhone("8888-7777", "+506 8888-7777"), true);
    assert.equal(isSamePhone("+1 3055551234", "+34 3055551234"), false);
    assert.equal(toInternationalDigits("8888-7777"), "50688887777");
    assert.equal(toTelHref("8888-7777"), "tel:+50688887777");
    assert.equal(toTelHref("+1 3055551234"), "tel:+13055551234");
  });
});

describe("buscador de países", () => {
  it("encuentra por nombre sin acentos, ISO y código", () => {
    assert.equal(searchCountries("espana")[0]?.iso, "ES");
    assert.equal(searchCountries("CR")[0]?.iso, "CR");
    assert.ok(searchCountries("+34").some((country) => country.iso === "ES"));
    assert.equal(searchCountries("zzzzzz").length, 0);
  });
});

describe("entrada con país extranjero elegido", () => {
  it("a. quita el código repetido sin +", () => {
    assert.ok(colombia && unitedStates);
    assert.equal(
      composePhoneValue(colombia, "57 300 1234567"),
      "+57 3001234567",
    );
    assert.equal(
      composePhoneValue(unitedStates, "1 305 555 1234"),
      "+1 3055551234",
    );
    assert.equal(composePhoneValue(colombia, "300 1234567"), "+57 3001234567");
  });

  it("b. quita el 0 de larga distancia inicial", () => {
    assert.ok(unitedKingdom);
    assert.equal(
      composePhoneValue(unitedKingdom, "07911 123456"),
      "+44 7911123456",
    );
  });

  it("d. con Costa Rica, + y 8 dígitos ticos son de Costa Rica", () => {
    assert.equal(composePhoneValue(DEFAULT_COUNTRY, "+22223333"), "2222-3333");
    assert.equal(composePhoneValue(DEFAULT_COUNTRY, "+2222-3333"), "2222-3333");
    assert.equal(toPatientPhone("2222-3333"), "+506 2222-3333");
    // Otro código reconocible no es ese caso: manda su país.
    assert.equal(
      composePhoneValue(DEFAULT_COUNTRY, "+34 612345678"),
      "+34 612345678",
    );
    assert.equal(detectPhoneCountry("+34 612345678")?.iso, "ES");
    // Con otro país elegido no aplica.
    assert.ok(spain);
    assert.equal(composePhoneValue(spain, "+22223333"), "+222 23333");
  });
});

describe("cambiar de país con un número cargado", () => {
  it("e. no corta dígitos y deja que la validación avise", () => {
    assert.ok(unitedStates);
    const value = switchPhoneCountry(DEFAULT_COUNTRY, "3055551234");
    assert.equal(value, "3055-551234");
    assert.equal(validatePhone(value), PhoneError.LOCAL_FORMAT);
    assert.equal(detectPhoneCountry(value, DEFAULT_COUNTRY)?.iso, "CR");
    assert.equal(toNationalInput(value, DEFAULT_COUNTRY), "3055-551234");
    // De Costa Rica a otro país los dígitos se conservan.
    assert.equal(
      switchPhoneCountry(unitedStates, "8888-7777"),
      "+1 88887777",
    );
    assert.equal(switchPhoneCountry(unitedStates, ""), "");
  });
});

describe("valor viejo sin tocar", () => {
  it("f. no se reescribe si el campo no cambió", () => {
    const stored = "+13055551234";
    const shown = formatPhoneForDisplay(stored);
    assert.equal(normalizePhoneUnlessUnchanged(shown, stored), stored);
    assert.equal(toPatientPhone(stored, true), stored);
    // Si lo tocó, se guarda en el formato de siempre.
    assert.equal(
      normalizePhoneUnlessUnchanged("+1 305 555 9999", stored),
      "+1 3055559999",
    );
    assert.equal(normalizePhoneUnlessUnchanged(shown), "+1 3055551234");
  });
});
