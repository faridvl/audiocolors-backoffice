import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { PatientBackground } from '@/types/patients/patient-background';
import { BackgroundSummaryGroup } from './use-patient-background';

const EarDatum: React.FC<{ label: string; value: string | null }> = ({ label, value }) => {
  const { t } = useTranslation();
  const text = value?.trim();

  return (
    <div className="flex flex-col gap-0.5">
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
  groups: BackgroundSummaryGroup[];
  authorship: string[];
}

export const PatientBackgroundSummary: React.FC<PatientBackgroundSummaryProps> = ({
  background,
  groups,
  authorship,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Typography variant={TypographyVariant.HELPER}>
          {t(TEXT.PATIENTS.BACKGROUND.HISTORY_TITLE)}
        </Typography>
        {groups.length === 0 ? (
          <Typography variant={TypographyVariant.BODY} className="text-ink-400">
            {t(TEXT.PATIENTS.BACKGROUND.NO_HISTORY)}
          </Typography>
        ) : (
          <ul className="flex flex-col gap-1">
            {groups.map((group) => (
              <li key={group.key}>
                <Typography variant={TypographyVariant.BODY} className="text-ink-800">
                  {group.title && <span className="font-semibold">{group.title}: </span>}
                  {group.items.join(' · ')}
                </Typography>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <Typography variant={TypographyVariant.HELPER}>
          {t(TEXT.PATIENTS.BACKGROUND.OTOSCOPY_TITLE)}
        </Typography>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <EarDatum
            label={t(TEXT.PATIENTS.BACKGROUND.RIGHT_EAR)}
            value={background.otoscopyRight}
          />
          <EarDatum label={t(TEXT.PATIENTS.BACKGROUND.LEFT_EAR)} value={background.otoscopyLeft} />
        </div>
      </div>

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
