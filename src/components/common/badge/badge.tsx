import React from 'react';
import { ColorAlpha, withAlpha } from '@/shared/design/tokens';
import { tailwind } from '@/utils/tailwind-utils';

export enum BadgeSize {
  SMALL = 'SMALL',
  REGULAR = 'REGULAR',
}

const SIZE_STYLES: Record<BadgeSize, string> = {
  [BadgeSize.SMALL]: 'px-2 py-0.5 text-xs',
  [BadgeSize.REGULAR]: 'px-2.5 py-0.5 text-sm',
};

interface BadgeProps {
  children: React.ReactNode;
  /** Color pleno del texto; el fondo es el mismo color, suave. Sin él, gris neutro. */
  accentColor?: string;
  size?: BadgeSize;
  className?: string;
}

/** Píldora de texto corto (una sede, un estado), con color propio opcional. */
export const Badge: React.FC<BadgeProps> = ({
  children,
  accentColor,
  size = BadgeSize.SMALL,
  className,
}) => (
  <span
    style={
      accentColor
        ? { backgroundColor: withAlpha(accentColor, ColorAlpha.SOFT), color: accentColor }
        : undefined
    }
    className={tailwind(
      'inline-block w-fit shrink-0 whitespace-nowrap rounded-full',
      SIZE_STYLES[size],
      !accentColor && 'bg-ink-100 text-ink-600',
      className,
    )}
  >
    {children}
  </span>
);
