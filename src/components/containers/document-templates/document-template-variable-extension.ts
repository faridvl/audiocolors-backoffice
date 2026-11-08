import { mergeAttributes, Node, nodeInputRule, nodePasteRule } from '@tiptap/core';
import { DocumentNodeType } from '@/shared/utils/document-template-document';
import { tailwind } from '@/utils/tailwind-utils';

const VARIABLE_ATTRIBUTE = 'data-variable';
const TYPED_VARIABLE = /\{\{[^{}]+\}\}$/;
const PASTED_VARIABLE = /\{\{[^{}]+\}\}/g;

const CHIP_CLASSES =
  'mx-0.5 inline-block select-none whitespace-nowrap rounded-md px-1.5 text-[0.9em] font-medium leading-snug [&.ProseMirror-selectednode]:ring-2';
const KNOWN_CHIP_CLASSES = 'bg-brand-50 text-brand-700 [&.ProseMirror-selectednode]:ring-brand';
const UNKNOWN_CHIP_CLASSES =
  'bg-danger/10 text-danger-700 ring-1 ring-danger [&.ProseMirror-selectednode]:ring-danger-700';

export interface VariableExtensionOptions {
  /** Nombre legible de una variable conocida; `null` si el sistema no la conoce. */
  getLabel: (name: string) => string | null;
}

// Sin grupo de captura: así la regla reemplaza todo `{{clave}}` y no solo la clave.
const readName = (match: RegExpMatchArray) => ({ name: match[0].slice(2, -2).trim() });

/** Una variable `{{clave}}` dentro del texto: una etiqueta que no se edita y se borra de una vez. */
export const VariableExtension = Node.create<VariableExtensionOptions>({
  name: DocumentNodeType.VARIABLE,
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,

  addOptions() {
    return { getLabel: () => null };
  },

  addAttributes() {
    return {
      name: {
        default: '',
        parseHTML: (element) => element.getAttribute(VARIABLE_ATTRIBUTE) ?? '',
      },
    };
  },

  parseHTML() {
    return [{ tag: `span[${VARIABLE_ATTRIBUTE}]` }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const name = String(node.attrs.name);
    const label = this.options.getLabel(name);
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        [VARIABLE_ATTRIBUTE]: name,
        contenteditable: 'false',
        class: tailwind(CHIP_CLASSES, label ? KNOWN_CHIP_CLASSES : UNKNOWN_CHIP_CLASSES),
      }),
      label ?? `{{${name}}}`,
    ];
  },

  renderText({ node }) {
    return `{{${String(node.attrs.name)}}}`;
  },

  addInputRules() {
    return [nodeInputRule({ find: TYPED_VARIABLE, type: this.type, getAttributes: readName })];
  },

  addPasteRules() {
    return [nodePasteRule({ find: PASTED_VARIABLE, type: this.type, getAttributes: readName })];
  },
});
