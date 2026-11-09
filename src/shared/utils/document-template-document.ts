/**
 * Conversión entre el markdown que se guarda (el mismo que lee el PDF) y el documento del editor.
 * Cada línea del markdown es un bloque: línea vacía = párrafo vacío, `# ` = título, `- ` y `1. `
 * = elementos de lista (las líneas seguidas forman una sola lista).
 */

export enum DocumentNodeType {
  DOC = 'doc',
  PARAGRAPH = 'paragraph',
  HEADING = 'heading',
  BULLET_LIST = 'bulletList',
  ORDERED_LIST = 'orderedList',
  LIST_ITEM = 'listItem',
  TEXT = 'text',
  VARIABLE = 'variable',
}

export enum DocumentMarkType {
  BOLD = 'bold',
  ITALIC = 'italic',
  STRIKE = 'strike',
}

export interface DocumentNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: DocumentNode[];
  text?: string;
  marks?: { type: string }[];
}

const MARK_MARKERS: Record<DocumentMarkType, string> = {
  [DocumentMarkType.BOLD]: '**',
  [DocumentMarkType.ITALIC]: '*',
  [DocumentMarkType.STRIKE]: '~~',
};

const MARK_ORDER = [DocumentMarkType.BOLD, DocumentMarkType.ITALIC, DocumentMarkType.STRIKE];

