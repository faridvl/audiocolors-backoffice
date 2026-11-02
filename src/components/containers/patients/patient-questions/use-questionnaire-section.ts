import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useResolveAuthorLabel } from '@/hooks/use-resolve-author-label';
import { formatTime } from '@/shared/utils/formatters';
import { TEXT } from '@/static/texts/i18n';
import { QuestionnaireEntry } from '@/types/questionnaires/questionnaire-entry';

export function useQuestionnaireSection(entries: QuestionnaireEntry[], onExpand: () => void) {
  const { t } = useTranslation();
  const resolveAuthorLabel = useResolveAuthorLabel();
  const [isCreating, setIsCreating] = useState(false);
  const [editingEntryUuid, setEditingEntryUuid] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
    handleSavingChange: setIsSaving,
    handleStartCreate,
    handleCloseCreate,
    handleStartEdit,
    handleCloseEdit,
  };
}
