import React from 'react';
import { useTranslation } from 'react-i18next';
import { TEXT } from '@/static/texts/i18n';
import {
  AudiometryTool,
  EARS,
  Ear,
  POINT_HIT_RADIUS,
  SPEECH_DB_STEP,
  SPEECH_LAYOUT,
  SPEECH_AXIS_SYMBOL_DB,
  SPEECH_AXIS_SYMBOL_PERCENT,
  SPEECH_LOSS_BAND_BOTTOM_PERCENT,
  SPEECH_LOSS_BAND_TOP_PERCENT,
  SPEECH_MAX_DB,
  SPEECH_MAX_PERCENT,
  SPEECH_MIN_DB,
  SPEECH_MIN_PERCENT,
  SPEECH_PERCENT_GRID_STEP,
  SPEECH_PERCENT_SNAP_STEP,
  SpeechMarks,
} from './audiometry-constants';
import {
  SPEECH_PLOT_BOTTOM,
  SPEECH_PLOT_RIGHT,
  SPEECH_VIEW_HEIGHT,
  SPEECH_VIEW_WIDTH,
  buildNormalSpeechCurvePoints,
  getDistance,
  getSpeechLossZeroCell,
  getSpeechX,
  getSpeechY,
  getViewBoxPoint,
  isInsideSpeechPlot,
  snapSpeechPoint,
} from './audiometry-geometry';
import { buildSpeechCurve } from './audiometry-calculations';
import { getSymbolTone } from './audiometry-styles';
import { AudiometrySymbol } from './audiometry-symbol';

const AXIS_FONT_SIZE = 12;
const TICK_LABEL_GAP = 6;
const X_TICK_LABEL_OFFSET = 15;
const X_UNIT_GAP = 3;
// Mitad del ancho del último número del eje (100) para que la unidad quede a su derecha.
const X_LAST_LABEL_HALF_WIDTH = 10;
const CURVE_WIDTH = 1.6;
const LOSS_FONT_SIZE = 10;
const X_LABEL_FONT_SIZE = 11;
const FRAME_WIDTH = 1.6;
const GRID_WIDTH = 0.8;
// Medio alto del número 100 (centrado en el borde superior del marco) más aire hasta el "%".
const AXIS_LABEL_HALF_HEIGHT = AXIS_FONT_SIZE / 2;
const AXIS_SYMBOL_GAP = 6;
const AXIS_SYMBOL_Y = SPEECH_LAYOUT.marginTop - AXIS_LABEL_HALF_HEIGHT - AXIS_SYMBOL_GAP;
const LOSS_OUTSIDE_GAP = 3;

const DB_TICKS = Array.from(
  { length: (SPEECH_MAX_DB - SPEECH_MIN_DB) / SPEECH_DB_STEP + 1 },
  (_, index) => SPEECH_MIN_DB + index * SPEECH_DB_STEP,
);
const PERCENT_TICKS = Array.from(
  {
    length: (SPEECH_MAX_PERCENT - SPEECH_MIN_PERCENT) / SPEECH_PERCENT_GRID_STEP + 1,
  },
  (_, index) => SPEECH_MIN_PERCENT + index * SPEECH_PERCENT_GRID_STEP,
);

const NORMAL_CURVE_POINTS = buildNormalSpeechCurvePoints();

const LOSS_CELLS = DB_TICKS.slice(0, -1).map((startDb) => startDb + SPEECH_DB_STEP / 2);
const LOSS_ZERO_CELL = getSpeechLossZeroCell();
const LOSS_BAND_TOP = getSpeechY(SPEECH_LOSS_BAND_TOP_PERCENT);
const LOSS_BAND_BOTTOM = getSpeechY(SPEECH_LOSS_BAND_BOTTOM_PERCENT);

interface SpeechAudiogramChartProps {
  marks: SpeechMarks;
  activeEar: Ear;
  onPlace: (ear: Ear, intensityDb: number, percent: number) => void;
  onRemove: (ear: Ear, intensityDb: number) => void;
  isReadOnly?: boolean;
}

