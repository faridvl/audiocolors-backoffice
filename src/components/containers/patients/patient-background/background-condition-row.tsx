import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  SegmentedControl,
  SegmentedControlSize,
} from '@/components/common/segmented-control/segmented-control';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';

enum YesNo {
  YES = 'YES',
  NO = 'NO',
}

interface BackgroundConditionRowProps {
  label: string;
  isChecked: boolean;
  onChange: (isChecked: boolean) => void;
}

export const BackgroundConditionRow: React.FC<BackgroundConditionRowProps> = ({
  label,
  isChecked,
  onChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between gap-3 border-b border-ink-100 py-1.5 last:border-b-0">
      <Typography variant={TypographyVariant.BODY}>{label}</Typography>
      <SegmentedControl
        ariaLabel={label}
        size={SegmentedControlSize.COMPACT}
        value={isChecked ? YesNo.YES : YesNo.NO}
        onChange={(value) => onChange(value === YesNo.YES)}
        options={[
          // Un "Sí" tiene que verse de un vistazo entre quince filas en "No".
          {
            value: YesNo.YES,
            label: t(TEXT.GENERAL.YES),
            selectedClassName: 'bg-brand text-white shadow-sm',
            unselectedClassName: 'font-normal text-ink-500 hover:text-ink-800',
          },
          // El No es lo esperado: elegido queda discreto para no competir con los Sí.
          {
            value: YesNo.NO,
            label: t(TEXT.GENERAL.NO),
            selectedClassName: 'bg-white text-ink-700 shadow-sm',
          },
        ]}
      />
    </div>
  );
};
