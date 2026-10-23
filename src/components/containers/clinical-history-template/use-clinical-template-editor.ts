import { useState } from 'react';
import { useFormikContext } from 'formik';
import { CLINICAL_TEMPLATE_MAX_FIELDS } from '@/types/clinical-templates/clinical-template';
import {
  buildEmptyQuestion,
  ClinicalQuestionGroup,
  ClinicalTemplateFormValues,
  groupQuestionsBySection,
  moveQuestion,
  renameSection,
} from './clinical-template-form';

const DRAG_DATA_TYPE = 'text/plain';

/** Lo que se suelta: delante de una pregunta, o al final de una sección. */
export interface DropTarget {
  groupKey: string;
  beforeIndex: number | null;
}

export interface QuestionDragProps {
  onDragStart: (event: React.DragEvent) => void;
  onDragEnd: () => void;
}

export interface DropZoneProps {
  onDragOver: (event: React.DragEvent) => void;
  onDrop: (event: React.DragEvent) => void;
}

/** Edición de las preguntas dentro del Formik: arrastrar, renombrar secciones, agregar y quitar. */
export function useClinicalTemplateEditor() {
  const { values, setFieldValue } = useFormikContext<ClinicalTemplateFormValues>();
  const { questions } = values;
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const [newSectionName, setNewSectionName] = useState('');

  const groups = groupQuestionsBySection(questions);
  const setQuestions = (next: ClinicalTemplateFormValues['questions']) =>
    setFieldValue('questions', next);

  const endDrag = () => {
    setDraggingIndex(null);
    setDropTarget(null);
  };

  const dragQuestion = (index: number): QuestionDragProps => ({
    onDragStart: (event) => {
      event.dataTransfer.effectAllowed = 'move';
      // Firefox no arrastra sin datos.
      event.dataTransfer.setData(DRAG_DATA_TYPE, String(index));
      // Se arrastra desde el asa, pero se ve la fila entera.
      const row = event.currentTarget.closest('[data-question-row]');
      if (row instanceof HTMLElement) event.dataTransfer.setDragImage(row, 16, 16);
      setDraggingIndex(index);
    },
    onDragEnd: endDrag,
  });

  const dropZone = (group: ClinicalQuestionGroup, beforeIndex: number | null): DropZoneProps => ({
    onDragOver: (event) => {
      if (draggingIndex === null) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      if (dropTarget?.groupKey !== group.key || dropTarget.beforeIndex !== beforeIndex) {
        setDropTarget({ groupKey: group.key, beforeIndex });
      }
    },
    onDrop: (event) => {
      event.preventDefault();
      if (draggingIndex !== null && draggingIndex !== beforeIndex) {
        setQuestions(moveQuestion(questions, draggingIndex, group.section, beforeIndex));
      }
      endDrag();
    },
  });

  const isDropTarget = (group: ClinicalQuestionGroup, beforeIndex: number | null) =>
    draggingIndex !== null &&
    dropTarget?.groupKey === group.key &&
    dropTarget.beforeIndex === beforeIndex;

  const addQuestion = (group: ClinicalQuestionGroup) => {
    const next = [...questions];
    next.splice(group.indexes[group.indexes.length - 1] + 1, 0, buildEmptyQuestion(group.section));
    setQuestions(next);
  };

  const addSection = () => {
    const name = newSectionName.trim();
    if (!name) return;
    setQuestions([...questions, buildEmptyQuestion(name)]);
    setNewSectionName('');
  };

  return {
    questions,
    groups,
    draggingIndex,
    isFull: questions.length >= CLINICAL_TEMPLATE_MAX_FIELDS,
    canRemove: questions.length > 1,
    newSectionName,
    dragQuestion,
    dropZone,
    isDropTarget,
    addQuestion,
    addSection,
    handleNewSectionNameChange: setNewSectionName,
    handleRenameSection: (group: ClinicalQuestionGroup, name: string) =>
      setQuestions(renameSection(questions, group.indexes, name)),
    handleRemoveQuestion: (index: number) =>
      setQuestions(questions.filter((_, position) => position !== index)),
  };
}
