import { mergeAttributes, Node } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { DocumentNodeType } from '@/shared/utils/document-template-document';
import { tailwind } from '@/utils/tailwind-utils';

const VARIABLE_ATTRIBUTE = 'data-variable';
const VARIABLE_IN_TEXT = /\{\{[^{}]+\}\}/g;
const variableTextKey = new PluginKey('document-template-variable-text');

const CHIP_CLASSES =
  'mx-0.5 inline-block select-none whitespace-nowrap rounded-md px-1.5 text-[0.9em] font-medium leading-snug [&.ProseMirror-selectednode]:ring-2';
const KNOWN_CHIP_CLASSES = 'bg-brand-50 text-brand-700 [&.ProseMirror-selectednode]:ring-brand';
const UNKNOWN_CHIP_CLASSES =
  'bg-danger/10 text-danger-700 ring-1 ring-danger [&.ProseMirror-selectednode]:ring-danger-700';

export interface VariableExtensionOptions {
  /** Nombre legible de una variable conocida; `null` si el sistema no la conoce. */
  getLabel: (name: string) => string | null;
}

const readName = (match: RegExpMatchArray) => match[0].slice(2, -2).trim();

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

  // No es una regla de entrada: TipTap calcula mal la posición cuando el texto llega de un solo
  // golpe (dictado, autocompletado) y el editor se cae. Revisar el texto tras cada cambio cubre
  // teclear, pegar y dictar por igual.
  addProseMirrorPlugins() {
    const variableType = this.type;
    return [
      new Plugin({
        key: variableTextKey,
        appendTransaction: (transactions, _oldState, newState) => {
          if (!transactions.some((transaction) => transaction.docChanged)) return null;
          const tr = newState.tr;
          newState.doc.descendants((node, position) => {
            if (!node.isText || !node.text?.includes('{{')) return;
            for (const match of node.text.matchAll(VARIABLE_IN_TEXT)) {
              const from = tr.mapping.map(position + (match.index ?? 0));
              const to = tr.mapping.map(position + (match.index ?? 0) + match[0].length);
              tr.replaceWith(from, to, variableType.create({ name: readName(match) }, null, node.marks));
            }
          });
          return tr.docChanged ? tr : null;
        },
      }),
    ];
  },
});
