import React, { useCallback } from 'react';
import { AlertTriangle, Loader2, Pencil, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Accordion,
  AccordionHeadingLevel,
  AccordionVariant,
} from '@/components/common/accordion/accordion';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { PatientBackgroundSummary } from '@/components/containers/patients/patient-background/patient-background-summary';
import { QuestionSectionControls } from '@/components/containers/questions/question-sections';
import { TEXT } from '@/static/texts/i18n';
import { ClinicalTemplate } from '@/types/clinical-templates/clinical-template';
import { QuestionnaireEntry } from '@/types/questionnaires/questionnaire-entry';
import { EntryHistoryList } from './entry-history-list';
import { QuestionnaireEntryForm } from './questionnaire-entry-form';
import { useQuestionnaireSection } from './use-questionnaire-section';

interface QuestionnaireSectionContainerProps extends QuestionSectionControls {
  patientUuid: string;
  template: ClinicalTemplate;
  /** Solo los de esta sección, del más nuevo al más viejo. */
  entries: QuestionnaireEntry[];
  isLoading: boolean;
  isError: boolean;
  /** Estado de la sección bajo el título: "Sin registros" o cuántos y cuándo fue el último. */
  statusText?: string;
  onRetry: () => void;
  onDirtyChange: (sectionKey: string, isDirty: boolean) => void;
}

/** Una sección propia de Preguntas en el expediente: se llena varias veces y guarda el historial. */
export const QuestionnaireSectionContainer: React.FC<QuestionnaireSectionContainerProps> = ({
  patientUuid,
  template,
  entries,
  isLoading,
  isError,
  statusText,
  onRetry,
  isExpanded,
  onToggle,
  onExpand,
  onDirtyChange,
}) => {
  const { t } = useTranslation();
  const {
    isCreating,
    editingEntry,
    isSaving,
    getAuthor,
    getCorrection,
    getPreview,
    revealsLatest,
    handleSaved,
    handleRevealed,
    handleSavingChange,
    handleStartCreate,
    handleCloseCreate,
    handleStartEdit,
    handleCloseEdit,
  } = useQuestionnaireSection(entries, onExpand);
  const handleDirtyChange = useCallback(
    (isDirty: boolean) => onDirtyChange(template.uuid, isDirty),
    [onDirtyChange, template.uuid],
  );

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
      {t(TEXT.QUESTIONS.ENTRY_NEW)}
    </Button>
  );

  return (
    <Accordion
      variant={AccordionVariant.NESTED}
      title={template.name}
      subtitle={statusText}
      isExpanded={isExpanded}
      isToggleDisabled={isSaving}
      headingLevel={AccordionHeadingLevel.H3}
      onToggle={onToggle}
      scrollsIntoViewOnExpand
      stacksActionOnMobile
      action={isReady && hasEntries && !isFormOpen ? newEntryButton : undefined}
    >
      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-6">
          <Loader2 className="h-5 w-5 animate-spin text-brand" aria-hidden />
          <Typography variant={TypographyVariant.BODY}>
            {t(TEXT.QUESTIONS.ENTRIES_LOADING)}
          </Typography>
        </div>
      )}

      {isError && !isLoading && (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <AlertTriangle className="h-8 w-8 text-danger" aria-hidden />
          <Typography variant={TypographyVariant.ACCENT}>
            {t(TEXT.QUESTIONS.ENTRIES_LOAD_ERROR)}
          </Typography>
          <Button variant={ButtonVariant.SECONDARY} onClick={onRetry} className="mt-2">
            {t(TEXT.GENERAL.BUTTONS.RETRY)}
          </Button>
        </div>
      )}

      {isReady && !hasEntries && !isFormOpen && (
        <div className="flex flex-col items-start gap-3">
          <Typography variant={TypographyVariant.HELPER}>
            {t(TEXT.QUESTIONS.ENTRY_EMPTY)}
          </Typography>
          {newEntryButton}
        </div>
      )}

      {isReady && isFormOpen && (
        <QuestionnaireEntryForm
          key={editingEntry?.uuid ?? 'new'}
          patientUuid={patientUuid}
          template={template}
          entry={editingEntry}
          onClose={editingEntry ? handleCloseEdit : handleCloseCreate}
          onSaved={handleSaved}
          onSavingChange={handleSavingChange}
          onDirtyChange={handleDirtyChange}
        />
      )}

      {isReady && hasEntries && !isFormOpen && (
        <EntryHistoryList
          entries={entries}
          historyLabel={template.name}
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
                icon={<Pencil className="h-4 w-4" aria-hidden />}
                className="shrink-0"
              >
                {t(TEXT.QUESTIONS.ENTRY_EDIT)}
              </Button>
            ) : null
          }
          renderEntry={(entry, { isMuted }) => (
            <PatientBackgroundSummary
              fields={entry.templateSnapshot.fields}
              answers={entry.answers}
              showsHistoryTitle={false}
              isMuted={isMuted}
            />
          )}
        />
      )}
    </Accordion>
  );
};
