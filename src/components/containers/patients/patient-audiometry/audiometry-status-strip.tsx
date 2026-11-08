import React from 'react';
import { CheckCircle2, Info } from 'lucide-react';
import { tailwind } from '@/utils/tailwind-utils';

export enum StatusStripTone {
  SUCCESS = 'SUCCESS',
  INFO = 'INFO',
}

const TONE_STYLES: Record<StatusStripTone, string> = {
  [StatusStripTone.SUCCESS]: 'border-success/30 bg-success/10',
  [StatusStripTone.INFO]: 'border-info/30 bg-info/10',
};

const TONE_ICON_STYLES: Record<StatusStripTone, string> = {
  [StatusStripTone.SUCCESS]: 'text-success',
  [StatusStripTone.INFO]: 'text-info',
};

interface AudiometryStatusStripProps {
  tone: StatusStripTone;
  message: string;
}

/** Franja de una línea sobre el cuerpo del acordeón: confirma un guardado o avisa del solo lectura. */
export const AudiometryStatusStrip: React.FC<AudiometryStatusStripProps> = ({ tone, message }) => {
  const Icon = tone === StatusStripTone.SUCCESS ? CheckCircle2 : Info;

  return (
    <div
      role="status"
      className={tailwind(
        'flex items-start gap-2 rounded-lg border px-3 py-2 text-sm text-ink-800',
        TONE_STYLES[tone],
      )}
    >
      <Icon className={tailwind('mt-0.5 h-4 w-4 shrink-0', TONE_ICON_STYLES[tone])} aria-hidden />
      <p className="min-w-0">{message}</p>
    </div>
  );
};
