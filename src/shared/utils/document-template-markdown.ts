const HEADING_PATTERN = /^(#{1,3})\s+(.*)$/;
const BULLET_PATTERN = /^[-*]\s+(.*)$/;
const NUMBERED_PATTERN = /^(\d+)\.\s+(.*)$/;

export interface TextRun {
  text: string;
  isBold: boolean;
  isItalic: boolean;
  isStruck: boolean;
}

export enum BlockKind {
  HEADING = 'HEADING',
  PARAGRAPH = 'PARAGRAPH',
  LIST_ITEM = 'LIST_ITEM',
  BLANK = 'BLANK',
}

export interface Block {
  kind: BlockKind;
  text: string;
  /** Nivel del título (1 a 3). */
  level?: number;
  /** Viñeta o número de un elemento de lista. */
  marker?: string;
}

const BULLET_MARKER = '•';

export function parseBlocks(content: string): Block[] {
  return content.split(/\r?\n/).map((line): Block => {
    if (!line.trim()) return { kind: BlockKind.BLANK, text: '' };
    const heading = HEADING_PATTERN.exec(line);
    if (heading)
      return {
        kind: BlockKind.HEADING,
        text: heading[2],
        level: heading[1].length,
      };
    const bullet = BULLET_PATTERN.exec(line);
    if (bullet)
      return {
        kind: BlockKind.LIST_ITEM,
        text: bullet[1],
        marker: BULLET_MARKER,
      };
    const numbered = NUMBERED_PATTERN.exec(line);
    if (numbered) {
      return {
        kind: BlockKind.LIST_ITEM,
        text: numbered[2],
        marker: `${numbered[1]}.`,
      };
    }
    return { kind: BlockKind.PARAGRAPH, text: line };
  });
}

/** Parte una línea en tramos según `**negrita**`, `*cursiva*` y `~~tachado~~`. */
export function parseRuns(text: string, isHeading: boolean): TextRun[] {
  const runs: TextRun[] = [];
  let isBold = isHeading;
  let isItalic = false;
  let isStruck = false;
  let buffer = '';

  const flush = () => {
    if (buffer) runs.push({ text: buffer, isBold, isItalic, isStruck });
    buffer = '';
  };

  for (let index = 0; index < text.length;) {
    if (text.startsWith('**', index)) {
      flush();
      isBold = isHeading ? true : !isBold;
      index += 2;
    } else if (text.startsWith('~~', index)) {
      flush();
      isStruck = !isStruck;
      index += 2;
    } else if (text[index] === '*') {
      flush();
      isItalic = !isItalic;
      index += 1;
    } else {
      buffer += text[index];
      index += 1;
    }
  }
  flush();
  return runs;
}
