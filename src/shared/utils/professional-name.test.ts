import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatProfessionalName } from './professional-name';

const LICENSE_PREFIX = 'Cód.';

describe('formatProfessionalName', () => {
  it('une título, nombre y colegiado', () => {
    assert.equal(
      formatProfessionalName({
        title: 'Lic.',
        fullName: 'Ana Mora',
        licenseNumber: '1234',
        licensePrefix: LICENSE_PREFIX,
      }),
      'Lic. Ana Mora · Cód. 1234',
    );
  });

  it('sin colegiado deja solo título y nombre', () => {
    assert.equal(
      formatProfessionalName({
        title: 'Lic.',
        fullName: 'Ana Mora',
        licenseNumber: null,
        licensePrefix: LICENSE_PREFIX,
      }),
      'Lic. Ana Mora',
    );
  });

  it('sin título deja nombre y colegiado', () => {
    assert.equal(
      formatProfessionalName({
        title: null,
        fullName: 'Ana Mora',
        licenseNumber: '1234',
        licensePrefix: LICENSE_PREFIX,
      }),
      'Ana Mora · Cód. 1234',
    );
  });

  it('sin título ni colegiado deja el nombre; los espacios y el colegiado vacío no cuentan', () => {
    assert.equal(
      formatProfessionalName({
        title: ' ',
        fullName: ' Ana Mora ',
        licenseNumber: '  ',
        licensePrefix: LICENSE_PREFIX,
      }),
      'Ana Mora',
    );
  });
});
