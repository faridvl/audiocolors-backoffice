import {
  DOCUMENT_TEMPLATE_VARIABLES,
  DocumentTemplateVariable,
} from '../../types/document-templates/document-template';

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
