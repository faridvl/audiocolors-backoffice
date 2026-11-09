import React from 'react';
import { useTranslation } from 'react-i18next';
import { InfoPopover } from '@/components/common/info-popover/info-popover';
import {
  SegmentedControl,
  SegmentedControlSize,
} from '@/components/common/segmented-control/segmented-control';
import { PillSelect, PillSelectVariant } from '@/components/common/pill-select/pill-select';
import { inputBaseClasses } from '@/components/common/input/input';
import { TEXT } from '@/static/texts/i18n';
import { tailwind } from '@/utils/tailwind-utils';
import {
  BAND_LOWER_BOUND_OFFSET_DB,
  EARS,
  Ear,
  GRADING_SCALES,
  GRADING_SCALE_CONFIG,
  GradingScale,
  HearingGrade,
  PTA_FREQUENCIES_HZ,
  PRESENTED_WORDS_BY_LIST_TYPE,
  PTA_TYPES,
  PtaType,
  SPEECH_FAILED_WORDS_MIN,
  SPEECH_MAX_PERCENT,
  SPEECH_FIELD_RANGES,
  SpeechField,
  SpeechFieldValues,
} from './audiometry-constants';
import { WordListType } from './speech-word-lists';
import { ReadOnlyValue } from './audiometry-read-only-value';
import { WORD_LIST_TYPE_LABEL_KEYS } from './speech-word-list-selectors';
import { EarSummary } from './audiometry-calculations';
import {
  EAR_LABEL_KEYS,
  GRADE_LABEL_KEYS,
  GRADING_SCALE_LABEL_KEYS,
  GRADING_SCALE_SOURCE_KEYS,
  PTA_TYPE_LABEL_KEYS,
} from './audiometry-labels';

// En móvil el selector se trunca para dejar sitio al botón de info y a las dos columnas de oídos.
const PTA_SELECT_CLASSES = 'min-w-0 flex-1 pl-2.5 pr-9 sm:pl-3 sm:pr-11';
// El botón de info mide 40 px con el ícono centrado: el margen negativo recupera ancho sin achicar el área táctil.
const PTA_INFO_CLASSES = '-ml-2 sm:ml-0';
const PTA_LABEL_CELL_CLASSES = 'max-w-[10rem] sm:max-w-none';
const CELL_PADDING_CLASSES = 'px-1.5 sm:px-2';
const EAR_HEADER_CLASSES = 'text-xs sm:text-sm';
const FREQUENCIES_LOCALE = 'es';
const frequenciesFormatter = new Intl.ListFormat(FREQUENCIES_LOCALE, {
  style: 'long',
  type: 'conjunction',
});

// Mismo código de color que el audiograma: oído izquierdo azul, derecho rojo.
const GRADE_HIGHLIGHT_CLASSES: Record<Ear, string> = {
  [Ear.LEFT]: 'bg-info/10 font-semibold text-ink-800',
  [Ear.RIGHT]: 'bg-danger/10 font-semibold text-ink-800',
};
const EAR_VALUE_CLASSES: Record<Ear, string> = {
  [Ear.LEFT]: 'font-medium text-info',
  [Ear.RIGHT]: 'font-medium text-danger-700',
};
const GRADE_HIGHLIGHT_BOTH_EARS_CLASSES =
  'bg-gradient-to-r from-info/10 to-danger/10 font-semibold text-ink-800';

const SUMMARY_TEXT = TEXT.PATIENTS.DETAIL.AUDIOMETRY.SUMMARY;

const SPEECH_INPUT_CLASSES = 'w-full min-w-[3rem] px-2 py-1.5 sm:min-w-[3.5rem]';
const SPEECH_FIELD_ARIA_KEYS: Record<SpeechField, string> = {
  [SpeechField.THRESHOLD]: SUMMARY_TEXT.SPEECH_THRESHOLD_ARIA,
  [SpeechField.MAX_DISCRIMINATION]: SUMMARY_TEXT.MAX_DISCRIMINATION_ARIA,
};

interface SummaryRow {
  labelKey: string;
  isPta?: boolean;
  hasGradeInfo?: boolean;
  speechField?: SpeechField;
  isFailedWords?: boolean;
  getValue?: (summary: EarSummary) => string | number | null;
}

interface AudiometrySummaryProps {
  summaries: Record<Ear, EarSummary>;
  ptaType: PtaType;
  onPtaTypeChange: (ptaType: PtaType) => void;
  gradingScale: GradingScale;
  onGradingScaleChange: (gradingScale: GradingScale) => void;
  speechFieldValues: SpeechFieldValues;
  onSpeechFieldChange: (ear: Ear, field: SpeechField, text: string) => void;
  failedWords: Record<Ear, string>;
  presentedWords: number;
  onFailedWordsChange: (ear: Ear, text: string) => void;
  isReadOnly?: boolean;
}

