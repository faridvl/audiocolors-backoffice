import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useResolveAuthorLabel } from '@/hooks/use-resolve-author-label';
import { useOtoscopyEntriesQuery } from '@/shared/api/querys/otoscopy-entries-query';
import { isForbiddenError } from '@/shared/api/querys/patient-background-query';
import { formatTime } from '@/shared/utils/formatters';
import { TEXT } from '@/static/texts/i18n';
import { OtoscopyEntry } from '@/types/patients/otoscopy-entry';

export function usePatientPhysicalExam(patientUuid: string) {
  const { t } = useTranslation();
  const resolveAuthorLabel = useResolveAuthorLabel();
  const { data, isLoading, isError, error, refetch } = useOtoscopyEntriesQuery(patientUuid);
  const [isCreating, setIsCreating] = useState(false);
  const [editingEntryUuid, setEditingEntryUuid] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [revealsLatest, setRevealsLatest] = useState(false);

  const entries = data ?? [];
  // Si el registro desaparece de la lista, la edición se da por cerrada.
  const editingEntry = entries.find((entry) => entry.uuid === editingEntryUuid);

  const getAuthor = (entry: OtoscopyEntry) =>
    resolveAuthorLabel(entry.createdByUuid ?? '', entry.createdByName);

  const getCorrection = (entry: OtoscopyEntry) =>
    entry.updatedAt
      ? t(TEXT.QUESTIONS.ENTRY_CORRECTED, {
          author: resolveAuthorLabel(entry.updatedByUuid ?? '', entry.updatedByName),
          time: formatTime(entry.updatedAt),
        })
      : undefined;

  // Primer oído con texto, en una línea, para distinguir las filas cerradas del historial.
  const getPreview = (entry: OtoscopyEntry) => {
    if (entry.otoscopyRight?.trim()) {
      return t(TEXT.PATIENTS.PHYSICAL_EXAM.PREVIEW_RIGHT, { detail: entry.otoscopyRight.trim() });
    }
    if (entry.otoscopyLeft?.trim()) {
      return t(TEXT.PATIENTS.PHYSICAL_EXAM.PREVIEW_LEFT, { detail: entry.otoscopyLeft.trim() });
    }
    return undefined;
  };

  return {
    entries,
    // STAFF no tiene acceso a lo clínico: la tarjeta no se muestra.
    isHidden: isForbiddenError(error),
    isLoading,
    isError,
    refetch: () => void refetch(),
    isCreating,
    editingEntry,
    isSaving,
    revealsLatest,
    getAuthor,
    getCorrection,
    getPreview,
    handleSaved: useCallback(() => setRevealsLatest(true), []),
    handleRevealed: useCallback(() => setRevealsLatest(false), []),
    handleSavingChange: setIsSaving,
    handleStartCreate: () => setIsCreating(true),
    handleCloseCreate: useCallback(() => setIsCreating(false), []),
    handleStartEdit: (entry: OtoscopyEntry) => setEditingEntryUuid(entry.uuid),
    handleCloseEdit: useCallback(() => setEditingEntryUuid(null), []),
  };
}
