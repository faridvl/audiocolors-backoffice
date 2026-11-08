import React from 'react';
import { useTranslation } from 'react-i18next';
import { tailwind } from '@/utils/tailwind-utils';
import { Ear, GRADING_SCALE_CONFIG, GradingScale } from './audiometry-constants';
import { AUDIOGRAM_VIEW_HEIGHT, getDbY } from './audiometry-geometry';
import { EAR_LABEL_KEYS, GRADE_LABEL_KEYS, GRADE_SHORT_LABEL_KEYS } from './audiometry-labels';

const PERCENT = 100;

const getBandCenterTop = (fromDb: number, toDb: number): string =>
  `${(getDbY((fromDb + toDb) / 2) / AUDIOGRAM_VIEW_HEIGHT) * PERCENT}%`;

interface GradeLabelsColumnProps {
  gradingScale: GradingScale;
  className?: string;
}

/**
 * Nombres de los grados centrados en cada franja. Se posicionan en porcentaje del alto del
 * audiograma, así siguen alineados sin importar a qué tamaño se escale el SVG.
 */
export const GradeLabelsColumn: React.FC<GradeLabelsColumnProps> = ({
  gradingScale,
  className,
}) => {
  const { t } = useTranslation();

  return (
    <div className={tailwind('relative', className)}>
      {GRADING_SCALE_CONFIG[gradingScale].bands
        .filter((band) => band.showLabel)
        .map((band) => (
          <span
            key={band.grade}
            title={t(GRADE_LABEL_KEYS[band.grade])}
            style={{ top: getBandCenterTop(band.fromDb, band.toDb) }}
            className="absolute inset-x-0 -translate-y-1/2 text-center text-[10px] leading-tight text-ink-500 md:text-xs"
          >
            {t(GRADE_SHORT_LABEL_KEYS[band.grade] ?? GRADE_LABEL_KEYS[band.grade])}
          </span>
        ))}
    </div>
  );
};

/** Columna central entre los dos audiogramas, con un espaciador del alto del título de cada uno. */
interface GradeLabelsCenterProps {
  gradingScale: GradingScale;
}

export const GradeLabelsCenter: React.FC<GradeLabelsCenterProps> = ({ gradingScale }) => {
  const { t } = useTranslation();

  return (
    <div aria-hidden className="hidden w-24 flex-col gap-2 md:flex print:flex">
      <span className="invisible text-sm font-semibold">{t(EAR_LABEL_KEYS[Ear.LEFT])}</span>
      <GradeLabelsColumn gradingScale={gradingScale} className="flex-1" />
    </div>
  );
};
