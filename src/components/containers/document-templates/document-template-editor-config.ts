import type { Extensions } from '@tiptap/core';
import ListItem from '@tiptap/extension-list-item';
import Placeholder from '@tiptap/extension-placeholder';
import StarterKit from '@tiptap/starter-kit';
import { tailwind } from '@/utils/tailwind-utils';
import { VariableExtension } from './document-template-variable-extension';

/** Solo lo que el markdown guardado puede expresar: negrita, cursiva, tachado, títulos y listas. */
export function buildEditorExtensions(options: {
  placeholder: string;
  getVariableLabel: (name: string) => string | null;
}): Extensions {
  return [
    StarterKit.configure({
      blockquote: false,
      code: false,
      codeBlock: false,
      hardBreak: false,
      horizontalRule: false,
      listItem: false,
      heading: { levels: [1, 2, 3] },
    }),
    // Un elemento de lista es una sola línea: el markdown no anida listas.
    ListItem.extend({ content: 'paragraph' }),
    VariableExtension.configure({ getLabel: options.getVariableLabel }),
    Placeholder.configure({ placeholder: options.placeholder }),
  ];
}

const PROSE_CLASSES = [
  'text-base leading-relaxed text-ink-800',
  '[&_p]:m-0 [&_p]:min-h-[1.625em]',
  '[&_h1]:m-0 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:leading-snug',
  '[&_h2]:m-0 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:leading-snug',
  '[&_h3]:m-0 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:leading-snug',
  '[&_ul]:m-0 [&_ul]:list-disc [&_ul]:pl-6',
  '[&_ol]:m-0 [&_ol]:list-decimal [&_ol]:pl-6',
  '[&_s]:line-through',
  '[&_p.is-editor-empty:first-child]:before:pointer-events-none [&_p.is-editor-empty:first-child]:before:float-left [&_p.is-editor-empty:first-child]:before:h-0 [&_p.is-editor-empty:first-child]:before:text-ink-400 [&_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]',
].join(' ');

/** La hoja: blanca, con sombra suave, márgenes amplios y una altura cómoda para escribir. */
const SHEET_CLASSES =
  'mx-auto min-h-[320px] w-full max-w-3xl rounded-sm bg-white px-5 py-6 shadow-md outline-none focus-visible:ring-2 focus-visible:ring-brand sm:min-h-[480px] sm:px-12 sm:py-10';

export const SHEET_ERROR_CLASSES = 'ring-2 ring-danger focus-visible:ring-danger';

export const CONTENT_ID = 'content';
export const CONTENT_LABEL_ID = 'content-label';
export const CONTENT_ERROR_ID = 'content-error';

export function buildEditorAttributes(hasError: boolean): Record<string, string> {
  return {
    id: CONTENT_ID,
    role: 'textbox',
    'aria-multiline': 'true',
    'aria-labelledby': CONTENT_LABEL_ID,
    'aria-required': 'true',
    'aria-invalid': hasError ? 'true' : 'false',
    ...(hasError ? { 'aria-describedby': CONTENT_ERROR_ID } : {}),
    class: tailwind(SHEET_CLASSES, PROSE_CLASSES, hasError && SHEET_ERROR_CLASSES),
  };
}

export const SHEET_BACKDROP_CLASSES = 'bg-ink-100 p-3 sm:p-6';
