import React from 'react';
import { tailwind } from '@/utils/tailwind-utils';

const FALLBACK_INITIALS = 'AC';
const INITIALS_MAX_PARTS = 2;

export enum UserAvatarSize {
  SMALL = 'SMALL',
  LARGE = 'LARGE',
}

const SIZE_STYLES: Record<UserAvatarSize, string> = {
  [UserAvatarSize.SMALL]: 'h-8 w-8 text-xs',
  [UserAvatarSize.LARGE]: 'h-14 w-14 text-lg sm:h-16 sm:w-16 sm:text-xl',
};

function getInitials(fullName?: string): string {
  if (!fullName) return FALLBACK_INITIALS;
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, INITIALS_MAX_PARTS)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

interface UserAvatarProps {
  fullName?: string;
  size?: UserAvatarSize;
  className?: string;
  /** Marca superpuesta (p. ej. el punto de notificaciones). */
  children?: React.ReactNode;
}

/** Círculo con las iniciales de la persona. */
export const UserAvatar: React.FC<UserAvatarProps> = ({
  fullName,
  size = UserAvatarSize.SMALL,
  className,
  children,
}) => (
  <span
    className={tailwind(
      'relative flex shrink-0 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700',
      SIZE_STYLES[size],
      className,
    )}
  >
    {getInitials(fullName)}
    {children}
  </span>
);