export const AudiometrySummary: React.FC<AudiometrySummaryProps> = ({
  summaries,
  ptaType,
  onPtaTypeChange,
  gradingScale,
  onGradingScaleChange,
  speechFieldValues,
  onSpeechFieldChange,
  failedWords,
  presentedWords,
  onFailedWordsChange,
  isReadOnly = false,
}) => {
  const { t } = useTranslation();

  const getGradeHighlight = (grade: HearingGrade): string | null => {
    const isLeft = summaries[Ear.LEFT].grade === grade;
    const isRight = summaries[Ear.RIGHT].grade === grade;
    if (isLeft && isRight) return GRADE_HIGHLIGHT_BOTH_EARS_CLASSES;
    if (isLeft) return GRADE_HIGHLIGHT_CLASSES[Ear.LEFT];
    if (isRight) return GRADE_HIGHLIGHT_CLASSES[Ear.RIGHT];
    return null;
  };

  const rows: SummaryRow[] = [
    {
      labelKey: SUMMARY_TEXT.PTA,
      isPta: true,
      getValue: (summary) =>
        summary.pta === null ? null : t(SUMMARY_TEXT.PTA_VALUE, { value: summary.pta }),
    },
    {
      labelKey: SUMMARY_TEXT.GRADE,
      hasGradeInfo: true,
      getValue: (summary) => (summary.grade ? t(GRADE_LABEL_KEYS[summary.grade]) : null),
    },
    {
      labelKey: SUMMARY_TEXT.SPEECH_THRESHOLD,
      speechField: SpeechField.THRESHOLD,
    },
    {
      labelKey: SUMMARY_TEXT.MAX_DISCRIMINATION,
      speechField: SpeechField.MAX_DISCRIMINATION,
    },
    {
      labelKey: SUMMARY_TEXT.FAILED_WORDS,
      isFailedWords: true,
    },
  ];

  const gradingBands = GRADING_SCALE_CONFIG[gradingScale].bands;
  const gradingScaleOptions = GRADING_SCALES.map((scale) => ({
    value: scale,
    label: t(GRADING_SCALE_LABEL_KEYS[scale]),
  }));

  const ptaOptions = PTA_TYPES.map((type) => ({
    value: type,
    label: t(PTA_TYPE_LABEL_KEYS[type]),
  }));

  return (
    <section className="flex flex-col gap-4">
      <h4 className="text-base font-semibold text-ink-800">{t(SUMMARY_TEXT.TITLE)}</h4>

      <div className="overflow-x-auto rounded-card border border-ink-200">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-left text-ink-700">
            <tr>
              <th scope="col" className={tailwind(CELL_PADDING_CLASSES, 'py-2 font-semibold')}>
                {t(SUMMARY_TEXT.METRIC)}
              </th>
              {EARS.map((ear) => (
                <th
                  key={ear}
                  scope="col"
                  className={tailwind(
                    CELL_PADDING_CLASSES,
                    EAR_HEADER_CLASSES,
                    'py-2 font-semibold',
                  )}
                >
                  {t(EAR_LABEL_KEYS[ear])}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.labelKey} className="border-t border-ink-200">
                <th
                  scope="row"
                  className={tailwind(
                    CELL_PADDING_CLASSES,
                    'py-2 text-left font-medium text-ink-700',
                    row.isPta && PTA_LABEL_CELL_CLASSES,
                  )}
                >
                  {row.isPta ? (
                    <div className="flex items-center gap-1">
                      {isReadOnly ? (
                        <ReadOnlyValue
                          value={t(PTA_TYPE_LABEL_KEYS[ptaType])}
                          className="min-w-0 flex-1"
                        />
                      ) : (
                        <PillSelect
                          variant={PillSelectVariant.FIELD}
                          ariaLabel={t(SUMMARY_TEXT.PTA_TYPE_ARIA)}
                          value={ptaType}
                          options={ptaOptions}
                          onChange={(value) => onPtaTypeChange(value as PtaType)}
                          isSheetOnMobile
                          className={PTA_SELECT_CLASSES}
                        />
                      )}
                      <InfoPopover
                        ariaLabel={t(SUMMARY_TEXT.PTA_INFO_ARIA)}
                        className={PTA_INFO_CLASSES}
                      >
                        <p className="mb-2 font-semibold text-ink-800">
                          {t(SUMMARY_TEXT.PTA_INFO_TITLE)}
                        </p>
                        <ul className="flex flex-col gap-1">
                          {PTA_TYPES.map((type) => (
                            <li
                              key={type}
                              aria-current={type === ptaType ? 'true' : undefined}
                              className={tailwind(
                                'rounded-lg px-2 py-1',
                                type === ptaType && 'bg-brand-50 font-semibold text-ink-800',
                              )}
                            >
                              {t(SUMMARY_TEXT.PTA_INFO_ITEM, {
                                name: t(PTA_TYPE_LABEL_KEYS[type]),
                                frequencies: frequenciesFormatter.format(
                                  PTA_FREQUENCIES_HZ[type].map(String),
                                ),
                              })}
                            </li>
                          ))}
                        </ul>
                      </InfoPopover>
                    </div>
                  ) : row.hasGradeInfo ? (
                    <div className="flex flex-wrap items-center gap-x-1 gap-y-1.5">
                      <span className="flex items-center gap-1">
                        {t(row.labelKey)}
                        <InfoPopover ariaLabel={t(SUMMARY_TEXT.GRADE_INFO_ARIA)}>
                          <p className="mb-2 font-semibold text-ink-800">
                            {t(SUMMARY_TEXT.GRADE_INFO_TITLE, {
                              scale: t(GRADING_SCALE_LABEL_KEYS[gradingScale]),
                            })}
                          </p>
                          <ul className="flex flex-col gap-1">
                            {gradingBands.map((band, index) => (
                              <li
                                key={band.grade}
                                aria-current={getGradeHighlight(band.grade) ? 'true' : undefined}
                                className={tailwind(
                                  'rounded-lg px-2 py-1',
                                  getGradeHighlight(band.grade),
                                )}
                              >
                                {t(
                                  band.isOpenEnded
                                    ? SUMMARY_TEXT.GRADE_INFO_ITEM_OPEN
                                    : SUMMARY_TEXT.GRADE_INFO_ITEM,
                                  {
                                    name: t(GRADE_LABEL_KEYS[band.grade]),
                                    from:
                                      index === 0
                                        ? band.fromDb
                                        : band.fromDb + BAND_LOWER_BOUND_OFFSET_DB,
                                    to: band.toDb,
                                  },
                                )}
                              </li>
                            ))}
                          </ul>
                          <p className="mt-2 text-xs text-ink-500">
                            {t(GRADING_SCALE_SOURCE_KEYS[gradingScale])}
                          </p>
                        </InfoPopover>
                      </span>
                      {isReadOnly ? (
                        <ReadOnlyValue
                          value={t(GRADING_SCALE_LABEL_KEYS[gradingScale])}
                          className="font-normal text-ink-900"
                        />
                      ) : (
                        <SegmentedControl
                          size={SegmentedControlSize.COMPACT}
                          ariaLabel={t(SUMMARY_TEXT.GRADE_SCALE_ARIA)}
                          options={gradingScaleOptions}
                          value={gradingScale}
                          onChange={onGradingScaleChange}
                        />
                      )}
                    </div>
                  ) : row.isFailedWords ? (
                    <span className="flex items-center gap-1">
                      {t(row.labelKey)}
                      <InfoPopover ariaLabel={t(SUMMARY_TEXT.FAILED_WORDS_INFO_ARIA)}>
                        <p className="px-2 py-1">
                          {t(SUMMARY_TEXT.FAILED_WORDS_INFO_ITEM, {
                            name: t(WORD_LIST_TYPE_LABEL_KEYS[WordListType.MONOSYLLABLE]),
                            count: PRESENTED_WORDS_BY_LIST_TYPE[WordListType.MONOSYLLABLE],
                            value:
                              SPEECH_MAX_PERCENT /
                              PRESENTED_WORDS_BY_LIST_TYPE[WordListType.MONOSYLLABLE],
                          })}
                        </p>
                      </InfoPopover>
                    </span>
                  ) : (
                    t(row.labelKey)
                  )}
                </th>
                {EARS.map((ear) => (
                  <td
                    key={ear}
                    className={tailwind(CELL_PADDING_CLASSES, 'py-2', EAR_VALUE_CLASSES[ear])}
                  >
                    {isReadOnly && row.speechField ? (
                      <ReadOnlyValue value={speechFieldValues[ear][row.speechField]} />
                    ) : isReadOnly && row.isFailedWords ? (
                      <ReadOnlyValue value={failedWords[ear]} />
                    ) : row.speechField ? (
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        aria-label={t(SPEECH_FIELD_ARIA_KEYS[row.speechField], {
                          ear: t(EAR_LABEL_KEYS[ear]).toLowerCase(),
                        })}
                        min={SPEECH_FIELD_RANGES[row.speechField].min}
                        max={SPEECH_FIELD_RANGES[row.speechField].max}
                        value={speechFieldValues[ear][row.speechField]}
                        onChange={(event) =>
                          onSpeechFieldChange(
                            ear,
                            row.speechField as SpeechField,
                            event.target.value,
                          )
                        }
                        className={tailwind(
                          inputBaseClasses,
                          SPEECH_INPUT_CLASSES,
                          EAR_VALUE_CLASSES[ear],
                        )}
                      />
                    ) : row.isFailedWords ? (
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        aria-label={t(SUMMARY_TEXT.FAILED_WORDS_ARIA, {
                          ear: t(EAR_LABEL_KEYS[ear]).toLowerCase(),
                        })}
                        min={SPEECH_FAILED_WORDS_MIN}
                        max={presentedWords}
                        value={failedWords[ear]}
                        onChange={(event) => onFailedWordsChange(ear, event.target.value)}
                        className={tailwind(
                          inputBaseClasses,
                          SPEECH_INPUT_CLASSES,
                          EAR_VALUE_CLASSES[ear],
                        )}
                      />
                    ) : (
                      (row.getValue?.(summaries[ear]) ??
                      t(isReadOnly ? TEXT.GENERAL.NOT_RECORDED : SUMMARY_TEXT.EMPTY))
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
