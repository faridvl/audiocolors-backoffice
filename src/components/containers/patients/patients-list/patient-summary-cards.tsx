import React from 'react';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { tailwind } from '@/utils/tailwind-utils';
import { PatientListPreset, PatientListSelection } from './patient-list-selection';
import { usePatientSummary } from './use-patient-summary';

interface PatientSummaryCardsProps {
  selection: PatientListSelection;
  isPresetActive: (preset: PatientListPreset) => boolean;
  onTogglePreset: (preset: PatientListPreset) => void;
  /** Si se muestran: en escritorio siempre, debajo de `lg` solo en la pestaña "Resumen". */
  isVisible: boolean;
}

/** Tarjetas que filtran la lista con un clic (y lo quitan con otro). */
export const PatientSummaryCards: React.FC<PatientSummaryCardsProps> = ({
  selection,
  isPresetActive,
  onTogglePreset,
  isVisible,
}) => {
  const { cards } = usePatientSummary(selection, isVisible);

  return (
    <div
      className={tailwind(
        'grid-cols-2 gap-3 lg:grid lg:grid-cols-4',
        isVisible ? 'grid' : 'hidden',
      )}
    >
      {cards.map((card) => {
        const isActive = isPresetActive(card.preset);
        return (
          <button
            key={card.key}
            type="button"
            onClick={() => onTogglePreset(card.preset)}
            aria-pressed={isActive}
            className={tailwind(
              'rounded-card border bg-white px-4 py-3 text-left transition-colors',
              isActive
                ? 'border-brand ring-2 ring-brand/20'
                : 'border-ink-200 hover:border-ink-400',
            )}
          >
            <Typography variant={TypographyVariant.HELPER}>{card.label}</Typography>
            <Typography variant={TypographyVariant.HEADER} as="p">
              {card.count ?? '—'}
            </Typography>
          </button>
        );
      })}
    </div>
  );
};
