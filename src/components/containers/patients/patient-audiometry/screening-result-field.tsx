import React from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox } from '@/components/common/checkbox/checkbox';
import { TEXT } from '@/static/texts/i18n';
import { SCREENING_RESULTS, ScreeningResult } from './audiometry-constants';
import { SCREENING_RESULT_LABEL_KEYS } from './audiometry-labels';
import { ReadOnlyValue } from './audiometry-read-only-value';

const SCREENING_TEXT = TEXT.PATIENTS.DETAIL.AUDIOMETRY.SCREENING;

interface ScreeningResultFieldProps {
  result: ScreeningResult | null;
  onResultChange: (result: ScreeningResult) => void;
  isMissing: boolean;
  isReadOnly: boolean;
}

/** Pasa y Refiere se excluyen: marcar uno desmarca el otro y no se puede dejar sin resultado. */
export const ScreeningResultField: React.FC<ScreeningResultFieldProps> = ({
  result,
  onResultChange,
  isMissing,
  isReadOnly,
}) => {
  const { t } = useTranslation();

  return (
    <section
      role="group"
      aria-label={t(SCREENING_TEXT.RESULT_LABEL)}
      className="flex flex-col gap-2 border-t border-ink-100 pt-6"
    >
      <p className="text-sm font-medium text-ink-700 md:text-base">
        {t(SCREENING_TEXT.RESULT_LABEL)}
      </p>
      {isReadOnly ? (
        <ReadOnlyValue
          value={result ? t(SCREENING_RESULT_LABEL_KEYS[result]) : ''}
          className="block text-sm text-ink-900 md:text-base"
        />
      ) : (
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          {SCREENING_RESULTS.map((option) => (
            <Checkbox
              key={option}
              isChecked={result === option}
              onChange={() => onResultChange(option)}
              label={t(SCREENING_RESULT_LABEL_KEYS[option])}
              className="min-h-[44px] text-base"
            />
          ))}
        </div>
      )}
      {isMissing && result === null && (
        <p role="alert" className="text-sm text-danger">
          {t(SCREENING_TEXT.RESULT_REQUIRED)}
        </p>
      )}
    </section>
  );
};
