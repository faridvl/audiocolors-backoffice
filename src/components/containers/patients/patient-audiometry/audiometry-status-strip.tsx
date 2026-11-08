import React from 'react';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { tailwind } from '@/utils/tailwind-utils';

export enum StatusStripTone {
  SUCCESS = 'SUCCESS',
  INFO = 'INFO',
  WARNING = 'WARNING',
}

const TONE_STYLES: Record<StatusStripTone, string> = {
  [StatusStripTone.SUCCESS]: 'border-success/30 bg-success/10',
  [StatusStripTone.INFO]: 'border-info/30 bg-info/10',
  [StatusStripTone.WARNING]: 'border-warning/40 bg-warning/10',
};

const TONE_ICON_STYLES: Record<StatusStripTone, string> = {
  [StatusStripTone.SUCCESS]: 'text-success',
  [StatusStripTone.INFO]: 'text-info',
  [StatusStripTone.WARNING]: 'text-warning',
};

const TONE_ICONS = {
  [StatusStripTone.SUCCESS]: CheckCircle2,
  [StatusStripTone.INFO]: Info,
  [StatusStripTone.WARNING]: AlertTriangle,
};

interface AudiometryStatusStripProps {
  tone: StatusStripTone;
  message: string;
  detail?: string;
}

/** Franja de una línea sobre el cuerpo del acordeón: confirma un guardado o avisa del solo lectura. */
export const AudiometryStatusStrip: React.FC<AudiometryStatusStripProps> = ({
  tone,
  message,
  detail,
}) => {
  const Icon = TONE_ICONS[tone];

  return (
    <div
      role="status"
      className={tailwind(
        'flex items-start gap-2 rounded-lg border px-3 py-2 text-sm text-ink-800',
        TONE_STYLES[tone],
      )}
    >
      <Icon className={tailwind('mt-0.5 h-4 w-4 shrink-0', TONE_ICON_STYLES[tone])} aria-hidden />
      <div className="min-w-0">
        <p>{message}</p>
        {detail && <p className="mt-0.5 break-words">{detail}</p>}
      </div>
    </div>
  );
};