const HEADING_PATTERN = /^(#{1,3})\s+(.*)$/;
const BULLET_PATTERN = /^[-*]\s+(.*)$/;
const NUMBERED_PATTERN = /^(\d+)\.\s+(.*)$/;
const VARIABLE_AT_START = /^\{\{([^{}]*)\}\}/;

export const MAX_HEADING_LEVEL = 3;
const DEFAULT_ORDERED_START = 1;
const BULLET_PREFIX = '- ';

function variableNode(name: string, marks: DocumentMarkType[]): DocumentNode {
  return {
    type: DocumentNodeType.VARIABLE,
    attrs: { name },
    ...(marks.length ? { marks: marks.map((type) => ({ type })) } : {}),
  };
}

/** Parte el texto de una línea en tramos con formato y variables, igual que el PDF. */
function parseInline(text: string, isHeading: boolean): DocumentNode[] {
  const nodes: DocumentNode[] = [];
  const active = new Set<DocumentMarkType>();
  let buffer = '';

  const currentMarks = () => MARK_ORDER.filter((mark) => active.has(mark));
  const flush = () => {
    if (!buffer) return;
    const marks = currentMarks();
    nodes.push({
      type: DocumentNodeType.TEXT,
      text: buffer,
      ...(marks.length ? { marks: marks.map((type) => ({ type })) } : {}),
    });
    buffer = '';
  };
  const toggle = (mark: DocumentMarkType) => {
    // En un título el PDF ya lo dibuja en negrita: sus `**` no agregan nada.
    if (isHeading && mark === DocumentMarkType.BOLD) return;
    flush();
    if (active.has(mark)) active.delete(mark);
    else active.add(mark);
  };

  for (let index = 0; index < text.length; ) {
    const rest = text.slice(index);
    const variable = VARIABLE_AT_START.exec(rest);
    if (variable) {
      flush();
      nodes.push(variableNode(variable[1].trim(), currentMarks()));
      index += variable[0].length;
    } else if (rest.startsWith('**')) {
      toggle(DocumentMarkType.BOLD);
      index += 2;
    } else if (rest.startsWith('~~')) {
      toggle(DocumentMarkType.STRIKE);
      index += 2;
    } else if (rest.startsWith('*')) {
      toggle(DocumentMarkType.ITALIC);
      index += 1;
    } else {
      buffer += rest[0];
      index += 1;
    }
  }
  flush();
  return nodes;
}

function block(type: DocumentNodeType, content: DocumentNode[], attrs?: DocumentNode['attrs']) {
  return { type, ...(attrs ? { attrs } : {}), ...(content.length ? { content } : {}) };
}

function appendListItem(
  blocks: DocumentNode[],
  listType: DocumentNodeType,
  item: DocumentNode,
  start?: number,
) {
  const last = blocks[blocks.length - 1];
  if (last?.type === listType) {
    last.content = [...(last.content ?? []), item];
    return;
  }
  blocks.push(block(listType, [item], start === undefined ? undefined : { start }));
}

export function markdownToDocument(markdown: string): DocumentNode {
  const blocks: DocumentNode[] = [];

  for (const line of markdown.split(/\r?\n/)) {
    const heading = HEADING_PATTERN.exec(line);
    const bullet = BULLET_PATTERN.exec(line);
    const numbered = NUMBERED_PATTERN.exec(line);
    if (!line.trim()) {
      blocks.push(block(DocumentNodeType.PARAGRAPH, []));
    } else if (heading) {
      blocks.push(
        block(DocumentNodeType.HEADING, parseInline(heading[2], true), {
          level: heading[1].length,
        }),
      );
    } else if (bullet) {
      const paragraph = block(DocumentNodeType.PARAGRAPH, parseInline(bullet[1], false));
      appendListItem(
        blocks,
        DocumentNodeType.BULLET_LIST,
        block(DocumentNodeType.LIST_ITEM, [paragraph]),
      );
    } else if (numbered) {
      const paragraph = block(DocumentNodeType.PARAGRAPH, parseInline(numbered[2], false));
      appendListItem(
        blocks,
        DocumentNodeType.ORDERED_LIST,
        block(DocumentNodeType.LIST_ITEM, [paragraph]),
        Number(numbered[1]),
      );
    } else {
      blocks.push(block(DocumentNodeType.PARAGRAPH, parseInline(line, false)));
    }
  }

  return { type: DocumentNodeType.DOC, content: blocks };
}

function serializeInline(nodes: DocumentNode[] | undefined, isHeading: boolean): string {
  let output = '';
  const open: DocumentMarkType[] = [];

  for (const node of nodes ?? []) {
    const marks = (node.marks ?? []).map((mark) => mark.type);
    const wanted = MARK_ORDER.filter((mark) => !isHeading || mark !== DocumentMarkType.BOLD).filter(
      (mark) => marks.includes(mark),
    );

    const firstToClose = open.findIndex((mark) => !wanted.includes(mark));
    if (firstToClose >= 0) {
      while (open.length > firstToClose) output += MARK_MARKERS[open.pop() as DocumentMarkType];
    }
    for (const mark of wanted) {
      if (open.includes(mark)) continue;
      open.push(mark);
      output += MARK_MARKERS[mark];
    }

    output +=
      node.type === DocumentNodeType.VARIABLE ? `{{${String(node.attrs?.name ?? '')}}}` : (node.text ?? '');
  }

  while (open.length) output += MARK_MARKERS[open.pop() as DocumentMarkType];
  return output;
}

function serializeList(list: DocumentNode): string[] {
  const start = Number(list.attrs?.start ?? DEFAULT_ORDERED_START);
  const isOrdered = list.type === DocumentNodeType.ORDERED_LIST;
  return (list.content ?? []).flatMap((item, itemIndex) =>
    (item.content ?? []).map((paragraph) => {
      const prefix = isOrdered ? `${start + itemIndex}. ` : BULLET_PREFIX;
      return `${prefix}${serializeInline(paragraph.content, false)}`;
    }),
  );
}

export function documentToMarkdown(document: DocumentNode): string {
  const lines = (document.content ?? []).flatMap((node): string[] => {
    if (node.type === DocumentNodeType.HEADING) {
      const level = Math.min(Number(node.attrs?.level ?? 1), MAX_HEADING_LEVEL);
      return [`${'#'.repeat(level)} ${serializeInline(node.content, true)}`];
    }
    if (node.type === DocumentNodeType.BULLET_LIST || node.type === DocumentNodeType.ORDERED_LIST) {
      return serializeList(node);
    }
    return [serializeInline(node.content, false)];
  });
  return lines.join('\n');
}
