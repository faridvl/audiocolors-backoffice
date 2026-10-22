import React from 'react';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { FormField } from '@/components/common/input/input';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import {
  BACKGROUND_OTOSCOPY_MAX_LENGTH,
  BACKGROUND_SECTIONS,
  BACKGROUND_TONE_MAX_LENGTH,
  BackgroundCondition,
} from '@/types/patients/patient-background';
import { BackgroundConditionRow } from './background-condition-row';
import { PatientBackgroundFormValues } from './use-patient-background-form';

/** Campos de la hoja de historia clínica. Va dentro de un Formik con `PatientBackgroundFormValues`. */
export const PatientBackgroundFields: React.FC = () => {
  const { t } = useTranslation();
  const { values, setFieldValue } = useFormikContext<PatientBackgroundFormValues>();

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <Typography variant={TypographyVariant.SUBTITLE}>
          {t(TEXT.PATIENTS.BACKGROUND.HISTORY_TITLE)}
        </Typography>

        {/* Columnas angostas: en pantalla ancha cada Sí/No queda junto a su antecedente. */}
        <div className="grid items-start gap-x-8 gap-y-4 sm:grid-cols-2 xl:grid-cols-4">
          {BACKGROUND_SECTIONS.map(({ section, hasTitle, conditions }) => (
            <div key={section} className="flex min-w-0 flex-col">
              {hasTitle && (
                <Typography variant={TypographyVariant.BODY_SEMIBOLD} className="mb-0.5">
                  {t(`${TEXT.PATIENTS.BACKGROUND.SECTION_PREFIX}.${section}`)}
                </Typography>
              )}
              {conditions.map((condition) => (
                <BackgroundConditionRow
                  key={condition}
                  label={t(`${TEXT.PATIENTS.BACKGROUND.CONDITION_PREFIX}.${condition}`)}
                  isChecked={values[condition]}
                  onChange={(isChecked) => setFieldValue(condition, isChecked)}
                />
              ))}
            </div>
          ))}
        </div>

        {values[BackgroundCondition.TINNITUS] && (
          <FormField
            className="sm:max-w-sm"
            name="tinnitusTone"
            label={t(TEXT.PATIENTS.BACKGROUND.TINNITUS_TONE)}
            maxLength={BACKGROUND_TONE_MAX_LENGTH}
          />
        )}
      </section>

      <section className="flex flex-col gap-3">
        <Typography variant={TypographyVariant.SUBTITLE}>
          {t(TEXT.PATIENTS.BACKGROUND.OTOSCOPY_TITLE)}
        </Typography>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField
            as="textarea"
            name="otoscopyRight"
            label={t(TEXT.PATIENTS.BACKGROUND.RIGHT_EAR)}
            maxLength={BACKGROUND_OTOSCOPY_MAX_LENGTH}
          />
          <FormField
            as="textarea"
            name="otoscopyLeft"
            label={t(TEXT.PATIENTS.BACKGROUND.LEFT_EAR)}
            maxLength={BACKGROUND_OTOSCOPY_MAX_LENGTH}
          />
        </div>
      </section>
    </div>
  );
};
