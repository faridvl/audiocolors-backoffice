import React from 'react';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { FormField } from '@/components/common/input/input';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { ClinicalField, ClinicalFieldType } from '@/types/clinical-templates/clinical-template';
import {
  BACKGROUND_DETAIL_MAX_LENGTH,
  BACKGROUND_TEXT_MAX_LENGTH,
} from '@/types/patients/patient-background';
import { tailwind } from '@/utils/tailwind-utils';
import { BackgroundConditionRow } from './background-condition-row';
import { ClinicalHistoryFormValues, groupFields } from './clinical-history';
import {
  CLINICAL_SECTIONS_COLUMNS,
  CLINICAL_SHEET_WIDTH,
  CLINICAL_TEXTS_GRID,
} from './clinical-history-styles';
import { ClinicalSectionCard } from './clinical-section-card';

/** La hoja de la historia clínica armada con las preguntas de la clínica. Va dentro de un Formik. */
export const PatientBackgroundFields: React.FC<{ fields: ClinicalField[] }> = ({ fields }) => {
  const { t } = useTranslation();
  const { values, setFieldValue } = useFormikContext<ClinicalHistoryFormValues>();
  const groups = groupFields(fields);
  const booleanGroups = groups.filter((group) => group.booleans.length > 0);
  const textGroups = groups.filter((group) => group.texts.length > 0);
  const booleanFields = booleanGroups.flatMap((group) => group.booleans);
  const missingCount = booleanFields.filter((field) => values.checks[field.id] == null).length;
  const totalCount = booleanFields.length;

  return (
    <div className={tailwind('flex flex-col gap-5', CLINICAL_SHEET_WIDTH)}>
      {booleanGroups.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <Typography variant={TypographyVariant.SUBTITLE}>
              {t(TEXT.PATIENTS.BACKGROUND.HISTORY_TITLE)}
            </Typography>
            <div role="status">
              <Typography variant={TypographyVariant.HELPER} className="text-ink-600">
                {missingCount > 0
                  ? t(TEXT.PATIENTS.BACKGROUND.PROGRESS_MISSING, {
                      count: missingCount,
                      total: totalCount,
                    })
                  : t(TEXT.PATIENTS.BACKGROUND.PROGRESS_DONE, { total: totalCount })}
              </Typography>
            </div>
          </div>
          <div className={CLINICAL_SECTIONS_COLUMNS}>
            {booleanGroups.map((group) => (
              <ClinicalSectionCard key={group.key} title={group.title}>
                {group.booleans.map((field) => {
                  const answer = values.checks[field.id] ?? null;
                  return (
                    <React.Fragment key={field.id}>
                      <BackgroundConditionRow
                        label={field.label}
                        answer={answer}
                        onChange={(value) => setFieldValue(`checks.${field.id}`, value)}
                      />
                      {/* El detalle va pegado a su pregunta, no al pie de la hoja. */}
                      {field.detailLabel && answer === true && (
                        <FormField
                          className="pb-2"
                          name={`details.${field.id}`}
                          label={field.detailLabel}
                          maxLength={BACKGROUND_DETAIL_MAX_LENGTH}
                          showCount
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </ClinicalSectionCard>
            ))}
          </div>
        </div>
      )}

      {textGroups.map((group) => (
        <div key={group.key} className="flex flex-col gap-2">
          {group.title && (
            <Typography variant={TypographyVariant.SUBTITLE}>{group.title}</Typography>
          )}
          <div className={CLINICAL_TEXTS_GRID}>
            {group.texts.map((field) => (
              <FormField
                key={field.id}
                as={field.fieldType === ClinicalFieldType.TEXTAREA ? 'textarea' : 'input'}
                name={`texts.${field.id}`}
                label={field.label}
                maxLength={BACKGROUND_TEXT_MAX_LENGTH}
                showCount
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
