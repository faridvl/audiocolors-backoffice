import React from 'react';
import { AlertTriangle, Loader2, Pencil, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { EntryHistoryList } from '@/components/containers/patients/patient-questions/entry-history-list';
import { TEXT } from '@/static/texts/i18n';
import { PatientPhysicalExamForm } from './patient-physical-exam-form';
import { PhysicalExamAnswer } from './physical-exam-answer';
import { usePatientPhysicalExam } from './use-patient-physical-exam';

interface PatientPhysicalExamContainerProps {
  patientUuid: string;
}

/** Exploración física (otoscopía): historial por paciente, entre la ficha y la historia clínica. */
export const PatientPhysicalExamContainer: React.FC<PatientPhysicalExamContainerProps> = ({
  patientUuid,
}) => {
  const { t } = useTranslation();
  const {
    entries,
    isHidden,
    isLoading,
    isError,
    refetch,
    isCreating,
    editingEntry,
    isSaving,
    revealsLatest,
    getAuthor,
    getCorrection,
    getPreview,
    handleSaved,
    handleRevealed,
    handleSavingChange,
    handleStartCreate,
    handleCloseCreate,
    handleStartEdit,
    handleCloseEdit,
  } = usePatientPhysicalExam(patientUuid);

  if (isHidden) return null;

  const isReady = !isLoading && !isError;
  const hasEntries = entries.length > 0;
  const isFormOpen = isCreating || !!editingEntry;
  const newEntryButton = (
    <Button
      variant={ButtonVariant.SECONDARY}
      onClick={handleStartCreate}
      icon={<Plus className="h-4 w-4 text-ink-500" aria-hidden />}
      className="w-full shrink-0 whitespace-nowrap sm:w-auto"
    >
      {t(TEXT.PATIENTS.PHYSICAL_EXAM.NEW)}
    </Button>
  );

  return (
    <section className="flex flex-col gap-4 rounded-card border border-ink-200 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <Typography variant={TypographyVariant.SUBTITLE}>
          {t(TEXT.PATIENTS.BACKGROUND.OTOSCOPY_TITLE)}
        </Typography>
        {isReady && hasEntries && !isFormOpen && newEntryButton}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-6">
          <Loader2 className="h-5 w-5 animate-spin text-brand" aria-hidden />
          <Typography variant={TypographyVariant.BODY}>
            {t(TEXT.PATIENTS.PHYSICAL_EXAM.LOADING)}
          </Typography>
        </div>
      )}

      {isError && !isLoading && (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <AlertTriangle className="h-8 w-8 text-danger" aria-hidden />
          <Typography variant={TypographyVariant.ACCENT}>
            {t(TEXT.PATIENTS.PHYSICAL_EXAM.LOAD_ERROR)}
          </Typography>
          <Button variant={ButtonVariant.SECONDARY} onClick={refetch} className="mt-2">
            {t(TEXT.GENERAL.BUTTONS.RETRY)}
          </Button>
        </div>
      )}

      {isReady && !hasEntries && !isFormOpen && (
        <div className="flex flex-col items-start gap-3">
          <Typography variant={TypographyVariant.HELPER}>
            {t(TEXT.PATIENTS.PHYSICAL_EXAM.EMPTY)}
          </Typography>
          {newEntryButton}
        </div>
      )}

      {isReady && isFormOpen && (
        <PatientPhysicalExamForm
          key={editingEntry?.uuid ?? 'new'}
          patientUuid={patientUuid}
          entry={editingEntry}
          onClose={editingEntry ? handleCloseEdit : handleCloseCreate}
          onSaved={handleSaved}
          onSavingChange={handleSavingChange}
        />
      )}

      {isReady && hasEntries && !isFormOpen && (
        <EntryHistoryList
          entries={entries}
          historyLabel={t(TEXT.PATIENTS.BACKGROUND.OTOSCOPY_TITLE)}
          getAuthor={getAuthor}
          getCorrection={getCorrection}
          getPreview={getPreview}
          revealsLatest={revealsLatest}
          onRevealed={handleRevealed}
          renderLatestAction={(entry) =>
            entry.canEdit ? (
              <Button
                variant={ButtonVariant.GHOST}
                onClick={() => handleStartEdit(entry)}
                disabled={isSaving}
                icon={<Pencil className="h-4 w-4" aria-hidden />}
                className="shrink-0"
              >
                {t(TEXT.QUESTIONS.ENTRY_EDIT)}
              </Button>
            ) : null
          }
          renderEntry={(entry) => (
            <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-2">
              <PhysicalExamAnswer
                label={t(TEXT.PATIENTS.BACKGROUND.RIGHT_EAR)}
                value={entry.otoscopyRight}
              />
              <PhysicalExamAnswer
                label={t(TEXT.PATIENTS.BACKGROUND.LEFT_EAR)}
                value={entry.otoscopyLeft}
              />
            </div>
          )}
        />
      )}
    </section>
  );
};
