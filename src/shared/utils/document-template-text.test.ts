import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { applyTextFormat, TextFormat } from './document-template-text';

const TEXT_WITH_VARIABLE = 'Se hace constar que {{nombre_completo}} acepta.';

describe('applyTextFormat sin selección', () => {
  it('negrita inserta cuatro asteriscos y deja el cursor en medio', () => {
    const edit = applyTextFormat(TEXT_WITH_VARIABLE, 20, 20, TextFormat.BOLD);
    assert.equal(edit.value, 'Se hace constar que ****{{nombre_completo}} acepta.');
    assert.equal(edit.selectionStart, 22);
    assert.equal(edit.selectionEnd, 22);
  });

  it('negrita al final del texto no altera lo anterior', () => {
    const edit = applyTextFormat('hola', 4, 4, TextFormat.BOLD);
    assert.equal(edit.value, 'hola****');
    assert.equal(edit.selectionStart, 6);
    assert.equal(edit.selectionEnd, 6);
  });

  it('negrita en un texto vacío deja el cursor entre los pares', () => {
    const edit = applyTextFormat('', 0, 0, TextFormat.BOLD);
    assert.equal(edit.value, '****');
    assert.equal(edit.selectionStart, 2);
    assert.equal(edit.selectionEnd, 2);
  });

  it('cursiva y tachado dejan el cursor entre sus marcas', () => {
    const italic = applyTextFormat('ab', 1, 1, TextFormat.ITALIC);
    assert.equal(italic.value, 'a**b');
    assert.equal(italic.selectionStart, 2);
    assert.equal(italic.selectionEnd, 2);

    const strike = applyTextFormat('ab', 1, 1, TextFormat.STRIKE);
    assert.equal(strike.value, 'a~~~~b');
    assert.equal(strike.selectionStart, 3);
    assert.equal(strike.selectionEnd, 3);
  });
});

describe('applyTextFormat con selección', () => {
  it('negrita envuelve lo seleccionado y lo deja seleccionado', () => {
    const edit = applyTextFormat('hola mundo', 0, 4, TextFormat.BOLD);
    assert.equal(edit.value, '**hola** mundo');
    assert.equal(edit.selectionStart, 2);
    assert.equal(edit.selectionEnd, 6);
  });

  it('cursiva envuelve lo seleccionado', () => {
    const edit = applyTextFormat('hola mundo', 5, 10, TextFormat.ITALIC);
    assert.equal(edit.value, 'hola *mundo*');
    assert.equal(edit.selectionStart, 6);
    assert.equal(edit.selectionEnd, 11);
  });
});
