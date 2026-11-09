import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildPrintFileName } from './print-file-name';

describe('nombre del archivo impreso', () => {
  it('arma tipo, clínica, paciente y cédula', () => {
    assert.equal(
      buildPrintFileName({
        type: 'Resumen clínico',
        clinic: 'AudioColors',
        patient: 'Juan Pérez Mora',
        documentId: '112340567',
      }),
      'Resumen clínico - AudioColors - Juan Pérez Mora - 112340567',
    );
  });

  it('omite un tramo vacío sin guiones colgando', () => {
    assert.equal(
      buildPrintFileName({
        type: 'Audiometría',
        clinic: '',
        patient: 'Ana Rojas',
        documentId: null,
      }),
      'Audiometría - Ana Rojas',
    );
    assert.equal(buildPrintFileName({ type: 'Audiometría', clinic: '  ' }), 'Audiometría');
  });

  it('quita los caracteres que un archivo no admite', () => {
    assert.equal(
      buildPrintFileName({ type: 'Resumen clínico', clinic: 'A/B: "Clínica"?', patient: 'Ana' }),
      'Resumen clínico - A B Clínica - Ana',
    );
  });

  it('quita la barra invertida y los inválidos de Windows', () => {
    assert.equal(
      buildPrintFileName({ type: 'Resumen clínico', clinic: 'A\\B', patient: 'Ana|Mora' }),
      'Resumen clínico - A B - Ana Mora',
    );
  });

  it('un tramo que solo tenía caracteres inválidos se omite', () => {
    assert.equal(
      buildPrintFileName({ type: 'Resumen clínico', clinic: '***', patient: 'Ana' }),
      'Resumen clínico - Ana',
    );
  });
});
