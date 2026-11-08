import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { tailwind } from '@/utils/tailwind-utils';
import { AudiometryTool, Ear, WeberResult } from './audiometry-constants';
import { getSymbolTone } from './audiometry-styles';

const ICON_CLASSES = 'h-5 w-5';
const CENTER_ICON_VIEWBOX = '0 0 24 24';
// Mismo ancho (5 a 19) que el trazo de las flechas de lucide, para que los tres íconos se vean parejos.
const CENTER_LINE_START_X = 5;
const CENTER_LINE_END_X = 19;
const CENTER_LINE_TOP_Y = 9;
const CENTER_LINE_BOTTOM_Y = 15;
const CENTER_LINE_WIDTH = 2;

const earStroke = (ear: Ear) => getSymbolTone(AudiometryTool.AIR, ear).stroke;

/** Dos trazos horizontales paralelos: rojo (oído derecho) arriba y azul (oído izquierdo) abajo. */
const CenterIcon: React.FC = () => (
  <svg viewBox={CENTER_ICON_VIEWBOX} fill="none" className={ICON_CLASSES} aria-hidden>
    {[
      { y: CENTER_LINE_TOP_Y, ear: Ear.RIGHT },
      { y: CENTER_LINE_BOTTOM_Y, ear: Ear.LEFT },
    ].map(({ y, ear }) => (
      <line
        key={ear}
        x1={CENTER_LINE_START_X}
        x2={CENTER_LINE_END_X}
        y1={y}
        y2={y}
        strokeWidth={CENTER_LINE_WIDTH}
        strokeLinecap="round"
        className={earStroke(ear)}
      />
    ))}
  </svg>
);

export const WEBER_ICONS: Record<WeberResult, React.ReactNode> = {
  [WeberResult.CENTER]: <CenterIcon />,
  [WeberResult.RIGHT]: <ArrowRight className={tailwind(ICON_CLASSES, earStroke(Ear.RIGHT))} />,
  [WeberResult.LEFT]: <ArrowLeft className={tailwind(ICON_CLASSES, earStroke(Ear.LEFT))} />,
};
