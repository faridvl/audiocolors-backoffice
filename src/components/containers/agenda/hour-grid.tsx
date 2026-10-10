import React from 'react';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { formatHour } from '@/shared/utils/dates';
import { buildSlotHours } from './agenda-presenter';

interface HourGridProps {
  selectedHour?: number | null;
  onSelectHour: (hour: number) => void;
}

/** Los horarios del día como botones: tocar uno guarda. */
export const HourGrid: React.FC<HourGridProps> = ({ selectedHour, onSelectHour }) => (
  <div className="mt-2 grid grid-cols-3 gap-2">
    {buildSlotHours().map((hour) => (
      <Button
        key={hour}
        variant={hour === selectedHour ? ButtonVariant.PRIMARY : ButtonVariant.SECONDARY}
        onClick={() => onSelectHour(hour)}
        aria-pressed={hour === selectedHour}
        className="px-2"
      >
        {formatHour(hour)}
      </Button>
    ))}
  </div>
);
