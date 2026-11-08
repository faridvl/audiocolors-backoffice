import React from 'react';
import { useTranslation } from 'react-i18next';
import { PillSelect, PillSelectVariant } from '@/components/common/pill-select/pill-select';
import { TEXT } from '@/static/texts/i18n';
import { WORD_LIST_IDS_BY_TYPE, WordListType } from './speech-word-lists';
import { ReadOnlyValue } from './audiometry-read-only-value';

const WORD_LISTS_TEXT = TEXT.PATIENTS.DETAIL.AUDIOMETRY.WORD_LISTS;

export const WORD_LIST_TYPE_LABEL_KEYS: Record<WordListType, string> = {
  [WordListType.BISYLLABLE]: WORD_LISTS_TEXT.TYPES.BISYLLABLE,
  [WordListType.MONOSYLLABLE]: WORD_LISTS_TEXT.TYPES.MONOSYLLABLE,
};

// En el botón cabe solo el nombre corto; la lista muestra el nombre completo con sus autores.
const WORD_LIST_TYPE_SHORT_LABEL_KEYS: Record<WordListType, string> = {
  [WordListType.BISYLLABLE]: WORD_LISTS_TEXT.TYPES_SHORT.BISYLLABLE,
  [WordListType.MONOSYLLABLE]: WORD_LISTS_TEXT.TYPES_SHORT.MONOSYLLABLE,
};

const WORD_LIST_TYPES = Object.values(WordListType);

interface SpeechWordListSelectorsProps {
  wordListType: WordListType | null;
  wordListId: string | null;
  onWordListTypeChange: (type: WordListType) => void;
  onWordListChange: (wordListId: string) => void;
  isReadOnly?: boolean;
}

/** Elegir el tipo habilita la lista; las palabras solo aparecen con las dos elegidas. */
export const SpeechWordListSelectors: React.FC<SpeechWordListSelectorsProps> = ({
  wordListType,
  wordListId,
  onWordListTypeChange,
  onWordListChange,
  isReadOnly = false,
}) => {
  const { t } = useTranslation();
  const typeOptions = WORD_LIST_TYPES.map((type) => ({
    value: type,
    label: t(WORD_LIST_TYPE_SHORT_LABEL_KEYS[type]),
    shortLabel: t(WORD_LIST_TYPE_LABEL_KEYS[type]),
  }));
  const listOptions = (wordListType ? WORD_LIST_IDS_BY_TYPE[wordListType] : []).map((id) => ({
    value: id,
    label: t(WORD_LISTS_TEXT.OPTION, { id }),
  }));

  if (isReadOnly) {
    return (
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <ReadOnlyValue
          value={wordListType ? t(WORD_LIST_TYPE_LABEL_KEYS[wordListType]) : null}
          className="text-sm text-ink-900"
        />
        {wordListType && (
          <ReadOnlyValue
            value={wordListId ? t(WORD_LISTS_TEXT.OPTION, { id: wordListId }) : null}
            className="text-sm text-ink-900"
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-end gap-2">
      <PillSelect
        variant={PillSelectVariant.FIELD}
        ariaLabel={t(WORD_LISTS_TEXT.TYPE_ARIA)}
        placeholder={t(WORD_LISTS_TEXT.TYPE_PLACEHOLDER)}
        value={wordListType ?? ''}
        options={typeOptions}
        onChange={(value) => onWordListTypeChange(value as WordListType)}
        isSheetOnMobile
        className="w-full sm:w-60"
      />
      <PillSelect
        variant={PillSelectVariant.FIELD}
        ariaLabel={t(WORD_LISTS_TEXT.SELECT_ARIA)}
        placeholder={t(WORD_LISTS_TEXT.LIST_PLACEHOLDER)}
        value={wordListId ?? ''}
        options={listOptions}
        onChange={onWordListChange}
        isDisabled={!wordListType}
        isSheetOnMobile
        className="w-full sm:w-32"
      />
    </div>
  );
};
