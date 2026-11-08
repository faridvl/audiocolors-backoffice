import {
  DOCUMENT_TEMPLATE_VARIABLES,
  DocumentTemplateVariable,
} from '@/types/document-templates/document-template';

const VARIABLE_PATTERN = /\{\{([^{}]*)\}\}/g;

const KNOWN_VARIABLES = new Set<string>(DOCUMENT_TEMPLATE_VARIABLES);

/** Cómo se escribe una variable en el texto. */
export const variableToken = (variable: DocumentTemplateVariable) => `{{${variable}}}`;

/** Los nombres entre `{{ }}` del texto, sin repetir, en el orden en que aparecen. */
function readVariableNames(content: string): string[] {
  const names = Array.from(content.matchAll(VARIABLE_PATTERN), (match) => match[1].trim());
  return Array.from(new Set(names));
}

/** Variables entre `{{ }}` que el sistema no conoce: bloquean el guardado. */
export function findUnknownVariables(content: string): string[] {
  return readVariableNames(content).filter((name) => !KNOWN_VARIABLES.has(name));
}

/** Variables del sistema que el texto ya usa. */
export function findUsedVariables(content: string): Set<string> {
  return new Set(readVariableNames(content).filter((name) => KNOWN_VARIABLES.has(name)));
}

/** Cambia cada variable conocida por su valor; una desconocida se deja como está. */
export function fillVariables(content: string, values: Record<string, string>): string {
  return content.replace(VARIABLE_PATTERN, (whole, rawName: string) => {
    const name = rawName.trim();
    return KNOWN_VARIABLES.has(name) ? (values[name] ?? whole) : whole;
  });
}

export enum TextFormat {
  BOLD = 'BOLD',
  ITALIC = 'ITALIC',
  STRIKE = 'STRIKE',
  HEADING = 'HEADING',
  BULLET_LIST = 'BULLET_LIST',
  NUMBERED_LIST = 'NUMBERED_LIST',
}

const INLINE_MARKERS: Partial<Record<TextFormat, string>> = {
  [TextFormat.BOLD]: '**',
  [TextFormat.ITALIC]: '*',
  [TextFormat.STRIKE]: '~~',
};

export const HEADING_PREFIX = '# ';
export const BULLET_PREFIX = '- ';

export interface TextEdit {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

/** Cambia `[start, end)` de `value` por `text` y deja el cursor al final de lo insertado. */
export function insertAtSelection(
  value: string,
  start: number,
  end: number,
  text: string,
): TextEdit {
  const cursor = start + text.length;
  return {
    value: value.slice(0, start) + text + value.slice(end),
    selectionStart: cursor,
    selectionEnd: cursor,
  };
}

function wrapInline(value: string, start: number, end: number, marker: string): TextEdit {
  const selected = value.slice(start, end);
  const edit = insertAtSelection(value, start, end, `${marker}${selected}${marker}`);
  // Sin selección el cursor queda entre las marcas, listo para escribir.
  const selectionStart = start + marker.length;
  return { ...edit, selectionStart, selectionEnd: selectionStart + selected.length };
}

function prefixLines(
  value: string,
  start: number,
  end: number,
  prefixFor: (lineIndex: number) => string,
): TextEdit {
  const blockStart = value.lastIndexOf('\n', start - 1) + 1;
  const nextBreak = value.indexOf('\n', end);
  const blockEnd = nextBreak === -1 ? value.length : nextBreak;
  const block = value
    .slice(blockStart, blockEnd)
    .split('\n')
    .map((line, index) => `${prefixFor(index)}${line}`)
    .join('\n');
  const edited = value.slice(0, blockStart) + block + value.slice(blockEnd);
  const cursor = blockStart + block.length;
  return { value: edited, selectionStart: cursor, selectionEnd: cursor };
}

/** Aplica el formato markdown a la selección (o a la línea del cursor para títulos y listas). */
export function applyTextFormat(
  value: string,
  start: number,
  end: number,
  format: TextFormat,
): TextEdit {
  const marker = INLINE_MARKERS[format];
  if (marker) return wrapInline(value, start, end, marker);
  if (format === TextFormat.HEADING) return prefixLines(value, start, end, () => HEADING_PREFIX);
  if (format === TextFormat.BULLET_LIST) return prefixLines(value, start, end, () => BULLET_PREFIX);
  return prefixLines(value, start, end, (index) => `${index + 1}. `);
}
