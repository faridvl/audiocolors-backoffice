import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Accordion,
  AccordionSubtitleTone,
  AccordionVariant,
} from '@/components/common/accordion/accordion';
import { TEXT } from '@/static/texts/i18n';
import { QuestionSectionState } from './question-sections';
import { useQuestionsSettings } from './use-questions-settings';

export const QuestionsSettingsContainer: React.FC = () => {
  const { t } = useTranslation();
  const { sections, isSectionExpanded, handleToggleSection } = useQuestionsSettings();

  return (
    <div className="flex flex-col gap-6">
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
    </div>
  );
};
