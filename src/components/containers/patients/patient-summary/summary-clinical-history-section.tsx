import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import {
  buildStandardFields,
  detailOf,
  groupFields,
  resolveAnswers,
  textOf,
  withoutPhysicalExam,
  yesNoLabel,
  yesNoOf,
} from '../patient-background/clinical-history';
import { SummaryBackground } from './patient-summary-types';
import { buildAuthorship } from './summary-authorship';
import { SummaryEditableText } from './summary-editable-text';
import { SummarySectionTitle } from './summary-section-title';

interface SummaryClinicalHistorySectionProps {
  summaryBackground: SummaryBackground;
}

export const SummaryClinicalHistorySection: React.FC<SummaryClinicalHistorySectionProps> = ({
  summaryBackground,
}) => {
  const { t } = useTranslation();
  const { background, authorName } = summaryBackground;
  const answers = resolveAnswers(background);
  // Lo que no se respondió no se imprime: la hoja lleva solo lo que el paciente contestó.
  const groups = groupFields(
    withoutPhysicalExam(background.templateSnapshot ?? buildStandardFields(t)),
  )
    .map((group) => ({
      ...group,
      booleans: group.booleans.filter((field) => yesNoOf(answers[field.id]) !== null),
      texts: group.texts.filter((field) => textOf(answers[field.id]) !== ''),
    }))
    .filter((group) => group.booleans.length > 0 || group.texts.length > 0);

  return (
    <section data-print-summary-section="" className="flex flex-col gap-3">
      <SummarySectionTitle
        title={t(TEXT.PATIENTS.CLINICAL_SUMMARY.SECTIONS.BACKGROUND)}
        authorship={buildAuthorship(t, authorName, background.updatedAt)}
      />
      {groups.length === 0 && (
        <Typography variant={TypographyVariant.BODY}>
          {t(TEXT.PATIENTS.CLINICAL_SUMMARY.NO_ANSWERS)}
        </Typography>
      )}
      {groups.map((group) => (
        <div key={group.key} className="flex flex-col gap-1">
          {group.title && <Typography variant={TypographyVariant.ACCENT}>{group.title}</Typography>}
          {group.booleans.length > 0 && (
            <ul className="grid grid-cols-2 gap-x-6 gap-y-0.5">
              {group.booleans.map((field) => {
                const answer = yesNoOf(answers[field.id]);
                const detail = detailOf(answers[field.id]);
                return (
                  <li key={field.id} className="break-inside-avoid text-sm text-ink-800">
                    <span className="flex justify-between gap-2">
                      <span>{field.label}</span>
                      <span className={answer ? 'font-bold' : 'text-ink-500'}>
                        {yesNoLabel(t, answer)}
                      </span>
                    </span>
                    {answer && detail && field.detailLabel && (
                      <span className="block text-xs text-ink-600">
                        {field.detailLabel} <SummaryEditableText>{detail}</SummaryEditableText>
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          {group.texts.map((field) => (
            <div key={field.id} className="break-inside-avoid">
              <Typography variant={TypographyVariant.HELPER}>{field.label}</Typography>
              <SummaryEditableText as="p" className="whitespace-pre-line text-sm text-ink-800">
                {textOf(answers[field.id])}
              </SummaryEditableText>
            </div>
          ))}
        </div>
      ))}
    </section>
  );
};
