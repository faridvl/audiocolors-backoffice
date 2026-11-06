import React from 'react';
import { tailwind } from '@/utils/tailwind-utils';
import {
  MAINTENANCE_CHIP_SELECTED_STYLES,
  MAINTENANCE_CHIP_UNSELECTED_STYLES,
  MaintenanceChipStatus,
} from './patient-maintenance-styles';

interface MaintenanceStatusChipProps {
  status: MaintenanceChipStatus;
  label: string;
  isSelected: boolean;
  isDisabled: boolean;
  onToggle: () => void;
}

/** Chip de estado (toggle): el botón mide 44 px de alto para el dedo y el chip se ve más bajo. */
export const MaintenanceStatusChip: React.FC<MaintenanceStatusChipProps> = ({
  status,
  label,
  isSelected,
  isDisabled,
  onToggle,
}) => (
  <button
    type="button"
    aria-pressed={isSelected}
    disabled={isDisabled}
    onClick={onToggle}
    className="group inline-flex min-h-[44px] items-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60"
  >
    <span
      className={tailwind(
        'rounded-full border px-2.5 py-1 text-sm font-semibold transition-colors sm:px-3',
        isSelected ? MAINTENANCE_CHIP_SELECTED_STYLES[status] : MAINTENANCE_CHIP_UNSELECTED_STYLES,
      )}
    >
      {label}
    </span>
  </button>
);
