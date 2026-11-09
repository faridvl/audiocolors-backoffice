import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { ClinicalAnswer, ClinicalField } from '@/types/clinical-templates/clinical-template';
import { tailwind } from '@/utils/tailwind-utils';
import { BackgroundAnswerRow } from './background-answer-row';
import { detailOf, groupFields, textOf, yesNoOf } from './clinical-history';
import {
  CLINICAL_SECTIONS_COLUMNS,
  CLINICAL_SHEET_WIDTH,
  CLINICAL_TEXTS_GRID,
} from './clinical-history-styles';
import { ClinicalSectionCard } from './clinical-section-card';

const TextAnswer: React.FC<{ label: string; value: string; isMuted: boolean }> = ({
  label,
  value,
  isMuted,
}) => {
  return (
    <div className="flex flex-col gap-0.5 py-2">
      <Typography variant={TypographyVariant.HELPER}>{label}</Typography>
      <Typography
        variant={TypographyVariant.BODY}
        className={tailwind(
          value ? 'whitespace-pre-wrap [overflow-wrap:anywhere]' : 'text-ink-400',
          value && (isMuted ? 'text-ink-600' : 'text-ink-800'),
        )}
      >
        {value}
      </Typography>
    </div>
  );
};

interface PatientBackgroundSummaryProps {
  /** Las preguntas tal como estaban al llenarla. */
  fields: ClinicalField[];
  answers: Record<string, ClinicalAnswer>;
  /** Líneas de autoría al pie; sin ellas no se pinta el pie. */
  authorship?: string[];
  /** Con `false` las preguntas Sí/No van sin el título "Antecedentes" (otras secciones de Preguntas). */
  showsHistoryTitle?: boolean;
  /** Registros anteriores: las respuestas se leen más apagadas que las del último. */
  isMuted?: boolean;
}

/** La hoja ya llena, con la misma grilla que el formulario: todas las preguntas a la vista. */
export const PatientBackgroundSummary: React.FC<PatientBackgroundSummaryProps> = ({
  fields,
  answers,
  authorship = [],
  showsHistoryTitle = true,
  isMuted = false,
}) => {
  const { t } = useTranslation();
  const groups = groupFields(fields);
  const booleanGroups = groups.filter((group) => group.booleans.length > 0);
  const textGroups = groups.filter((group) => group.texts.length > 0);

  return (
    <div className={tailwind('flex flex-col gap-5', CLINICAL_SHEET_WIDTH)}>
      {booleanGroups.length > 0 && (
        <section className="flex flex-col gap-2">
          {showsHistoryTitle && (
            <Typography variant={TypographyVariant.SUBTITLE}>
              {t(TEXT.PATIENTS.BACKGROUND.HISTORY_TITLE)}
            </Typography>
          )}
          <div className={CLINICAL_SECTIONS_COLUMNS}>
            {booleanGroups.map((group) => (
              <ClinicalSectionCard key={group.key} title={group.title}>
                {group.booleans.map((field) => (
                  <BackgroundAnswerRow
                    key={field.id}
                    label={field.label}
                    answer={yesNoOf(answers[field.id])}
                    detail={detailOf(answers[field.id]) || null}
                    detailLabel={field.detailLabel}
                    isMuted={isMuted}
                  />
                ))}
              </ClinicalSectionCard>
            ))}
          </div>
        </section>
      )}

      {textGroups.map((group) => (
        <section key={group.key} className="flex flex-col gap-2">
          {group.title && (
            <Typography variant={TypographyVariant.SUBTITLE}>{group.title}</Typography>
          )}
          <div className={CLINICAL_TEXTS_GRID}>
            {group.texts.map((field) => (
              <TextAnswer
                key={field.id}
                label={field.label}
                value={textOf(answers[field.id])}
                isMuted={isMuted}
              />
            ))}
          </div>
        </section>
      ))}

      {authorship.length > 0 && (
        <div className="flex flex-col border-t border-ink-100 pt-3">
          {authorship.map((line) => (
            <Typography key={line} variant={TypographyVariant.HELPER}>
              {line}
            </Typography>
          ))}
        </div>
      )}
    </div>
  );
};