export const SpeechAudiogramChart: React.FC<SpeechAudiogramChartProps> = ({
  marks,
  activeEar,
  onPlace,
  onRemove,
  isReadOnly = false,
}) => {
  const { t } = useTranslation();
  const speechText = TEXT.PATIENTS.DETAIL.AUDIOMETRY.SPEECH;

  const handleClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (isReadOnly) return;
    const clickPoint = getViewBoxPoint(event, SPEECH_VIEW_WIDTH, SPEECH_VIEW_HEIGHT);
    if (!isInsideSpeechPlot(clickPoint)) return;

    const earPoints = marks[activeEar];
    const hitIntensity = Object.keys(earPoints)
      .map(Number)
      .find((intensityDb) => {
        const percent = earPoints[intensityDb];
        if (percent === undefined) return false;
        return (
          getDistance(clickPoint, {
            x: getSpeechX(intensityDb),
            y: getSpeechY(percent),
          }) <= POINT_HIT_RADIUS
        );
      });

    if (hitIntensity !== undefined) {
      onRemove(activeEar, hitIntensity);
      return;
    }
    const { intensityDb, percent } = snapSpeechPoint(
      clickPoint,
      SPEECH_DB_STEP,
      SPEECH_PERCENT_SNAP_STEP,
    );
    onPlace(activeEar, intensityDb, percent);
  };

  return (
    <svg
      viewBox={`0 0 ${SPEECH_VIEW_WIDTH} ${SPEECH_VIEW_HEIGHT}`}
      role="img"
      aria-label={t(speechText.ARIA)}
      className={`h-auto w-full touch-manipulation select-none ${isReadOnly ? '' : 'cursor-crosshair'}`}
      onClick={handleClick}
    >
      <rect
        x={SPEECH_LAYOUT.marginLeft}
        y={SPEECH_LAYOUT.marginTop}
        width={SPEECH_LAYOUT.plotWidth}
        height={SPEECH_LAYOUT.plotHeight}
        className="fill-white"
      />

      {PERCENT_TICKS.map((percent) => (
        <g key={percent}>
          <line
            x1={SPEECH_LAYOUT.marginLeft}
            x2={SPEECH_PLOT_RIGHT}
            y1={getSpeechY(percent)}
            y2={getSpeechY(percent)}
            className="stroke-ink-400"
            strokeWidth={GRID_WIDTH}
          />
          <text
            x={SPEECH_LAYOUT.marginLeft - TICK_LABEL_GAP}
            y={getSpeechY(percent)}
            fontSize={AXIS_FONT_SIZE}
            textAnchor="end"
            dominantBaseline="central"
            className="fill-ink-600"
          >
            {percent}
          </text>
        </g>
      ))}

      {DB_TICKS.map((intensityDb) => (
        <g key={intensityDb}>
          <line
            x1={getSpeechX(intensityDb)}
            x2={getSpeechX(intensityDb)}
            y1={SPEECH_LAYOUT.marginTop}
            y2={SPEECH_PLOT_BOTTOM}
            className="stroke-ink-400"
            strokeWidth={GRID_WIDTH}
          />
          {intensityDb > SPEECH_MIN_DB && (
            <text
              x={getSpeechX(intensityDb)}
              y={SPEECH_PLOT_BOTTOM + X_TICK_LABEL_OFFSET}
              fontSize={X_LABEL_FONT_SIZE}
              textAnchor="middle"
              className="fill-ink-600"
            >
              {intensityDb}
            </text>
          )}
        </g>
      ))}

      <text
        x={SPEECH_LAYOUT.marginLeft - TICK_LABEL_GAP}
        y={AXIS_SYMBOL_Y}
        fontSize={AXIS_FONT_SIZE}
        textAnchor="end"
        className="fill-ink-700"
      >
        {SPEECH_AXIS_SYMBOL_PERCENT}
      </text>
      <text
        x={SPEECH_PLOT_RIGHT + X_LAST_LABEL_HALF_WIDTH + X_UNIT_GAP}
        y={SPEECH_PLOT_BOTTOM + X_TICK_LABEL_OFFSET}
        fontSize={X_LABEL_FONT_SIZE}
        className="fill-ink-700"
      >
        {SPEECH_AXIS_SYMBOL_DB}
      </text>

      <g pointerEvents="none" aria-hidden="true">
        <rect
          x={SPEECH_LAYOUT.marginLeft}
          y={LOSS_BAND_TOP}
          width={SPEECH_LAYOUT.plotWidth}
          height={LOSS_BAND_BOTTOM - LOSS_BAND_TOP}
          className="fill-white stroke-ink-400"
          strokeWidth={GRID_WIDTH}
        />
        {LOSS_CELLS.map((centerDb, index) => (
          <g key={centerDb}>
            {index > 0 && (
              <line
                x1={getSpeechX(centerDb - SPEECH_DB_STEP / 2)}
                x2={getSpeechX(centerDb - SPEECH_DB_STEP / 2)}
                y1={LOSS_BAND_TOP}
                y2={LOSS_BAND_BOTTOM}
                className="stroke-ink-400"
                strokeWidth={GRID_WIDTH}
              />
            )}
            <text
              x={getSpeechX(centerDb)}
              y={(LOSS_BAND_TOP + LOSS_BAND_BOTTOM) / 2}
              fontSize={LOSS_FONT_SIZE}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-ink-700"
            >
              {Math.abs(index - LOSS_ZERO_CELL) * SPEECH_DB_STEP}
            </text>
          </g>
        ))}
        <text
          x={SPEECH_PLOT_RIGHT + LOSS_OUTSIDE_GAP}
          y={(LOSS_BAND_TOP + LOSS_BAND_BOTTOM) / 2}
          fontSize={LOSS_FONT_SIZE}
          dominantBaseline="central"
          className="fill-ink-700"
        >
          {(LOSS_CELLS.length - LOSS_ZERO_CELL) * SPEECH_DB_STEP}
        </text>
      </g>

      <rect
        x={SPEECH_LAYOUT.marginLeft}
        y={SPEECH_LAYOUT.marginTop}
        width={SPEECH_LAYOUT.plotWidth}
        height={SPEECH_LAYOUT.plotHeight}
        fill="none"
        className="stroke-ink-700"
        strokeWidth={FRAME_WIDTH}
      />

      <polyline
        points={NORMAL_CURVE_POINTS}
        fill="none"
        className="stroke-ink-700"
        strokeWidth={CURVE_WIDTH}
      />

      {EARS.map((ear) => {
        const earPoints = marks[ear];
        const intensities = Object.keys(earPoints)
          .map(Number)
          .sort((first, second) => first - second);
        const linePoints = buildSpeechCurve(earPoints)
          .map((point) => `${getSpeechX(point.intensityDb)},${getSpeechY(point.percent)}`)
          .join(' ');
        return (
          <g key={ear}>
            {linePoints && (
              <polyline
                points={linePoints}
                fill="none"
                className={getSymbolTone(AudiometryTool.AIR, ear).stroke}
                strokeWidth={CURVE_WIDTH}
              />
            )}
            {intensities.map((intensityDb) => (
              <AudiometrySymbol
                key={intensityDb}
                tool={AudiometryTool.AIR}
                ear={ear}
                isMasked={false}
                hasNoResponse={false}
                x={getSpeechX(intensityDb)}
                y={getSpeechY(earPoints[intensityDb] ?? 0)}
              />
            ))}
          </g>
        );
      })}
    </svg>
  );
};
