import React from 'react';
import { ErrorMessage, Field } from 'formik';
import { GripVertical, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { inputBaseClasses } from '@/components/common/input/input';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { CLINICAL_FIELD_LABEL_MAX_LENGTH } from '@/types/clinical-templates/clinical-template';
import { tailwind } from '@/utils/tailwind-utils';
import { ClinicalQuestionFormValues, ClinicalQuestionKind } from './clinical-template-form';
import { QuestionDragProps } from './use-clinical-template-editor';

interface ClinicalQuestionRowProps {
  index: number;
  question: ClinicalQuestionFormValues;
  canRemove: boolean;
  isDragging: boolean;
  drag: QuestionDragProps;
  onRemove: () => void;
}

const FieldError: React.FC<{ name: string }> = ({ name }) => (
  <ErrorMessage name={name}>
    {(message) => <Typography variant={TypographyVariant.ERROR}>{message}</Typography>}
  </ErrorMessage>
);

export const ClinicalQuestionRow: React.FC<ClinicalQuestionRowProps> = ({
  index,
  question,
  canRemove,
  isDragging,
  drag,
  onRemove,
}) => {
  const { t } = useTranslation();
  const name = `questions.${index}`;

  return (
    <div
      data-question-row
      className={tailwind('flex gap-1 border-b border-ink-100 py-3', isDragging && 'opacity-40')}
    >
      {/*
        Solo el asa es arrastrable: así se puede seleccionar el texto de los campos. En el
        celular no se muestra: el arrastre nativo no funciona con el dedo.
      */}
      <button
        type="button"
        draggable
        {...drag}
        aria-label={t(TEXT.CLINICAL_TEMPLATE.DRAG_HANDLE)}
        className="hidden h-[46px] w-6 shrink-0 cursor-grab sm:flex items-center justify-center text-ink-400 hover:text-ink-700 active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" aria-hidden />
      </button>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-col gap-2 xl:flex-row xl:items-start">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <Field
              name={`${name}.label`}
              aria-label={t(TEXT.CLINICAL_TEMPLATE.LABEL)}
              placeholder={t(TEXT.CLINICAL_TEMPLATE.LABEL_PLACEHOLDER)}
              maxLength={CLINICAL_FIELD_LABEL_MAX_LENGTH}
              className={inputBaseClasses}
            />
            <FieldError name={`${name}.label`} />
          </div>

          <div className="flex items-start gap-2">
            <Field
              as="select"
              name={`${name}.kind`}
              aria-label={t(TEXT.CLINICAL_TEMPLATE.KIND)}
              className={tailwind(inputBaseClasses, 'min-w-0 flex-1 xl:w-56 xl:flex-none')}
            >
              {Object.values(ClinicalQuestionKind).map((kind) => (
                <option key={kind} value={kind}>
                  {t(`${TEXT.CLINICAL_TEMPLATE.KIND_PREFIX}.${kind}`)}
                </option>
              ))}
            </Field>
            {canRemove && (
              <Button
                type="button"
                variant={ButtonVariant.GHOST}
                className="w-11 shrink-0 px-0 hover:bg-danger/10 hover:text-danger"
                onClick={onRemove}
                aria-label={t(TEXT.CLINICAL_TEMPLATE.REMOVE)}
                icon={<Trash2 className="h-4 w-4" aria-hidden />}
              />
            )}
          </div>
        </div>

        {question.kind === ClinicalQuestionKind.YES_NO_DETAIL && (
          <div className="flex flex-col gap-1">
            <Field
              name={`${name}.detailLabel`}
              aria-label={t(TEXT.CLINICAL_TEMPLATE.DETAIL_LABEL)}
              placeholder={t(TEXT.CLINICAL_TEMPLATE.DETAIL_PLACEHOLDER)}
              maxLength={CLINICAL_FIELD_LABEL_MAX_LENGTH}
              className={inputBaseClasses}
            />
            <FieldError name={`${name}.detailLabel`} />
          </div>
        )}
      </div>
    </div>
  );
};
