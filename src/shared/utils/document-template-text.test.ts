import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  fillVariables,
  findUnknownVariables,
  findUsedVariables,
  variableToken,
} from './document-template-text';
import { DocumentTemplateVariable } from '../../types/document-templates/document-template';

const TEXT_WITH_VARIABLES = 'Se hace constar que {{nombre_completo}} nació el {{ fecha_nacimiento }}.';

describe('variables del texto', () => {
  it('la etiqueta de una variable lleva dobles llaves', () => {
    assert.equal(variableToken(DocumentTemplateVariable.FULL_NAME), '{{nombre_completo}}');
  });

  it('las variables en uso salen sin repetir y sin espacios', () => {
    const used = findUsedVariables(`${TEXT_WITH_VARIABLES} {{nombre_completo}} {{no_existe}}`);
    assert.deepEqual(Array.from(used), ['nombre_completo', 'fecha_nacimiento']);
  });

  it('una variable desconocida se reporta', () => {
    assert.deepEqual(findUnknownVariables('{{nombre}} {{xyz}} {{}}'), ['xyz', '']);
    assert.deepEqual(findUnknownVariables(TEXT_WITH_VARIABLES), []);
  });

  it('rellenar cambia las conocidas y deja las desconocidas', () => {
    const filled = fillVariables('{{nombre}} {{ edad }} {{xyz}}', { nombre: 'María', edad: '41' });
    assert.equal(filled, 'María 41 {{xyz}}');
  });
});
