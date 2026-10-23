import React from 'react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { inputBaseClasses } from '@/components/common/input/input';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import {
  CLINICAL_SECTION_MAX_LENGTH,
  CLINICAL_TEMPLATE_MAX_FIELDS,
} from '@/types/clinical-templates/clinical-template';
import { tailwind } from '@/utils/tailwind-utils';
import { ClinicalQuestionRow } from './clinical-question-row';
import { useClinicalTemplateEditor } from './use-clinical-template-editor';

/** Marca dónde va a caer la pregunta que se arrastra. */
const DROP_INDICATOR = 'shadow-[inset_0_2px_0_0] shadow-brand';

export const ClinicalTemplateEditor: React.FC<{ error?: string }> = ({ error }) => {
  const { t } = useTranslation();
  const {
    questions,
    groups,
    draggingIndex,
    isFull,
    canRemove,
    newSectionName,
    dragQuestion,
    dropZone,
    isDropTarget,
    addQuestion,
    addSection,
    handleNewSectionNameChange,
    handleRenameSection,
    handleRemoveQuestion,
  } = useClinicalTemplateEditor();

  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => (
        <section
          key={group.key}
          className="flex flex-col rounded-lg border border-ink-200 bg-white px-3 pb-2 pt-3 sm:px-4"
        >
          <input
            value={group.section}
            onChange={(event) => handleRenameSection(group, event.target.value)}
            aria-label={t(TEXT.CLINICAL_TEMPLATE.SECTION_NAME)}
            placeholder={t(TEXT.CLINICAL_TEMPLATE.NO_SECTION)}
            maxLength={CLINICAL_SECTION_MAX_LENGTH}
            className={tailwind(
              inputBaseClasses,
              'border-transparent bg-transparent px-2 font-semibold hover:border-ink-200',
            )}
          />

          {group.indexes.map((index) => (
            <div
              key={questions[index].id}
              {...dropZone(group, index)}
              className={tailwind(isDropTarget(group, index) && DROP_INDICATOR)}
            >
              <ClinicalQuestionRow
                index={index}
                question={questions[index]}
                canRemove={canRemove}
                isDragging={draggingIndex === index}
                drag={dragQuestion(index)}
                onRemove={() => handleRemoveQuestion(index)}
              />
            </div>
          ))}

          {/* Soltar acá deja la pregunta al final de la sección. */}
          <div
            {...dropZone(group, null)}
            className={tailwind('pt-1', isDropTarget(group, null) && DROP_INDICATOR)}
          >
            {!isFull && (
              <Button
                type="button"
                variant={ButtonVariant.GHOST}
                className="w-fit px-2 text-brand-600 hover:text-brand-700"
                onClick={() => addQuestion(group)}
                icon={<Plus className="h-4 w-4" aria-hidden />}
              >
                {t(TEXT.CLINICAL_TEMPLATE.ADD)}
              </Button>
            )}
          </div>
        </section>
      ))}

      {error && <Typography variant={TypographyVariant.ERROR}>{error}</Typography>}

      {isFull ? (
        <Typography variant={TypographyVariant.HELPER}>
          {t(TEXT.CLINICAL_TEMPLATE.MAX_REACHED, { max: CLINICAL_TEMPLATE_MAX_FIELDS })}
        </Typography>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={newSectionName}
            onChange={(event) => handleNewSectionNameChange(event.target.value)}
            onKeyDown={(event) => {
              // Enter crea la sección en vez de enviar todo el formulario.
              if (event.key !== 'Enter') return;
              event.preventDefault();
              addSection();
            }}
            aria-label={t(TEXT.CLINICAL_TEMPLATE.NEW_SECTION)}
            placeholder={t(TEXT.CLINICAL_TEMPLATE.NEW_SECTION)}
            maxLength={CLINICAL_SECTION_MAX_LENGTH}
            className={inputBaseClasses}
          />
          <Button
            type="button"
            variant={ButtonVariant.SECONDARY}
            className="shrink-0"
            disabled={!newSectionName.trim()}
            onClick={addSection}
            icon={<Plus className="h-4 w-4" aria-hidden />}
          >
            {t(TEXT.CLINICAL_TEMPLATE.ADD_SECTION)}
          </Button>
        </div>
      )}
    </div>
  );
};
