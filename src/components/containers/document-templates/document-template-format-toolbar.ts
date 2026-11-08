import type { Editor } from '@tiptap/core';
import {
  Bold,
  Heading,
  Italic,
  List,
  ListOrdered,
  type LucideIcon,
  Strikethrough,
} from 'lucide-react';
import { DocumentMarkType, DocumentNodeType } from '@/shared/utils/document-template-document';
import { TEXT } from '@/static/texts/i18n';

export enum EditorFormat {
  BOLD = 'bold',
  ITALIC = 'italic',
  STRIKE = 'strike',
  HEADING = 'heading',
  BULLET_LIST = 'bulletList',
  NUMBERED_LIST = 'orderedList',
}

const HEADING_LEVEL = 1;

interface ToolbarAction {
  format: EditorFormat;
  icon: LucideIcon;
  labelKey: string;
  isActive: (editor: Editor) => boolean;
  run: (editor: Editor) => void;
}

export const TOOLBAR_ACTIONS: ToolbarAction[] = [
  {
    format: EditorFormat.BOLD,
    icon: Bold,
    labelKey: TEXT.DOCUMENT_TEMPLATES.TOOLBAR.BOLD,
    isActive: (editor) => editor.isActive(DocumentMarkType.BOLD),
    run: (editor) => editor.chain().focus().toggleBold().run(),
  },
  {
    format: EditorFormat.ITALIC,
    icon: Italic,
    labelKey: TEXT.DOCUMENT_TEMPLATES.TOOLBAR.ITALIC,
    isActive: (editor) => editor.isActive(DocumentMarkType.ITALIC),
    run: (editor) => editor.chain().focus().toggleItalic().run(),
  },
  {
    format: EditorFormat.STRIKE,
    icon: Strikethrough,
    labelKey: TEXT.DOCUMENT_TEMPLATES.TOOLBAR.STRIKE,
    isActive: (editor) => editor.isActive(DocumentMarkType.STRIKE),
    run: (editor) => editor.chain().focus().toggleStrike().run(),
  },
  {
    format: EditorFormat.HEADING,
    icon: Heading,
    labelKey: TEXT.DOCUMENT_TEMPLATES.TOOLBAR.HEADING,
    isActive: (editor) => editor.isActive(DocumentNodeType.HEADING),
    run: (editor) => editor.chain().focus().toggleHeading({ level: HEADING_LEVEL }).run(),
  },
  {
    format: EditorFormat.BULLET_LIST,
    icon: List,
    labelKey: TEXT.DOCUMENT_TEMPLATES.TOOLBAR.BULLET_LIST,
    isActive: (editor) => editor.isActive(DocumentNodeType.BULLET_LIST),
    run: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    format: EditorFormat.NUMBERED_LIST,
    icon: ListOrdered,
    labelKey: TEXT.DOCUMENT_TEMPLATES.TOOLBAR.NUMBERED_LIST,
    isActive: (editor) => editor.isActive(DocumentNodeType.ORDERED_LIST),
    run: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
];
