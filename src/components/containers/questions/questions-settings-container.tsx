import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Accordion,
  AccordionSubtitleTone,
  AccordionVariant,
} from '@/components/common/accordion/accordion';
import { TEXT } from '@/static/texts/i18n';
import { SettingsAddButton } from '../settings/settings-add-button';
import { SettingsCard } from '../settings/settings-card';
import { SettingsSectionError, SettingsSectionLoading } from '../settings/settings-section-state';
import { NewQuestionnaireSectionModal } from './questionnaire-template/new-questionnaire-section-modal';
import { QuestionSectionState, SettingsQuestionSection } from './question-sections';
import { useQuestionsSettings } from './use-questions-settings';

interface QuestionSectionBlockProps {
  section: SettingsQuestionSection;
  isExpanded: boolean;
  onToggle: () => void;
}

/** La tarjeta de una sección y, debajo, la barra fija de Guardar de su formulario. */
const QuestionSectionBlock: React.FC<QuestionSectionBlockProps> = ({
  section,
  isExpanded,
  onToggle,
}) => {
  const { t } = useTranslation();
  const [footerSlot, setFooterSlot] = useState<HTMLDivElement | null>(null);

  return (
    <div className="flex flex-col gap-3">
      <Accordion
        variant={AccordionVariant.CARD}
        title={section.title}
        subtitle={
          section.state === QuestionSectionState.DRAFT
            ? t(TEXT.QUESTIONS.UNSAVED_CHANGES)
            : undefined
        }
        subtitleTone={AccordionSubtitleTone.WARNING}
        isExpanded={isExpanded}
        onToggle={onToggle}
        isLazy
      >
        {section.render(footerSlot)}
      </Accordion>
      {/* Sticky dentro de su bloque: con varias secciones abiertas, cada barra queda con la suya. */}
      <div
        ref={setFooterSlot}
        className={isExpanded ? 'sticky bottom-0 z-10 empty:hidden' : 'hidden'}
      />
    </div>
  );
};

export const QuestionsSettingsContainer: React.FC = () => {
  const { t } = useTranslation();
  const {
    sections,
    isSectionExpanded,
    handleToggleSection,
    isLoading,
    isError,
    refetch,
    canAddSection,
    isNameModalOpen,
    handleOpenNameModal,
    handleCloseNameModal,
    handleConfirmName,
  } = useQuestionsSettings();

  return (
    <div className="flex flex-col gap-4">
      <SettingsAddButton
        label={t(TEXT.QUESTIONS.NEW_SECTION)}
        onClick={handleOpenNameModal}
        disabled={isLoading || isError || !canAddSection}
        hint={canAddSection ? undefined : t(TEXT.QUESTIONS.NEW_SECTION_DISABLED_HINT)}
      />

      {isLoading || isError ? (
        <SettingsCard>
          {isLoading ? (
            <SettingsSectionLoading message={t(TEXT.QUESTIONS.SECTIONS_LOADING)} />
          ) : (
            <SettingsSectionError
              message={t(TEXT.QUESTIONS.SECTIONS_LOAD_ERROR)}
              onRetry={refetch}
            />
          )}
        </SettingsCard>
      ) : (
        sections.map((section) => (
          <QuestionSectionBlock
            key={section.key}
            section={section}
            isExpanded={isSectionExpanded(section.key)}
            onToggle={() => handleToggleSection(section.key)}
          />
        ))
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
