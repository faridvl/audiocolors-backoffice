import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Accordion,
  AccordionSubtitleTone,
  AccordionVariant,
} from '@/components/common/accordion/accordion';
import { TEXT } from '@/static/texts/i18n';
import { usePatientQuestions } from './use-patient-questions';

interface PatientQuestionsContainerProps {
  patientUuid: string;
}

export const PatientQuestionsContainer: React.FC<PatientQuestionsContainerProps> = ({
  patientUuid,
}) => {
  const { t } = useTranslation();
  const { sections, controlsFor, isHidden, subtitle, hasDraft, isExpanded, handleToggleExpanded } =
    usePatientQuestions(patientUuid);

  if (isHidden) return null;

  return (
    <Accordion
      variant={AccordionVariant.CARD}
      title={t(TEXT.QUESTIONS.TITLE)}
      subtitle={isExpanded ? undefined : subtitle}
      subtitleTone={hasDraft ? AccordionSubtitleTone.WARNING : AccordionSubtitleTone.DEFAULT}
      isExpanded={isExpanded}
      onToggle={handleToggleExpanded}
      isLazy
    >
      {sections.map((section) => (
        <React.Fragment key={section.key}>
          {section.render(controlsFor(section.key))}
        </React.Fragment>
      ))}
    </Accordion>
  );
};
