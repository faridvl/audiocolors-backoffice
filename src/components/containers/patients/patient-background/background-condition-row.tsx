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
  /** Null mientras la pregunta no se ha respondido: ninguna opción queda marcada. */
  answer: boolean | null;
  /** Null cuando se toca la opción ya elegida: la pregunta vuelve a quedar sin responder. */
  onChange: (answer: boolean | null) => void;
}

function toYesNo(answer: boolean | null): YesNo | null {
  if (answer === null) return null;
  return answer ? YesNo.YES : YesNo.NO;
}

export const BackgroundConditionRow: React.FC<BackgroundConditionRowProps> = ({
  label,
  answer,
  onChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between gap-3 border-b border-ink-100 py-1.5 last:border-b-0">
      <Typography variant={TypographyVariant.BODY}>{label}</Typography>
      <SegmentedControl
        ariaLabel={label}
        size={SegmentedControlSize.COMPACT}
        value={toYesNo(answer)}
        onChange={(value) => onChange(value === toYesNo(answer) ? null : value === YesNo.YES)}
        options={[
          // Un "Sí" tiene que verse de un vistazo entre quince filas.
          {
            value: YesNo.YES,
            label: t(TEXT.GENERAL.YES),
            selectedClassName: 'bg-brand text-white shadow-sm',
            unselectedClassName: 'font-normal text-ink-500 hover:text-ink-800',
          },
          {
            value: YesNo.NO,
            label: t(TEXT.GENERAL.NO),
            selectedClassName:
              'bg-white font-semibold text-ink-800 shadow-sm ring-1 ring-inset ring-ink-500',
            unselectedClassName: 'font-normal text-ink-500 hover:text-ink-800',
          },
        ]}
      />
    </div>
  );
};
