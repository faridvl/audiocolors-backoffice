import React from 'react';
import { Check, Loader2 } from 'lucide-react';
import { tailwind } from '@/utils/tailwind-utils';

interface CheckboxProps {
  isChecked: boolean;
  onChange: (isChecked: boolean) => void;
  label: string;
  isLoading?: boolean;
  className?: string;
}

/** Casilla con su texto, compacta para ir en línea con otros datos. */
export const Checkbox: React.FC<CheckboxProps> = ({
  isChecked,
  onChange,
  label,
  isLoading = false,
  className,
}) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={isChecked}
    onClick={() => onChange(!isChecked)}
    disabled={isLoading}
    className={tailwind(
      'inline-flex w-fit items-center gap-1.5 rounded-md text-left text-sm text-ink-700 hover:text-ink-900 disabled:cursor-wait',
      className,
    )}
  >
    <span
      aria-hidden
      className={tailwind(
        'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
        isChecked ? 'border-brand bg-brand text-white' : 'border-ink-300 bg-white',
      )}
    >
      {isLoading ? (
        <Loader2 className="h-3 w-3 animate-spin text-ink-400" />
      ) : (
        isChecked && <Check className="h-3 w-3" strokeWidth={3} />
      )}
    </span>
    {label}
  </button>
);
