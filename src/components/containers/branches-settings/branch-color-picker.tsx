import React from 'react';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { getBranchStripeColor } from '@/shared/design/tokens';
import { TEXT } from '@/static/texts/i18n';
import { BRANCH_COLORS, BranchColor } from '@/types/branches/branch';
import { tailwind } from '@/utils/tailwind-utils';

interface BranchColorPickerProps {
  label: string;
  /** Ayuda bajo el selector. */
  hint?: string;
  value: BranchColor;
  onChange: (color: BranchColor) => void;
}

/** Los colores de la marca como un grupo de opciones: se elige con el mouse o con las flechas. */
export const BranchColorPicker: React.FC<BranchColorPickerProps> = ({
  label,
  value,
  hint,
  onChange,
}) => {
  const { t } = useTranslation();
  const selectedName = t(`${TEXT.SETTINGS.BRANCHES.COLOR_PREFIX}.${value}`);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2 sm:gap-3">
          {BRANCH_COLORS.map((color) => {
            const isSelected = color === value;
            return (
              <label
                key={color}
                className={tailwind(
                  'relative flex h-11 w-11 cursor-pointer sm:h-9 sm:w-9 items-center justify-center rounded-full',
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
        <Typography variant={TypographyVariant.BODY} inline className="text-ink-700">
          {t(TEXT.SETTINGS.BRANCHES.SELECTED_COLOR, { name: selectedName })}
        </Typography>
      </div>
      {hint && <Typography variant={TypographyVariant.HELPER}>{hint}</Typography>}
    </div>
  );
};
