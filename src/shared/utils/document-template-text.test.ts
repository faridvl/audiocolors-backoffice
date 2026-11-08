import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  fillVariables,
  findUnknownVariables,
  findUsedVariables,
  variableToken,
} from './document-template-text';
import {
  DOCUMENT_TEMPLATE_VARIABLE_GROUPS,
  DOCUMENT_TEMPLATE_VARIABLES,
  DocumentTemplateVariable,
  DocumentTemplateVariableGroup,
} from '../../types/document-templates/document-template';

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

describe('variables de pruebas y clínica', () => {
  it('los grupos van en orden y las variables nuevas se reconocen', () => {
    assert.deepEqual(Object.keys(DOCUMENT_TEMPLATE_VARIABLE_GROUPS), [
      DocumentTemplateVariableGroup.PATIENT,
      DocumentTemplateVariableGroup.TESTS,
      DocumentTemplateVariableGroup.CLINIC,
      DocumentTemplateVariableGroup.DOCUMENT,
    ]);
    assert.deepEqual(
      DOCUMENT_TEMPLATE_VARIABLE_GROUPS[DocumentTemplateVariableGroup.TESTS].map(String),
      ['otoscopia_od', 'otoscopia_oi', 'diagnostico', 'observaciones'],
    );
    assert.deepEqual(
      DOCUMENT_TEMPLATE_VARIABLE_GROUPS[DocumentTemplateVariableGroup.CLINIC].map(String),
      ['clinica_nombre', 'clinica_telefono', 'clinica_correo', 'clinica_direccion'],
    );
    const grouped = Object.values(DOCUMENT_TEMPLATE_VARIABLE_GROUPS).flat();
    assert.equal(new Set(grouped).size, DOCUMENT_TEMPLATE_VARIABLES.length);
    assert.deepEqual(findUnknownVariables('{{diagnostico}} {{clinica_nombre}}'), []);
  });

  it('una variable sin dato se rellena vacía', () => {
    assert.equal(fillVariables('[{{otoscopia_od}}]', { otoscopia_od: '' }), '[]');
  });
});
