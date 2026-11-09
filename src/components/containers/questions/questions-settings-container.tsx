import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Accordion,
  AccordionSubtitleTone,
  AccordionVariant,
} from '@/components/common/accordion/accordion';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
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

      <div className="flex flex-col gap-1.5">
        <button
          type="button"
          onClick={handleOpenNameModal}
          disabled={isLoading || isError || !canAddSection}
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

      {isNameModalOpen && (
        <NewQuestionnaireSectionModal
          onConfirm={handleConfirmName}
          onClose={handleCloseNameModal}
        />
      )}
    </div>
  );
};
