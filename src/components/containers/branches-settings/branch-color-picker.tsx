import React from 'react';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getBranchStripeColor } from '@/shared/design/tokens';
import { TEXT } from '@/static/texts/i18n';
import { BRANCH_COLORS, BranchColor } from '@/types/branches/branch';
import { tailwind } from '@/utils/tailwind-utils';

interface BranchColorPickerProps {
  label: string;
  value: BranchColor;
  onChange: (color: BranchColor) => void;
}

/** Los colores de la marca como un grupo de opciones: se elige con el mouse o con las flechas. */
export const BranchColorPicker: React.FC<BranchColorPickerProps> = ({ label, value, onChange }) => {
  const { t } = useTranslation();

  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-3">
      {BRANCH_COLORS.map((color) => {
        const isSelected = color === value;
        return (
          <label
            key={color}
            className={tailwind(
              'relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full',
              'outline-offset-2 focus-within:outline focus-within:outline-2 focus-within:outline-brand',
              isSelected && 'ring-2 ring-ink-900 ring-offset-2',
            )}
            style={{ backgroundColor: getBranchStripeColor(color) }}
          >
            <input
              type="radio"
              name="branch-color"
              value={color}
              checked={isSelected}
              onChange={() => onChange(color)}
              aria-label={t(`${TEXT.SETTINGS.BRANCHES.COLOR_PREFIX}.${color}`)}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
            {isSelected && <Check className="h-4 w-4 text-white" aria-hidden />}
          </label>
        );
      })}
    </div>
  );
};
