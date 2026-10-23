import React from 'react';
import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { FormField } from '@/components/common/input/input';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import {
  CLINICAL_FIELD_LABEL_MAX_LENGTH,
  CLINICAL_SECTION_MAX_LENGTH,
} from '@/types/clinical-templates/clinical-template';
import { ClinicalQuestionFormValues, ClinicalQuestionKind } from './clinical-template-form';

interface ClinicalQuestionCardProps {
  index: number;
  question: ClinicalQuestionFormValues;
  isFirst: boolean;
  isLast: boolean;
  canRemove: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}

const ICON_BUTTON = 'min-h-[40px] w-10 px-0';

export const ClinicalQuestionCard: React.FC<ClinicalQuestionCardProps> = ({
  index,
  question,
  isFirst,
  isLast,
  canRemove,
  onMoveUp,
  onMoveDown,
  onRemove,
}) => {
  const { t } = useTranslation();
  const name = `questions.${index}`;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-ink-200 bg-white p-3 sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <Typography variant={TypographyVariant.HELPER}>
          {t(TEXT.CLINICAL_TEMPLATE.QUESTION_NUMBER, { number: index + 1 })}
        </Typography>
        <div className="flex items-center">
          <Button
            type="button"
            variant={ButtonVariant.GHOST}
            className={ICON_BUTTON}
            onClick={onMoveUp}
            disabled={isFirst}
            aria-label={t(TEXT.CLINICAL_TEMPLATE.MOVE_UP)}
            icon={<ArrowUp className="h-4 w-4" aria-hidden />}
          />
          <Button
            type="button"
            variant={ButtonVariant.GHOST}
            className={ICON_BUTTON}
            onClick={onMoveDown}
            disabled={isLast}
            aria-label={t(TEXT.CLINICAL_TEMPLATE.MOVE_DOWN)}
            icon={<ArrowDown className="h-4 w-4" aria-hidden />}
          />
          {canRemove && (
            <Button
              type="button"
              variant={ButtonVariant.GHOST}
              className={`${ICON_BUTTON} hover:bg-danger/10 hover:text-danger`}
              onClick={onRemove}
              aria-label={t(TEXT.CLINICAL_TEMPLATE.REMOVE)}
              icon={<Trash2 className="h-4 w-4" aria-hidden />}
            />
          )}
        </div>
      </div>

      <FormField
        name={`${name}.label`}
        label={t(TEXT.CLINICAL_TEMPLATE.LABEL)}
        maxLength={CLINICAL_FIELD_LABEL_MAX_LENGTH}
        required
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <FormField
          name={`${name}.section`}
          label={t(TEXT.CLINICAL_TEMPLATE.SECTION)}
          hint={isFirst ? t(TEXT.CLINICAL_TEMPLATE.SECTION_HINT) : undefined}
          maxLength={CLINICAL_SECTION_MAX_LENGTH}
          optional
        />
        <FormField name={`${name}.kind`} label={t(TEXT.CLINICAL_TEMPLATE.KIND)} as="select">
          {Object.values(ClinicalQuestionKind).map((kind) => (
            <option key={kind} value={kind}>
              {t(`${TEXT.CLINICAL_TEMPLATE.KIND_PREFIX}.${kind}`)}
            </option>
          ))}
        </FormField>
      </div>

      {question.kind === ClinicalQuestionKind.YES_NO_DETAIL && (
        <FormField
          name={`${name}.detailLabel`}
          label={t(TEXT.CLINICAL_TEMPLATE.DETAIL_LABEL)}
          hint={t(TEXT.CLINICAL_TEMPLATE.DETAIL_HINT)}
          maxLength={CLINICAL_FIELD_LABEL_MAX_LENGTH}
          required
        />
      )}
    </div>
  );
};
