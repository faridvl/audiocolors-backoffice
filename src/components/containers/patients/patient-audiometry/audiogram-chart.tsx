import React from 'react';
import { useTranslation } from 'react-i18next';
import { TEXT } from '@/static/texts/i18n';
import {
  AudiogramMarks,
  AudiometryTool,
  AUDIOMETRY_TOOLS,
  AUDIOGRAM_LAYOUT,
  CONNECTOR_DASH_ARRAYS,
  ConnectorStyle,
  DB_GRID_STEP,
  Ear,
  GRADING_SCALE_CONFIG,
  GradingScale,
  INTERMEDIATE_FREQUENCIES_HZ,
  MAIN_FREQUENCIES_HZ,
  MAX_DB_HL,
  MIN_DB_HL,
  POINT_HIT_RADIUS,
  SYMBOL_CATALOG,
  THICK_DB_LINE,
} from './audiometry-constants';
import {
  AUDIOGRAM_PLOT_BOTTOM,
  AUDIOGRAM_PLOT_RIGHT,
  AUDIOGRAM_VIEW_HEIGHT,
  AUDIOGRAM_VIEW_WIDTH,
  getDbY,
  getDistance,
  getFrequencyX,
  getViewBoxPoint,
  isInsideAudiogramPlot,
  snapAudiogramPoint,
} from './audiometry-geometry';
import { EAR_LABEL_KEYS } from './audiometry-labels';
import { BAND_FILL_STYLES, getSymbolTone } from './audiometry-styles';
import { AudiometrySymbol } from './audiometry-symbol';
import { GradeLabelsColumn } from './grade-labels-column';

const AXIS_FONT_SIZE = 10;
const MAIN_LABELS_Y = 13;
const INTERMEDIATE_LABELS_Y = 26;
const DB_LABEL_GAP = 6;
const CONNECTOR_WIDTH = 1.4;
const DOTTED_CONNECTOR_WIDTH = 1;

const DB_GRID_VALUES = Array.from(
  { length: (MAX_DB_HL - MIN_DB_HL) / DB_GRID_STEP + 1 },
  (_, index) => MIN_DB_HL + index * DB_GRID_STEP,
);

interface AudiogramChartProps {
  ear: Ear;
  marks: AudiogramMarks;
  activeTool: AudiometryTool;
  gradingScale: GradingScale;
  onPlace: (ear: Ear, frequencyHz: number, thresholdDb: number) => void;
  onRemove: (ear: Ear, tool: AudiometryTool, frequencyHz: number) => void;
  isReadOnly?: boolean;
  /** Etiquetas de grado junto al gráfico (móvil); el informe usa una sola columna central. */
  hasGradeLabels?: boolean;
}

