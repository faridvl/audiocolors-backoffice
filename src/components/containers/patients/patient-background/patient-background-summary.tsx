import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import {
  BACKGROUND_SECTIONS,
  BackgroundCondition,
  PatientBackground,
} from '@/types/patients/patient-background';
import { BackgroundAnswerRow } from './background-answer-row';

const EarDatum: React.FC<{ label: string; value: string | null }> = ({ label, value }) => {
  const { t } = useTranslation();
  const text = value?.trim();

  return (
    <div className="flex flex-col gap-0.5 rounded-lg bg-ink-50 px-3 py-2">
      <Typography variant={TypographyVariant.HELPER}>{label}</Typography>
      <Typography
        variant={TypographyVariant.BODY}
        className={text ? 'whitespace-pre-wrap text-ink-800' : 'text-ink-400'}
      >
        {text || t(TEXT.GENERAL.NOT_REGISTERED)}
      </Typography>
    </div>
  );
};

interface PatientBackgroundSummaryProps {
  background: PatientBackground;
  authorship: string[];
}

/** La hoja ya llena, con la misma grilla que el formulario: todos los antecedentes a la vista. */
export const PatientBackgroundSummary: React.FC<PatientBackgroundSummaryProps> = ({
  background,
  authorship,
}) => {
  const { t } = useTranslation();
  const tone = background.tinnitusTone?.trim();

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-col gap-2">
        <Typography variant={TypographyVariant.SUBTITLE}>
          {t(TEXT.PATIENTS.BACKGROUND.HISTORY_TITLE)}
        </Typography>
        <div className="grid items-start gap-x-8 gap-y-4 sm:grid-cols-2 xl:grid-cols-4">
          {BACKGROUND_SECTIONS.map(({ section, hasTitle, conditions }) => (
            <div key={section} className="flex min-w-0 flex-col">
              {hasTitle && (
                <Typography variant={TypographyVariant.BODY_SEMIBOLD} className="mb-0.5">
                  {t(`${TEXT.PATIENTS.BACKGROUND.SECTION_PREFIX}.${section}`)}
                </Typography>
              )}
              {conditions.map((condition) => (
                <BackgroundAnswerRow
                  key={condition}
                  label={t(`${TEXT.PATIENTS.BACKGROUND.CONDITION_PREFIX}.${condition}`)}
                  isChecked={background[condition]}
                  detail={
                    condition === BackgroundCondition.TINNITUS && tone
                      ? t(TEXT.PATIENTS.BACKGROUND.TONE_VALUE, { tone })
                      : null
                  }
                />
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <Typography variant={TypographyVariant.SUBTITLE}>
          {t(TEXT.PATIENTS.BACKGROUND.OTOSCOPY_TITLE)}
        </Typography>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <EarDatum
            label={t(TEXT.PATIENTS.BACKGROUND.RIGHT_EAR)}
            value={background.otoscopyRight}
          />
          <EarDatum label={t(TEXT.PATIENTS.BACKGROUND.LEFT_EAR)} value={background.otoscopyLeft} />
        </div>
      </section>

      <div className="flex flex-col border-t border-ink-100 pt-3">
        {authorship.map((line) => (
          <Typography key={line} variant={TypographyVariant.HELPER}>
            {line}
          </Typography>
        ))}
      </div>
    </div>
  );
};
