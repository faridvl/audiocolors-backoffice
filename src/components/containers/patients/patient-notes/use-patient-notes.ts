import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { DocumentCategory } from '@/types/documents/document.types';
import { PATIENT_NOTE_TEXT_MAX_LENGTH } from '@/types/patients/patient-note';
import {
  usePatientNotesQuery,
  FETCH_PATIENT_NOTES_KEY,
} from '@/shared/api/querys/patient-notes-query';
import { useCreatePatientNoteMutation } from '@/shared/api/mutations/patients/create-patient-note-mutation';

const PAGE_SIZE = 5;
export const ALL_MONTHS_VALUE = 'all';

const MONTH_LABELS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

/** Clave YYYY-MM de la fecha de la nota, usada para agrupar y filtrar por mes. */
function noteMonthKey(createdAt: string): string {
  return createdAt.slice(0, 7);
}

function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const label = MONTH_LABELS[Number(month) - 1] ?? month;
  return `${label.charAt(0).toUpperCase()}${label.slice(1)} ${year}`;
}

export function usePatientNotes(patientUuid: string) {
  const queryClient = useQueryClient();

  const [isAdding, setIsAdding] = useState(false);
  const [text, setText] = useState('');
  const [category, setCategory] = useState<DocumentCategory>(DocumentCategory.EVOLUTION_CONTROL);
  const [monthFilter, setMonthFilter] = useState(ALL_MONTHS_VALUE);
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = usePatientNotesQuery(patientUuid);
  const { executeCreatePatientNote, isPending: isCreating } = useCreatePatientNoteMutation();

  // El API ya las entrega en orden descendente por fecha (mas reciente primero).
  const allNotes = useMemo(() => data ?? [], [data]);

  const monthOptions = useMemo(() => {
    const uniqueMonths = Array.from(new Set(allNotes.map((note) => noteMonthKey(note.createdAt))));
    return [
      { label: 'Todos los meses', value: ALL_MONTHS_VALUE },
      ...uniqueMonths.map((monthKey) => ({ label: formatMonthLabel(monthKey), value: monthKey })),
    ];
  }, [allNotes]);

  const filteredNotes = useMemo(() => {
    if (monthFilter === ALL_MONTHS_VALUE) return allNotes;
    return allNotes.filter((note) => noteMonthKey(note.createdAt) === monthFilter);
  }, [allNotes, monthFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredNotes.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const notes = filteredNotes.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleMonthFilterChange = (value: string) => {
    setMonthFilter(value);
    setPage(1);
  };

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
    totalCount: allNotes.length,
    filteredCount: filteredNotes.length,
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
    monthFilter,
    monthOptions,
    handleMonthFilterChange,
    page: currentPage,
    totalPages,
    handlePageChange: setPage,
  };
}
