import React from 'react';
import { useTranslation } from 'react-i18next';
import { PillSelect, PillSelectVariant } from '@/components/common/pill-select/pill-select';
import { TEXT } from '@/static/texts/i18n';
import { WEBER_FREQUENCIES_HZ, WEBER_RESULTS, WeberResult } from './audiometry-constants';
import { WEBER_LABEL_KEYS } from './audiometry-labels';
import { WEBER_ICONS } from './weber-icons';
import { ReadOnlyValue } from './audiometry-read-only-value';

const SUMMARY_TEXT = TEXT.PATIENTS.DETAIL.AUDIOMETRY.SUMMARY;

interface WeberTestProps {
  weber: Record<number, WeberResult>;
  onWeberChange: (frequencyHz: number, result: WeberResult) => void;
  isReadOnly?: boolean;
}

export const WeberTest: React.FC<WeberTestProps> = ({
  weber,
  onWeberChange,
  isReadOnly = false,
}) => {
  const { t } = useTranslation();

  const weberOptions = WEBER_RESULTS.map((result) => ({
    value: result,
    label: t(WEBER_LABEL_KEYS[result]),
    icon: WEBER_ICONS[result],
    isLabelHidden: true,
  }));

  return (
    <div className="flex flex-col gap-2">
      <h5 className="text-sm font-semibold text-ink-700">{t(SUMMARY_TEXT.WEBER_TITLE)}</h5>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {WEBER_FREQUENCIES_HZ.map((frequencyHz) => (
          <div key={frequencyHz} className="flex flex-col gap-1">
            <span className="text-sm text-ink-700">
              {t(SUMMARY_TEXT.WEBER_FREQUENCY, { frequency: frequencyHz })}
            </span>
            {isReadOnly ? (
              <span className="flex items-center gap-1.5">
                {weber[frequencyHz] && WEBER_ICONS[weber[frequencyHz]]}
                <ReadOnlyValue
                  value={weber[frequencyHz] ? t(WEBER_LABEL_KEYS[weber[frequencyHz]]) : null}
                  className="text-sm text-ink-900"
                />
              </span>
            ) : (
              <PillSelect
                variant={PillSelectVariant.FIELD}
                ariaLabel={t(SUMMARY_TEXT.WEBER_ARIA, { frequency: frequencyHz })}
                value={weber[frequencyHz]}
                options={weberOptions}
                onChange={(value) => onWeberChange(frequencyHz, value as WeberResult)}
                isSheetOnMobile
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
