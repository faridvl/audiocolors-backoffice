import React from 'react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Accordion,
  AccordionSubtitleTone,
  AccordionVariant,
} from '@/components/common/accordion/accordion';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { SettingsSectionError, SettingsSectionLoading } from '../settings/settings-section-state';
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
    <div className="flex flex-col gap-4">
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
        <SettingsSectionLoading message={t(TEXT.QUESTIONS.SECTIONS_LOADING)} />
      )}

      {hasTemplatesError && (
        <SettingsSectionError
          message={t(TEXT.QUESTIONS.SECTIONS_LOAD_ERROR)}
          onRetry={refetchTemplates}
        />
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
