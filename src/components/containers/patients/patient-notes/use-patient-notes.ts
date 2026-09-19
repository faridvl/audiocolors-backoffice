import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { DocumentCategory } from '@/types/documents/document.types';
import { PATIENT_NOTE_TEXT_MAX_LENGTH } from '@/types/patients/patient-note';
import {
  usePatientNotesQuery,
  FETCH_PATIENT_NOTES_KEY,
} from '@/shared/api/querys/patient-notes-query';
import { useCreatePatientNoteMutation } from '@/shared/api/mutations/patients/create-patient-note-mutation';

export function usePatientNotes(patientUuid: string) {
  const queryClient = useQueryClient();

  const [isAdding, setIsAdding] = useState(false);
  const [text, setText] = useState('');
  const [category, setCategory] = useState<DocumentCategory>(DocumentCategory.EVOLUTION_CONTROL);

  const { data, isLoading, isError, refetch } = usePatientNotesQuery(patientUuid);
  const { executeCreatePatientNote, isPending: isCreating } = useCreatePatientNoteMutation();

  const notes = data ?? [];

  const invalidateNotes = () =>
    queryClient.invalidateQueries({ queryKey: [FETCH_PATIENT_NOTES_KEY, patientUuid] });

  const canSubmit = text.trim().length > 0 && text.trim().length <= PATIENT_NOTE_TEXT_MAX_LENGTH;

  const handleTextChange = (value: string) => setText(value.slice(0, PATIENT_NOTE_TEXT_MAX_LENGTH));

  const resetForm = () => {
    setText('');
    setCategory(DocumentCategory.EVOLUTION_CONTROL);
    setIsAdding(false);
  };

  const handleStartAdding = () => setIsAdding(true);
  const handleCancelAdding = () => resetForm();

  const handleAddNote = () => {
    const trimmedText = text.trim();

    if (!trimmedText) {
      toast.error('Escribe una nota antes de guardar');
      return;
    }

    executeCreatePatientNote(
      { patientUuid, text: trimmedText, category },
      {
        onSuccess: () => {
          toast.success('Nota agregada');
          resetForm();
          void invalidateNotes();
        },
        onError: (error: Error) => toast.error(error.message),
      },
    );
  };

  return {
    notes,
    isLoading,
    isError,
    refetch,
    isAdding,
    handleStartAdding,
    handleCancelAdding,
    text,
    handleTextChange,
    category,
    setCategory,
    canSubmit,
    handleAddNote,
    isCreating,
  };
}
