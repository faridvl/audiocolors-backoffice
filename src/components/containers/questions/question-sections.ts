import type { ReactNode } from 'react';
import type { TFunction } from 'i18next';
import { TEXT } from '@/static/texts/i18n';

export enum QuestionSectionState {
  COMPLETE = 'COMPLETE',
  /** Todavía no se ha llenado. */
  UNFILLED = 'UNFILLED',
  /** Hay cambios escritos que aún no se guardan. */
  DRAFT = 'DRAFT',
}

/** Lo que cada sección necesita para abrirse y cerrarse bajo el control de "Preguntas". */
export interface QuestionSectionControls {
  isExpanded: boolean;
  onToggle: () => void;
  onExpand: () => void;
}

/**
 * Una sección de "Preguntas". Las fijas y las que cree la clínica (con nombre propio, sin clave
 * de i18n) se arman en el hook de cada pantalla con esta misma forma.
 */
export interface QuestionSectionBase {
  key: string;
  title: string;
  state: QuestionSectionState;
}

/** En el expediente, abrir una sección cierra las demás: el control lo da "Preguntas". */
export interface QuestionSectionEntry extends QuestionSectionBase {
  render: (controls: QuestionSectionControls) => ReactNode;
}

export interface SettingsQuestionSection extends QuestionSectionBase {
  render: () => ReactNode;
}

export interface QuestionsSubtitle {
  text: string;
  hasDraft: boolean;
}

/** Con "Preguntas" cerrada: solo lo pendiente; sin pendientes, qué secciones hay. */
export function buildQuestionsSubtitle(
  t: TFunction,
  sections: QuestionSectionBase[],
): QuestionsSubtitle {
  const pending = sections.filter((section) => section.state !== QuestionSectionState.COMPLETE);
  const hasDraft = pending.some((section) => section.state === QuestionSectionState.DRAFT);

  if (pending.length === 1) {
    const [section] = pending;
    const key = hasDraft ? TEXT.QUESTIONS.DRAFT_SECTION : TEXT.QUESTIONS.UNFILLED_SECTION;
    return { text: t(key, { title: section.title }), hasDraft };
  }
  if (pending.length > 1) {
    const key = hasDraft ? TEXT.QUESTIONS.PENDING_WITH_DRAFT : TEXT.QUESTIONS.UNFILLED_SECTIONS;
    return { text: t(key, { count: pending.length }), hasDraft };
  }
  if (sections.length === 1) return { text: sections[0].title, hasDraft: false };
  return { text: t(TEXT.QUESTIONS.SECTIONS_COUNT, { count: sections.length }), hasDraft: false };
}
