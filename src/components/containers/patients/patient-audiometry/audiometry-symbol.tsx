import React from 'react';
import {
  AudiometryTool,
  Ear,
  NO_RESPONSE_ARROW_HEAD,
  NO_RESPONSE_ARROW_LENGTH,
  SYMBOL_CATALOG,
  SYMBOL_FONT_SIZE,
  SYMBOL_LETTERS,
  SYMBOL_RADIUS,
  SYMBOL_STROKE_WIDTH,
  SymbolShape,
} from './audiometry-constants';
import { getSymbolTone } from './audiometry-styles';

const RADIUS = SYMBOL_RADIUS;
const ANGLE_DEPTH = RADIUS * 0.6;
const BRACKET_DEPTH = RADIUS * 0.6;

interface SymbolShapeProps {
  shape: SymbolShape;
  strokeClass: string;
  fillClass: string;
}

const SymbolGlyph: React.FC<SymbolShapeProps> = ({ shape, strokeClass, fillClass }) => {
  const lineProps = {
    className: strokeClass,
    fill: 'none',
    strokeWidth: SYMBOL_STROKE_WIDTH,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (shape) {
    case SymbolShape.CIRCLE:
      return <circle r={RADIUS} {...lineProps} />;
    case SymbolShape.CROSS:
      return (
        <path
          d={`M ${-RADIUS} ${-RADIUS} L ${RADIUS} ${RADIUS} M ${RADIUS} ${-RADIUS} L ${-RADIUS} ${RADIUS}`}
          {...lineProps}
        />
      );
    case SymbolShape.TRIANGLE:
      return (
        <polygon
          points={`0,${-RADIUS} ${RADIUS},${RADIUS * 0.8} ${-RADIUS},${RADIUS * 0.8}`}
          {...lineProps}
        />
      );
    case SymbolShape.SQUARE:
      return <rect x={-RADIUS} y={-RADIUS} width={RADIUS * 2} height={RADIUS * 2} {...lineProps} />;
    case SymbolShape.ANGLE_LEFT:
      return (
        <polyline
          points={`${ANGLE_DEPTH},${-RADIUS} ${-ANGLE_DEPTH},0 ${ANGLE_DEPTH},${RADIUS}`}
          {...lineProps}
        />
      );
    case SymbolShape.ANGLE_RIGHT:
      return (
        <polyline
          points={`${-ANGLE_DEPTH},${-RADIUS} ${ANGLE_DEPTH},0 ${-ANGLE_DEPTH},${RADIUS}`}
          {...lineProps}
        />
      );
    case SymbolShape.BRACKET_LEFT:
      return (
        <polyline
          points={`${BRACKET_DEPTH},${-RADIUS} ${-BRACKET_DEPTH},${-RADIUS} ${-BRACKET_DEPTH},${RADIUS} ${BRACKET_DEPTH},${RADIUS}`}
          {...lineProps}
        />
      );
    case SymbolShape.BRACKET_RIGHT:
      return (
        <polyline
          points={`${-BRACKET_DEPTH},${-RADIUS} ${BRACKET_DEPTH},${-RADIUS} ${BRACKET_DEPTH},${RADIUS} ${-BRACKET_DEPTH},${RADIUS}`}
          {...lineProps}
        />
      );
    default:
      return (
        <text
          className={fillClass}
          fontSize={SYMBOL_FONT_SIZE}
          fontWeight={700}
          textAnchor="middle"
          dominantBaseline="central"
        >
          {SYMBOL_LETTERS[shape]}
        </text>
      );
  }
};

interface NoResponseArrowProps {
  direction: 1 | -1;
  strokeClass: string;
}

/** Flecha diagonal hacia abajo y hacia el lado del oído. */
const NoResponseArrow: React.FC<NoResponseArrowProps> = ({ direction, strokeClass }) => {
  const startX = direction * RADIUS * 0.7;
  const startY = RADIUS * 0.7;
  const endX = startX + direction * NO_RESPONSE_ARROW_LENGTH;
  const endY = startY + NO_RESPONSE_ARROW_LENGTH;
  return (
    <path
      d={`M ${startX} ${startY} L ${endX} ${endY} M ${endX - direction * NO_RESPONSE_ARROW_HEAD * 1.6} ${endY} L ${endX} ${endY} L ${endX} ${endY - NO_RESPONSE_ARROW_HEAD * 1.6}`}
      className={strokeClass}
      fill="none"
      strokeWidth={SYMBOL_STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
};

interface AudiometrySymbolProps {
  tool: AudiometryTool;
  ear: Ear;
  isMasked: boolean;
  hasNoResponse: boolean;
  x: number;
  y: number;
}

/** Dibuja un símbolo del catálogo centrado en (x, y), con su desplazamiento ya aplicado. */
export const AudiometrySymbol: React.FC<AudiometrySymbolProps> = ({
  tool,
  ear,
  isMasked,
  hasNoResponse,
  x,
  y,
}) => {
  const earSymbol = SYMBOL_CATALOG[tool].symbols[ear];
  const shape = isMasked ? earSymbol.masked : earSymbol.unmasked;
  const tone = getSymbolTone(tool, ear);
  const arrowDirection = ear === Ear.LEFT ? 1 : -1;

  return (
    <g transform={`translate(${x + earSymbol.offsetX} ${y})`}>
      <SymbolGlyph shape={shape} strokeClass={tone.stroke} fillClass={tone.fill} />
      {hasNoResponse && <NoResponseArrow direction={arrowDirection} strokeClass={tone.stroke} />}
    </g>
  );
};
