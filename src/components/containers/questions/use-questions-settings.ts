import { createElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ClinicalHistoryTemplateContainer } from '@/components/containers/clinical-history-template/clinical-history-template-container';
import { TEXT } from '@/static/texts/i18n';
import { QuestionSectionState, SettingsQuestionSection } from './question-sections';

export function useQuestionsSettings() {
  const { t } = useTranslation();
  // Solo lo que la persona abrió o cerró a mano; el resto se decide por la lista actual.
  const [toggled, setToggled] = useState<Record<string, boolean>>({});
  const [isHistoryDirty, setIsHistoryDirty] = useState(false);

  const sections: SettingsQuestionSection[] = [
    {
      key: 'clinical-history',
      title: t(TEXT.QUESTIONS.CLINICAL_HISTORY),
      state: isHistoryDirty ? QuestionSectionState.DRAFT : QuestionSectionState.COMPLETE,
      render: () =>
        createElement(ClinicalHistoryTemplateContainer, { onDirtyChange: setIsHistoryDirty }),
    },
  ];

  // Con una sola sección se abre sola; si la lista crece, deja de abrirse sola.
  const isSectionExpanded = (key: string) => toggled[key] ?? sections.length === 1;

  return {
    sections,
    isSectionExpanded,
    handleToggleSection: (key: string) =>
      setToggled((current) => ({ ...current, [key]: !isSectionExpanded(key) })),
  };
}
