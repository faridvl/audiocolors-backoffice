import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TEXT } from '@/static/texts/i18n';
import { tailwind } from '@/utils/tailwind-utils';
import { AudiometryTool, Ear, WeberResult } from './audiometry-constants';
import { WEBER_LABEL_KEYS } from './audiometry-labels';
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

/** "NR" en texto: sin flechas ni líneas, porque no hay lado hacia donde se oiga. */
const NoResponseIcon: React.FC = () => {
  const { t } = useTranslation();
  return (
    <span
      className="inline-flex h-5 min-w-5 items-center justify-center text-sm font-bold leading-none text-ink-700"
      aria-hidden
    >
      {t(TEXT.PATIENTS.DETAIL.AUDIOMETRY.WEBER.NO_RESPONSE_SHORT)}
    </span>
  );
};

export const WEBER_ICONS: Record<WeberResult, React.ReactNode> = {
  [WeberResult.CENTER]: <CenterIcon />,
  [WeberResult.RIGHT]: <ArrowRight className={tailwind(ICON_CLASSES, earStroke(Ear.RIGHT))} />,
  [WeberResult.LEFT]: <ArrowLeft className={tailwind(ICON_CLASSES, earStroke(Ear.LEFT))} />,
  [WeberResult.NO_RESPONSE]: <NoResponseIcon />,
};

/** Resultado de Weber ya guardado: ícono y nombre; "NR" lleva su nombre solo para lectores de pantalla. */
export const WeberResultView: React.FC<{
  result: WeberResult;
  labelClassName?: string;
}> = ({ result, labelClassName }) => {
  const { t } = useTranslation();
  return (
    <span className="inline-flex items-center gap-1.5">
      {WEBER_ICONS[result]}
      <span className={tailwind(labelClassName, result === WeberResult.NO_RESPONSE && 'sr-only')}>
        {t(WEBER_LABEL_KEYS[result])}
      </span>
    </span>
  );
};
