import React from 'react';
import { NotebookText, Loader2, AlertTriangle } from 'lucide-react';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { FilterDropdown } from '@/components/common/filter-dropdown/filter-dropdown';
import { Pagination } from '@/components/common/table/pagination';
import { DOCUMENT_CATEGORY_LABELS } from '@/types/documents/document.types';
import { PatientNote } from '@/types/patients/patient-note';
import { formatDate } from '@/shared/utils/formatters';
import { useResolveAuthorLabel } from '@/hooks/use-resolve-author-label';
import { usePatientNotes, ALL_MONTHS_VALUE } from './use-patient-notes';
import { AddPatientNoteModal } from './add-patient-note-modal';

interface NoteRowProps {
  note: PatientNote;
  authorLabel: string;
}

const NoteRow: React.FC<NoteRowProps> = ({ note, authorLabel }) => (
  <div className="flex flex-col gap-1.5 rounded-card border border-ink-200 bg-white px-4 py-3">
    <div className="flex items-center justify-between gap-3">
      <span className="w-fit rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
        {DOCUMENT_CATEGORY_LABELS[note.category]}
      </span>
      <Typography variant={TypographyVariant.HELPER}>{formatDate(note.createdAt)}</Typography>
    </div>
    <Typography variant={TypographyVariant.BODY} className="whitespace-pre-wrap">
      {note.text}
    </Typography>
    <Typography variant={TypographyVariant.HELPER}>{authorLabel}</Typography>
  </div>
);

interface PatientNotesContainerProps {
  patientUuid: string;
}

/**
 * Bitacora de evolucion del paciente. El historial se muestra siempre; el
 * formulario de alta vive en un modal aparte (AddPatientNoteModal) para no
 * empujar la lista de notas hacia abajo al abrirse.
 */
export const PatientNotesContainer: React.FC<PatientNotesContainerProps> = ({ patientUuid }) => {
  const {
    notes,
    totalCount,
    filteredCount,
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
    page,
    totalPages,
    handlePageChange,
  } = usePatientNotes(patientUuid);

  const resolveAuthorLabel = useResolveAuthorLabel();

  return (
    <section className="flex flex-col gap-3 rounded-card border border-ink-200 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Typography variant={TypographyVariant.SUBTITLE}>Control de evolución</Typography>

        <div className="flex items-center gap-2">
          {totalCount > 0 && (
            <FilterDropdown
              value={monthFilter}
              options={monthOptions}
              allValue={ALL_MONTHS_VALUE}
              onChange={handleMonthFilterChange}
              ariaLabel="Filtrar notas por mes"
              placeholderLabel="Mes"
            />
          )}

          <Button variant={ButtonVariant.SECONDARY} onClick={handleStartAdding}>
            Agregar nota
          </Button>
        </div>
      </div>

      <AddPatientNoteModal
        isOpen={isAdding}
        text={text}
        category={category}
        isCreating={isCreating}
        canSubmit={canSubmit}
        onTextChange={handleTextChange}
        onCategoryChange={setCategory}
        onConfirm={handleAddNote}
        onCancel={handleCancelAdding}
      />

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-8">
          <Loader2 className="h-5 w-5 animate-spin text-brand" aria-hidden />
          <Typography variant={TypographyVariant.BODY}>Cargando notas...</Typography>
        </div>
      )}

      {isError && !isLoading && (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <AlertTriangle className="h-8 w-8 text-danger" aria-hidden />
          <Typography variant={TypographyVariant.ACCENT}>No se pudieron cargar las notas</Typography>
          <Button variant={ButtonVariant.SECONDARY} onClick={() => refetch()} className="mt-2">
            Reintentar
          </Button>
        </div>
      )}

      {!isLoading && !isError && filteredCount === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-ink-300 py-8 text-center">
          <NotebookText className="h-8 w-8 text-ink-300" aria-hidden />
          <Typography variant={TypographyVariant.ACCENT}>
            {totalCount === 0 ? 'Sin notas registradas' : 'Sin notas en este mes'}
          </Typography>
          <Typography variant={TypographyVariant.BODY}>
            {totalCount === 0
              ? 'Agrega la primera nota de evolución de este paciente.'
              : 'Prueba con otro mes.'}
          </Typography>
        </div>
      )}

      {!isLoading && !isError && filteredCount > 0 && (
        <div className="flex flex-col gap-2">
          {notes.map((note) => (
            <NoteRow key={note.uuid} note={note} authorLabel={resolveAuthorLabel(note.authorUuid)} />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} total={filteredCount} onPageChange={handlePageChange} />
    </section>
  );
};
