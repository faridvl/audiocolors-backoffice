import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useResolveAuthorLabel } from '@/hooks/use-resolve-author-label';
import {
  shortDetailLabel,
  sortFields,
  yesNoOf,
} from '@/components/containers/patients/patient-background/clinical-history';
import { formatTime } from '@/shared/utils/formatters';
import { TEXT } from '@/static/texts/i18n';
import { QuestionnaireEntry } from '@/types/questionnaires/questionnaire-entry';

export function useQuestionnaireSection(entries: QuestionnaireEntry[], onExpand: () => void) {
  const { t } = useTranslation();
  const resolveAuthorLabel = useResolveAuthorLabel();
  const [isCreating, setIsCreating] = useState(false);
  const [editingEntryUuid, setEditingEntryUuid] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [revealsLatest, setRevealsLatest] = useState(false);

  // Si el registro desaparece de la lista, la edición se da por cerrada.
  const editingEntry = entries.find((entry) => entry.uuid === editingEntryUuid);

  const getAuthor = (entry: QuestionnaireEntry) =>
    resolveAuthorLabel(entry.createdByUuid, entry.createdByName);

  const getCorrection = (entry: QuestionnaireEntry) =>
    entry.updatedAt
      ? t(TEXT.QUESTIONS.ENTRY_CORRECTED, {
          author: resolveAuthorLabel(entry.updatedByUuid ?? '', entry.updatedByName),
          time: formatTime(entry.updatedAt),
        })
      : undefined;

  // La primera pregunta con respuesta (un texto escrito o un Sí/No marcado), en una línea.
  const getPreview = (entry: QuestionnaireEntry) => {
    for (const field of sortFields(entry.templateSnapshot.fields)) {
      const answer = entry.answers[field.id];
      const label = shortDetailLabel(field.label);
      if (typeof answer === 'string') {
        if (answer.trim()) {
          return t(TEXT.QUESTIONS.ANSWER_WITH_DETAIL, { label, detail: answer.trim() });
        }
        continue;
      }
      const yesNo = yesNoOf(answer);
      if (yesNo !== null) {
        return t(TEXT.QUESTIONS.ANSWER_WITH_DETAIL, {
          label,
          detail: t(yesNo ? TEXT.GENERAL.YES : TEXT.GENERAL.NO),
        });
      }
    }
    return undefined;
  };

  const handleSaved = useCallback(() => setRevealsLatest(true), []);
  const handleRevealed = useCallback(() => setRevealsLatest(false), []);

  const handleStartCreate = () => {
    setIsCreating(true);
    onExpand();
  };
  const handleCloseCreate = useCallback(() => setIsCreating(false), []);

  const handleStartEdit = (entry: QuestionnaireEntry) => {
    setEditingEntryUuid(entry.uuid);
    onExpand();
  };
  const handleCloseEdit = useCallback(() => setEditingEntryUuid(null), []);

  return {
    isCreating,
    editingEntry,
    isSaving,
    getAuthor,
    getCorrection,
    getPreview,
    revealsLatest,
    handleSaved,
    handleRevealed,
    handleSavingChange: setIsSaving,
    handleStartCreate,
    handleCloseCreate,
    handleStartEdit,
    handleCloseEdit,
  };
}
