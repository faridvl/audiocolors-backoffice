import React from 'react';
import { AlertTriangle, Loader2, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Accordion,
  AccordionSubtitleTone,
  AccordionVariant,
} from '@/components/common/accordion/accordion';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { NewQuestionnaireSectionModal } from './questionnaire-template/new-questionnaire-section-modal';
import { QuestionSectionState } from './question-sections';
import { useQuestionsSettings } from './use-questions-settings';

export const QuestionsSettingsContainer: React.FC = () => {
  const { t } = useTranslation();
  const {
    sections,
    isSectionExpanded,
    handleToggleSection,
    isLoadingTemplates,
    hasTemplatesError,
    refetchTemplates,
    canAddSection,
    isNameModalOpen,
    handleOpenNameModal,
    handleCloseNameModal,
    handleConfirmName,
  } = useQuestionsSettings();

  return (
    <div className="flex flex-col gap-3">
      {sections.map((section) => (
        <Accordion
          key={section.key}
          variant={AccordionVariant.CARD}
          title={section.title}
          subtitle={
            section.state === QuestionSectionState.DRAFT
              ? t(TEXT.QUESTIONS.UNSAVED_CHANGES)
              : undefined
          }
          subtitleTone={AccordionSubtitleTone.WARNING}
          isExpanded={isSectionExpanded(section.key)}
          onToggle={() => handleToggleSection(section.key)}
          isLazy
        >
          {section.render()}
        </Accordion>
      ))}

      {isLoadingTemplates && (
        <div className="flex items-center justify-center gap-2 py-6">
          <Loader2 className="h-5 w-5 animate-spin text-brand" aria-hidden />
          <Typography variant={TypographyVariant.BODY}>
            {t(TEXT.QUESTIONS.SECTIONS_LOADING)}
          </Typography>
        </div>
      )}

      {hasTemplatesError && (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <AlertTriangle className="h-8 w-8 text-danger" aria-hidden />
          <Typography variant={TypographyVariant.ACCENT}>
            {t(TEXT.QUESTIONS.SECTIONS_LOAD_ERROR)}
          </Typography>
          <Button variant={ButtonVariant.SECONDARY} onClick={refetchTemplates} className="mt-2">
            {t(TEXT.GENERAL.BUTTONS.RETRY)}
          </Button>
        </div>
      )}

      {!isLoadingTemplates && !hasTemplatesError && (
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={handleOpenNameModal}
            disabled={!canAddSection}
            className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-card border border-dashed border-ink-300 text-sm font-semibold text-ink-700 transition-colors hover:border-brand hover:bg-brand/5 hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-ink-300 disabled:hover:bg-transparent disabled:hover:text-ink-700"
          >
            <Plus className="h-4 w-4" aria-hidden />
            {t(TEXT.QUESTIONS.NEW_SECTION)}
          </button>
          {!canAddSection && (
            <Typography variant={TypographyVariant.HELPER}>
              {t(TEXT.QUESTIONS.NEW_SECTION_DISABLED_HINT)}
            </Typography>
          )}
        </div>
      )}

      {isNameModalOpen && (
        <NewQuestionnaireSectionModal
          onConfirm={handleConfirmName}
          onClose={handleCloseNameModal}
        />
      )}
    </div>
  );
};
