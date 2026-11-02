import { useCallback, useState } from 'react';
import { useResolveAuthorLabel } from '@/hooks/use-resolve-author-label';
import { QuestionnaireEntry } from '@/types/questionnaires/questionnaire-entry';

export function useQuestionnaireSection(onExpand: () => void) {
  const resolveAuthorLabel = useResolveAuthorLabel();
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const getAuthor = (entry: QuestionnaireEntry) =>
    resolveAuthorLabel(entry.createdByUuid, entry.createdByName);

  const handleStartCreate = () => {
    setIsCreating(true);
    onExpand();
  };
  const handleCloseCreate = useCallback(() => setIsCreating(false), []);

  return {
    isCreating,
    isSaving,
    getAuthor,
    handleSavingChange: setIsSaving,
    handleStartCreate,
    handleCloseCreate,
  };
}
