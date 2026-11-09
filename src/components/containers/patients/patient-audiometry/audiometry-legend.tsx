import React, { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TEXT } from '@/static/texts/i18n';
import { AudiometryTool, Ear } from './audiometry-constants';
import { EAR_SHORT_LABEL_KEYS } from './audiometry-labels';
import { tailwind } from '@/utils/tailwind-utils';
import { AudiometrySymbol } from './audiometry-symbol';

const LEGEND_ICON_WIDTH = 34;
const LEGEND_ICON_HEIGHT = 22;
const LEGEND_ARROW_PADDING = 6;

const LEGEND_TEXT = TEXT.PATIENTS.DETAIL.AUDIOMETRY.LEGEND;

interface LegendRow {
  key: string;
  labelKey: string;
  tool: AudiometryTool;
  isMasked: boolean;
  hasNoResponse: boolean;
  /** El campo libre no tiene oído: se muestra una sola vez. */
  ears: Ear[];
}

const LEGEND_ROWS: LegendRow[] = [
  {
    key: 'air',
    labelKey: LEGEND_TEXT.AIR,
    tool: AudiometryTool.AIR,
    isMasked: false,
    hasNoResponse: false,
    ears: [Ear.RIGHT, Ear.LEFT],
  },
  {
    key: 'air-masked',
    labelKey: LEGEND_TEXT.AIR_MASKED,
    tool: AudiometryTool.AIR,
    isMasked: true,
    hasNoResponse: false,
    ears: [Ear.RIGHT, Ear.LEFT],
  },
  {
    key: 'bone',
    labelKey: LEGEND_TEXT.BONE,
    tool: AudiometryTool.BONE,
    isMasked: false,
    hasNoResponse: false,
    ears: [Ear.RIGHT, Ear.LEFT],
  },
  {
    key: 'bone-masked',
    labelKey: LEGEND_TEXT.BONE_MASKED,
    tool: AudiometryTool.BONE,
    isMasked: true,
    hasNoResponse: false,
    ears: [Ear.RIGHT, Ear.LEFT],
  },
  {
    key: 'ucl',
    labelKey: LEGEND_TEXT.UCL,
    tool: AudiometryTool.UCL,
    isMasked: false,
    hasNoResponse: false,
    ears: [Ear.RIGHT, Ear.LEFT],
  },
  {
    key: 'mcl',
    labelKey: LEGEND_TEXT.MCL,
    tool: AudiometryTool.MCL,
    isMasked: false,
    hasNoResponse: false,
    ears: [Ear.RIGHT, Ear.LEFT],
  },
  {
    key: 'free-field',
    labelKey: LEGEND_TEXT.FREE_FIELD,
    tool: AudiometryTool.FREE_FIELD,
    isMasked: false,
    hasNoResponse: false,
    ears: [Ear.RIGHT],
  },
  {
    key: 'no-response',
    labelKey: LEGEND_TEXT.NO_RESPONSE,
    tool: AudiometryTool.AIR,
    isMasked: false,
    hasNoResponse: true,
    ears: [Ear.RIGHT, Ear.LEFT],
  },
];

interface LegendSymbolProps {
  row: LegendRow;
  ear: Ear;
}

const LegendSymbol: React.FC<LegendSymbolProps> = ({ row, ear }) => {
  const { t } = useTranslation();
  const isFreeField = row.tool === AudiometryTool.FREE_FIELD;
  return (
    <span className="flex items-center gap-1">
      <svg
        viewBox={`0 0 ${LEGEND_ICON_WIDTH} ${LEGEND_ICON_HEIGHT}`}
        width={LEGEND_ICON_WIDTH}
        height={LEGEND_ICON_HEIGHT}
        aria-hidden
      >
        <AudiometrySymbol
          tool={row.tool}
          ear={ear}
          isMasked={row.isMasked}
          hasNoResponse={row.hasNoResponse}
          x={
            LEGEND_ICON_WIDTH / 2 +
            (row.hasNoResponse
              ? ear === Ear.LEFT
                ? -LEGEND_ARROW_PADDING
                : LEGEND_ARROW_PADDING
              : 0)
          }
          y={LEGEND_ICON_HEIGHT / 2 - (row.hasNoResponse ? LEGEND_ARROW_PADDING / 2 : 0)}
        />
      </svg>
      {!isFreeField && <span className="text-xs text-ink-500">{t(EAR_SHORT_LABEL_KEYS[ear])}</span>}
    </span>
  );
};

interface AudiometryLegendListProps {
  id?: string;
  isHidden?: boolean;
  className?: string;
}

/** Filas de símbolos de la leyenda plegable de pantalla. */
export const AudiometryLegendList: React.FC<AudiometryLegendListProps> = ({
  id,
  isHidden = false,
  className,
}) => {
  const { t } = useTranslation();

  return (
    <ul id={id} hidden={isHidden} className={tailwind('[&[hidden]]:hidden', className)}>
      {LEGEND_ROWS.map((row) => (
        <li key={row.key} className="flex items-center gap-3 text-sm text-ink-700">
          <span className="flex shrink-0 items-center gap-2">
            {row.ears.map((ear) => (
              <LegendSymbol key={ear} row={row} ear={ear} />
            ))}
          </span>
          {t(row.labelKey)}
        </li>
      ))}
    </ul>
  );
};

export const AudiometryLegend: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const listId = useId();

  return (
    <section className="flex flex-col gap-2 rounded-lg bg-ink-50 p-3">
      <h4 className="text-sm font-semibold text-ink-800">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={listId}
          onClick={() => setIsOpen((current) => !current)}
          className="flex min-h-[44px] w-full items-center justify-between gap-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
        >
          {t(LEGEND_TEXT.TITLE)}
          <ChevronDown
            aria-hidden
            className={tailwind('h-4 w-4 transition-transform', isOpen && 'rotate-180')}
          />
        </button>
      </h4>
      <AudiometryLegendList
        id={listId}
        isHidden={!isOpen}
        className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2"
      />
    </section>
  );
};
