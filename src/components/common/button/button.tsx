import React from 'react';
import { Loader2 } from 'lucide-react';
import { tailwind } from '@/utils/tailwind-utils';

export enum ButtonVariant {
  PRIMARY = 'PRIMARY',
  SECONDARY = 'SECONDARY',
  DANGER = 'DANGER',
  GHOST = 'GHOST',
}

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  [ButtonVariant.PRIMARY]: 'bg-brand text-white hover:bg-brand-600 focus-visible:outline-brand',
  [ButtonVariant.SECONDARY]:
    'bg-white text-ink-700 border border-ink-200 hover:bg-ink-50 focus-visible:outline-ink-400',
  [ButtonVariant.DANGER]: 'bg-danger text-white hover:bg-red-600 focus-visible:outline-danger',
  [ButtonVariant.GHOST]: 'bg-transparent text-ink-600 hover:bg-ink-100 focus-visible:outline-ink-400',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = ButtonVariant.PRIMARY,
  isLoading = false,
  icon,
  children,
  className,
  disabled,
  type = 'button',
  ...rest
}) => (
  <button
    type={type}
    disabled={disabled || isLoading}
    className={tailwind(
      'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold',
      'transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-60',
      VARIANT_STYLES[variant],
      className,
    )}
    {...rest}
  >
    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : icon}
    {children}
  </button>
);
