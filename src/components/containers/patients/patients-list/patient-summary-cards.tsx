import React from 'react';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { tailwind } from '@/utils/tailwind-utils';
import { PatientListPreset } from './use-patient-list';
import { usePatientSummary } from './use-patient-summary';

interface PatientSummaryCardsProps {
  isPresetActive: (preset: PatientListPreset) => boolean;
  onSelectPreset: (preset: PatientListPreset) => void;
}

/** Tarjetas que filtran la lista con un clic (y lo quitan con otro). Solo escritorio (`lg`). */
export const PatientSummaryCards: React.FC<PatientSummaryCardsProps> = ({
  isPresetActive,
  onSelectPreset,
}) => {
  const { cards } = usePatientSummary();

  return (
    <div className="hidden gap-3 lg:grid lg:grid-cols-4">
      {cards.map((card) => {
        const isActive = isPresetActive(card.preset);
        return (
          <button
            key={card.key}
            type="button"
            // Volver a tocar la tarjeta activa la quita: la lista vuelve a sin filtros.
            onClick={() => onSelectPreset(isActive ? {} : card.preset)}
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
