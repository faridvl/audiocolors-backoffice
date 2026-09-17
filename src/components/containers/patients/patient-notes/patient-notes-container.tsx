import React from 'react';
import { NotebookText, Plus, Loader2, AlertTriangle } from 'lucide-react';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { inputBaseClasses } from '@/components/common/input/input';
import { tailwind } from '@/utils/tailwind-utils';
import {
  DocumentCategory,
  DOCUMENT_CATEGORY_LABELS,
} from '@/types/documents/document.types';
import { PatientNote, PATIENT_NOTE_TEXT_MAX_LENGTH } from '@/types/patients/patient-note';
import { formatDate } from '@/shared/utils/formatters';
import { useSession } from '@/hooks/use-session';
import { usePatientNotes } from './use-patient-notes';

/**
 * Nombre del autor de la nota.
 *
 * El API no devuelve el nombre del autor en el listado, solo `authorUuid`.
 * No existe en el proyecto un query que resuelva uuid de usuario -> nombre
 * (no hay lista de usuarios del tenant, solo `useSession` con el usuario
 * actual). Por eso solo se puede reconocer al autor cuando coincide con el
 * usuario logueado; para el resto se usa un texto generico en vez de
 * inventar un endpoint nuevo.
 */
function useResolveAuthorLabel() {
  const { user } = useSession();

  return (authorUuid: string) => {
    if (user?.uuid && authorUuid === user.uuid) return user.fullName;
    return 'Registrado por el equipo médico';
  };
}

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
 * Bitacora de evolucion del paciente. El historial se muestra siempre, pero el
 * formulario de alta es progresivo: por defecto solo hay un link "+ Agregar
 * nota" (mismo patron que "Agregar contacto adicional" en
 * patient-contacts-container.tsx). El formulario completo solo aparece al
 * hacer clic, y se colapsa de nuevo al guardar o cancelar.
 */
export const PatientNotesContainer: React.FC<PatientNotesContainerProps> = ({ patientUuid }) => {
  const {
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
  } = usePatientNotes(patientUuid);

  const resolveAuthorLabel = useResolveAuthorLabel();

  return (
    <section className="flex flex-col gap-3 rounded-card border border-ink-200 bg-white p-4">
      <Typography variant={TypographyVariant.SUBTITLE}>Control de evolución</Typography>

      {isAdding ? (
        <div className="flex flex-col gap-3 rounded-card border border-ink-200 bg-ink-50 p-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="note-text">
              <Typography variant={TypographyVariant.HELPER}>Nota</Typography>
            </label>
            <textarea
              id="note-text"
              value={text}
              onChange={(event) => handleTextChange(event.target.value)}
              placeholder="Describe la evolución del paciente..."
              rows={4}
              autoFocus
              className={tailwind(inputBaseClasses, 'resize-none')}
            />
            <Typography variant={TypographyVariant.HELPER} className="self-end">
              {text.trim().length}/{PATIENT_NOTE_TEXT_MAX_LENGTH}
            </Typography>
          </div>

          <div className="flex flex-col gap-1 sm:w-56">
            <label htmlFor="note-category">
              <Typography variant={TypographyVariant.HELPER}>Categoría</Typography>
            </label>
            <select
              id="note-category"
              value={category}
              onChange={(event) => setCategory(event.target.value as DocumentCategory)}
              className={inputBaseClasses}
            >
              {Object.values(DocumentCategory).map((value) => (
                <option key={value} value={value}>
                  {DOCUMENT_CATEGORY_LABELS[value]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant={ButtonVariant.SECONDARY} onClick={handleCancelAdding}>
              Cancelar
            </Button>
            <Button
              variant={ButtonVariant.PRIMARY}
              onClick={handleAddNote}
              disabled={!canSubmit}
              isLoading={isCreating}
              icon={<Plus className="h-4 w-4" aria-hidden />}
            >
              Guardar
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleStartAdding}
          className="flex w-fit items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Agregar nota
        </button>
      )}

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

      {!isLoading && !isError && notes.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-ink-300 py-8 text-center">
          <NotebookText className="h-8 w-8 text-ink-300" aria-hidden />
          <Typography variant={TypographyVariant.ACCENT}>Sin notas registradas</Typography>
          <Typography variant={TypographyVariant.BODY}>
            Agrega la primera nota de evolución de este paciente.
          </Typography>
        </div>
      )}

      {!isLoading && !isError && notes.length > 0 && (
        <div className="flex flex-col gap-2">
          {notes.map((note) => (
            <NoteRow key={note.uuid} note={note} authorLabel={resolveAuthorLabel(note.authorUuid)} />
          ))}
        </div>
      )}
    </section>
  );
};
