import React from 'react';
import { Loader2 } from 'lucide-react';
import { tailwind } from '@/utils/tailwind-utils';

interface SwitchProps {
  isChecked: boolean;
  onChange: (isChecked: boolean) => void;
  label: string;
  /** Texto secundario debajo del label (p. ej. desde cuándo). */
  description?: string;
  isLoading?: boolean;
  className?: string;
}

/** Interruptor con su texto: toda la fila es el control, con alto táctil de 44px. */
export const Switch: React.FC<SwitchProps> = ({
  isChecked,
  onChange,
  label,
  description,
  isLoading = false,
  className,
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={isChecked}
    onClick={() => onChange(!isChecked)}
    disabled={isLoading}
    className={tailwind(
      'flex min-h-[44px] w-fit items-center gap-2.5 rounded-lg text-left text-sm text-ink-700 disabled:cursor-wait',
      className,
    )}
  >
    <span
      aria-hidden
      className={tailwind(
        'relative inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-colors',
        isChecked ? 'bg-brand' : 'bg-ink-200',
      )}
    >
      <span
        className={tailwind(
          'flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm transition-transform',
          isChecked ? 'translate-x-[18px]' : 'translate-x-0.5',
        )}
      >
        {isLoading && <Loader2 className="h-3 w-3 animate-spin text-ink-400" />}
      </span>
    </span>
    <span className="flex min-w-0 flex-col">
      <span className="font-medium text-ink-800">{label}</span>
      {description && <span className="text-xs text-ink-500">{description}</span>}
    </span>
  </button>
);
