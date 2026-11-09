import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  DocumentNodeType,
  documentToMarkdown,
  markdownToDocument,
} from './document-template-document';

const roundTrip = (markdown: string) => documentToMarkdown(markdownToDocument(markdown));

describe('markdown a documento', () => {
  it('un texto vacío es un solo párrafo vacío', () => {
    assert.deepEqual(markdownToDocument(''), {
      type: DocumentNodeType.DOC,
      content: [{ type: DocumentNodeType.PARAGRAPH }],
    });
  });

  it('el título guarda su nivel y no lleva negrita propia', () => {
    const doc = markdownToDocument('## Consentimiento **informado**');
    assert.equal(doc.content?.[0].type, DocumentNodeType.HEADING);
    assert.deepEqual(doc.content?.[0].attrs, { level: 2 });
    assert.deepEqual(doc.content?.[0].content, [
      { type: DocumentNodeType.TEXT, text: 'Consentimiento informado' },
    ]);
  });

  it('negrita, cursiva y tachado se vuelven marcas del texto', () => {
    const doc = markdownToDocument('a **b** *c* ~~d~~');
    assert.deepEqual(doc.content?.[0].content, [
      { type: DocumentNodeType.TEXT, text: 'a ' },
      { type: DocumentNodeType.TEXT, text: 'b', marks: [{ type: 'bold' }] },
      { type: DocumentNodeType.TEXT, text: ' ' },
      { type: DocumentNodeType.TEXT, text: 'c', marks: [{ type: 'italic' }] },
      { type: DocumentNodeType.TEXT, text: ' ' },
      { type: DocumentNodeType.TEXT, text: 'd', marks: [{ type: 'strike' }] },
    ]);
  });

  it('las líneas seguidas con viñeta forman una sola lista', () => {
    const doc = markdownToDocument('- uno\n- dos\ntexto\n- tres');
    assert.deepEqual(
      doc.content?.map((node) => node.type),
      [DocumentNodeType.BULLET_LIST, DocumentNodeType.PARAGRAPH, DocumentNodeType.BULLET_LIST],
    );
    assert.equal(doc.content?.[0].content?.length, 2);
  });

  it('la lista numerada recuerda su primer número', () => {
    const doc = markdownToDocument('3. a\n4. b');
    assert.deepEqual(doc.content?.[0].attrs, { start: 3 });
  });

  it('una variable es un nodo con su clave, conocida o no', () => {
    const doc = markdownToDocument('Hola {{ nombre_completo }} y {{xyz}}');
    assert.deepEqual(doc.content?.[0].content?.slice(1), [
      { type: DocumentNodeType.VARIABLE, attrs: { name: 'nombre_completo' } },
      { type: DocumentNodeType.TEXT, text: ' y ' },
      { type: DocumentNodeType.VARIABLE, attrs: { name: 'xyz' } },
    ]);
  });
});

describe('ida y vuelta del markdown', () => {
  const stable = [
    '',
    'Un párrafo simple.',
    '# Título',
    '## Subtítulo\n### Menor',
    '**negrita** y *cursiva* y ~~tachado~~',
    '***negrita y cursiva***',
    'Se hace constar que {{nombre_completo}} acepta.',
    '**{{nombre}}** y *{{apellidos}}*',
    '- uno\n- dos\n- tres',
    '1. uno\n2. dos\n3. tres',
    'Antes\n\nDespués\n\n\nTres saltos',
    '# Consentimiento\n\nYo, **{{nombre_completo}}**, con {{tipo_documento}} {{documento}}:\n\n- acepto el *tratamiento*\n- autorizo ~~algo~~ el uso\n\n1. primero\n2. segundo\n\nFecha: {{fecha_hoy}}\n',
    'texto **negrita *y cursiva* sigue** fin',
    '- **{{nombre}}** firma',
    '{{variable_que_no_existe}}',
  ];

  for (const markdown of stable) {
    it(`conserva ${JSON.stringify(markdown).slice(0, 60)}`, () => {
      assert.equal(roundTrip(markdown), markdown);
    });
  }

  it('normaliza los espacios dentro de las llaves de una variable', () => {
    assert.equal(roundTrip('{{ nombre }}'), '{{nombre}}');
  });

  it('lee los saltos de línea de Windows como saltos normales', () => {
    assert.equal(roundTrip('a\r\n\r\n- b'), 'a\n\n- b');
  });

  it('una marca que nunca se cierra se cierra al final de la línea', () => {
    assert.equal(roundTrip('a **b'), 'a **b**');
  });
});
