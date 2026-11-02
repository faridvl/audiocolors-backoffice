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
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <Button
          variant={ButtonVariant.SECONDARY}
          icon={<Plus className="h-4 w-4" aria-hidden />}
          onClick={handleOpenNameModal}
          disabled={!canAddSection}
        >
          {t(TEXT.QUESTIONS.NEW_SECTION)}
        </Button>
      </div>

      {sections.map((section) => (
        <Accordion
          key={section.key}
          variant={AccordionVariant.PLAIN}
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
          <Typography variant={TypographyVariant.BODY}>{t(TEXT.QUESTIONS.SECTIONS_LOADING)}</Typography>
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

      {isNameModalOpen && (
        <NewQuestionnaireSectionModal onConfirm={handleConfirmName} onClose={handleCloseNameModal} />
      )}
    </div>
  );
};
