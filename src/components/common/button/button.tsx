import React from 'react';
import { Loader2 } from 'lucide-react';
import { tailwind } from '@/utils/tailwind-utils';

export enum ButtonVariant {
  PRIMARY = 'PRIMARY',
  SECONDARY = 'SECONDARY',
  DANGER = 'DANGER',
  GHOST = 'GHOST',
  /** Fila o tarjeta clicable de ancho completo, con contenido alineado a la izquierda. */
  CARD = 'CARD',
  /** Pestaña con subrayado; la activa la marca `Tabs`. */
  TAB = 'TAB',
}

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  [ButtonVariant.PRIMARY]: 'bg-brand text-white hover:bg-brand-600 focus-visible:outline-brand',
  [ButtonVariant.SECONDARY]:
    'bg-white text-ink-700 border border-ink-200 hover:bg-ink-50 focus-visible:outline-ink-400',
  [ButtonVariant.DANGER]: 'bg-danger text-white hover:bg-red-600 focus-visible:outline-danger',
  [ButtonVariant.GHOST]:
    'bg-transparent text-ink-600 hover:bg-ink-100 focus-visible:outline-ink-400',
  [ButtonVariant.CARD]:
    'w-full min-w-0 justify-start gap-3 border border-ink-200 bg-white px-3 text-left font-normal hover:bg-ink-50 focus-visible:outline-brand',
  [ButtonVariant.TAB]:
    '-mb-px min-h-[48px] rounded-none border-b-2 border-transparent px-3 text-ink-500 hover:text-ink-800 focus-visible:outline-brand',
};

/** Clases de un botón: las comparten `Button` y `ButtonLink` (un enlace con forma de botón). */
export function buttonClasses(variant: ButtonVariant, className?: string): string {
  return tailwind(
    'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold',
    'transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-60',
    VARIANT_STYLES[variant],
    className,
  );
}

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
    className={buttonClasses(variant, className)}
    {...rest}
  >
    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : icon}
    {children}
  </button>
);