export const AudiogramChart: React.FC<AudiogramChartProps> = ({
  ear,
  marks,
  activeTool,
  gradingScale,
  onPlace,
  onRemove,
  isReadOnly = false,
  hasGradeLabels = true,
}) => {
  const { t } = useTranslation();

  const getPointPosition = (tool: AudiometryTool, frequencyHz: number, thresholdDb: number) => ({
    x: getFrequencyX(frequencyHz) + SYMBOL_CATALOG[tool].symbols[ear].offsetX,
    y: getDbY(thresholdDb),
  });

  const handleClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (isReadOnly) return;
    const clickPoint = getViewBoxPoint(event, AUDIOGRAM_VIEW_WIDTH, AUDIOGRAM_VIEW_HEIGHT);
    if (!isInsideAudiogramPlot(clickPoint)) return;

    const toolPoints = marks[activeTool][ear];
    const hitFrequency = Object.keys(toolPoints)
      .map(Number)
      .find((frequencyHz) => {
        const point = toolPoints[frequencyHz];
        if (!point) return false;
        return (
          getDistance(clickPoint, getPointPosition(activeTool, frequencyHz, point.thresholdDb)) <=
          POINT_HIT_RADIUS
        );
      });

    if (hitFrequency !== undefined) {
      onRemove(ear, activeTool, hitFrequency);
      return;
    }
    const { frequencyHz, thresholdDb } = snapAudiogramPoint(clickPoint);
    onPlace(ear, frequencyHz, thresholdDb);
  };

  const earLabel = t(EAR_LABEL_KEYS[ear]);

  return (
    <figure className="flex min-w-0 flex-col gap-2">
      <figcaption className="text-sm font-semibold text-ink-800">{earLabel}</figcaption>
      <div className="flex items-stretch gap-1">
        <svg
          viewBox={`0 0 ${AUDIOGRAM_VIEW_WIDTH} ${AUDIOGRAM_VIEW_HEIGHT}`}
          role="img"
          aria-label={t(TEXT.PATIENTS.DETAIL.AUDIOMETRY.AUDIOGRAM_ARIA, {
            ear: earLabel,
          })}
          className={`h-auto min-w-0 flex-1 touch-manipulation select-none ${isReadOnly ? '' : 'cursor-crosshair'}`}
          onClick={handleClick}
        >
          {GRADING_SCALE_CONFIG[gradingScale].bands.map((band, index) => (
            <g key={band.grade}>
              <rect
                x={AUDIOGRAM_LAYOUT.marginLeft}
                y={getDbY(band.fromDb)}
                width={AUDIOGRAM_LAYOUT.plotWidth}
                height={getDbY(band.toDb) - getDbY(band.fromDb)}
                className={BAND_FILL_STYLES[index % BAND_FILL_STYLES.length]}
              />
            </g>
          ))}

          {DB_GRID_VALUES.map((db) => (
            <g key={db}>
              <line
                x1={AUDIOGRAM_LAYOUT.marginLeft}
                x2={AUDIOGRAM_PLOT_RIGHT}
                y1={getDbY(db)}
                y2={getDbY(db)}
                className={db === THICK_DB_LINE ? 'stroke-ink-500' : 'stroke-ink-200'}
                strokeWidth={db === THICK_DB_LINE ? 1.4 : 0.8}
              />
              <text
                x={AUDIOGRAM_LAYOUT.marginLeft - DB_LABEL_GAP}
                y={getDbY(db)}
                fontSize={AXIS_FONT_SIZE}
                textAnchor="end"
                dominantBaseline="central"
                className="fill-ink-500"
              >
                {db}
              </text>
            </g>
          ))}

          {MAIN_FREQUENCIES_HZ.map((frequencyHz) => (
            <g key={frequencyHz}>
              <line
                x1={getFrequencyX(frequencyHz)}
                x2={getFrequencyX(frequencyHz)}
                y1={AUDIOGRAM_LAYOUT.marginTop}
                y2={AUDIOGRAM_PLOT_BOTTOM}
                className="stroke-ink-300"
                strokeWidth={0.8}
              />
              <text
                x={getFrequencyX(frequencyHz)}
                y={MAIN_LABELS_Y}
                fontSize={AXIS_FONT_SIZE}
                textAnchor="middle"
                className="fill-ink-700"
              >
                {frequencyHz}
              </text>
            </g>
          ))}

          {INTERMEDIATE_FREQUENCIES_HZ.map((frequencyHz) => (
            <g key={frequencyHz}>
              <line
                x1={getFrequencyX(frequencyHz)}
                x2={getFrequencyX(frequencyHz)}
                y1={AUDIOGRAM_LAYOUT.marginTop}
                y2={AUDIOGRAM_PLOT_BOTTOM}
                className="stroke-ink-200"
                strokeWidth={0.6}
                strokeDasharray="2 3"
              />
              <text
                x={getFrequencyX(frequencyHz)}
                y={INTERMEDIATE_LABELS_Y}
                fontSize={AXIS_FONT_SIZE - 1}
                textAnchor="middle"
                className="fill-ink-400"
              >
                {frequencyHz}
              </text>
            </g>
          ))}

          {AUDIOMETRY_TOOLS.map((tool) => {
            const connector = SYMBOL_CATALOG[tool].connector;
            if (connector === ConnectorStyle.NONE) return null;
            const toolPoints = marks[tool][ear];
            const linePoints = Object.keys(toolPoints)
              .map(Number)
              .sort((first, second) => first - second)
              .filter((frequencyHz) => !toolPoints[frequencyHz]?.hasNoResponse)
              .map((frequencyHz) => {
                const point = toolPoints[frequencyHz];
                if (!point) return '';
                const position = getPointPosition(tool, frequencyHz, point.thresholdDb);
                return `${position.x},${position.y}`;
              })
              .filter(Boolean)
              .join(' ');
            if (!linePoints) return null;
            return (
              <polyline
                key={tool}
                points={linePoints}
                fill="none"
                className={getSymbolTone(tool, ear).stroke}
                strokeWidth={
                  connector === ConnectorStyle.DOTTED ? DOTTED_CONNECTOR_WIDTH : CONNECTOR_WIDTH
                }
                strokeDasharray={CONNECTOR_DASH_ARRAYS[connector]}
              />
            );
          })}

          {AUDIOMETRY_TOOLS.flatMap((tool) => {
            const toolPoints = marks[tool][ear];
            return Object.keys(toolPoints)
              .map(Number)
              .map((frequencyHz) => {
                const point = toolPoints[frequencyHz];
                if (!point) return null;
                return (
                  <AudiometrySymbol
                    key={`${tool}-${frequencyHz}`}
                    tool={tool}
                    ear={ear}
                    isMasked={point.isMasked}
                    hasNoResponse={point.hasNoResponse}
                    x={getFrequencyX(frequencyHz)}
                    y={getDbY(point.thresholdDb)}
                  />
                );
              });
          })}
        </svg>
        {hasGradeLabels && (
          <GradeLabelsColumn gradingScale={gradingScale} className="w-20 shrink-0 md:hidden" />
        )}
      </div>
    </figure>
  );
};
