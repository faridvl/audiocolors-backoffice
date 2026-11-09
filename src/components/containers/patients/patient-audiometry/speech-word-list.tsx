import React from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { TATO_DISPLAYED_WORDS } from './audiometry-constants';
import { WORD_LIST_TYPE_LABEL_KEYS } from './speech-word-list-selectors';
import { WORDS_BY_LIST_TYPE, WordListType } from './speech-word-lists';

const WORD_LISTS_TEXT = TEXT.PATIENTS.DETAIL.AUDIOMETRY.WORD_LISTS;

/** Los monosílabos se muestran en dos grupos: la fuente los trae en dos columnas. */
const COLUMN_SIZE_BY_TYPE: Record<WordListType, number | null> = {
  [WordListType.BISYLLABLE]: null,
  [WordListType.MONOSYLLABLE]: 25,
};

const WORDS_GRID_CLASSES =
  'grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-5';

interface SpeechWordListProps {
  wordListType: WordListType;
  wordListId: string;
  onHide: () => void;
}

interface WordGridProps {
  words: readonly string[];
  firstNumber: number;
}

const WordGrid: React.FC<WordGridProps> = ({ words, firstNumber }) => (
  <ol className={WORDS_GRID_CLASSES}>
    {words.map((word, index) => (
      <li key={`${index}-${word}`} className="flex min-w-0 gap-1.5 text-sm text-ink-800">
        <span className="w-6 shrink-0 text-right text-ink-400">{firstNumber + index}.</span>
        <span className="truncate">{word}</span>
      </li>
    ))}
  </ol>
);

/** Lista de referencia para leerle al paciente: no calcula ni marca nada. */
export const SpeechWordList: React.FC<SpeechWordListProps> = ({
  wordListType,
  wordListId,
  onHide,
}) => {
  const { t } = useTranslation();
  const allWords = WORDS_BY_LIST_TYPE[wordListType][wordListId] ?? [];
  const words =
    wordListType === WordListType.BISYLLABLE ? allWords.slice(0, TATO_DISPLAYED_WORDS) : allWords;
  const columnSize = COLUMN_SIZE_BY_TYPE[wordListType];

  return (
    <section className="flex min-w-0 flex-col gap-3 rounded-card border border-ink-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <Typography variant={TypographyVariant.SUBTITLE}>
          {t(WORD_LISTS_TEXT.PANEL_TITLE, {
            type: t(WORD_LIST_TYPE_LABEL_KEYS[wordListType]),
            id: wordListId,
          })}
        </Typography>
        <button
          type="button"
          aria-label={t(WORD_LISTS_TEXT.HIDE_ARIA)}
          onClick={onHide}
          className="-m-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-800 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>
      </div>
      <Typography variant={TypographyVariant.HELPER}>{t(WORD_LISTS_TEXT.NOTE)}</Typography>
      {columnSize === null ? (
        <WordGrid words={words} firstNumber={1} />
      ) : (
        [0, 1].map((columnIndex) => (
          <div key={columnIndex} className="flex flex-col gap-2">
            <Typography variant={TypographyVariant.BODY}>
              {t(WORD_LISTS_TEXT.COLUMN, { number: columnIndex + 1 })}
            </Typography>
            <WordGrid
              words={words.slice(columnIndex * columnSize, (columnIndex + 1) * columnSize)}
              firstNumber={columnIndex * columnSize + 1}
            />
          </div>
        ))
      )}
    </section>
  );
};
