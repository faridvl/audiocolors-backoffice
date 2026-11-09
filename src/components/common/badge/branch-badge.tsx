import React from 'react';
import { getBranchStripeColor, getBranchTextColor } from '@/shared/design/tokens';
import { Badge, BadgeSize } from './badge';

interface BranchBadgeProps {
  name?: string;
  size?: BadgeSize;
  className?: string;
}

/** La sede con su color de marca, igual en pacientes, bitácora y agenda. */
export const BranchBadge: React.FC<BranchBadgeProps> = ({ name, size, className }) => {
  if (!name) return null;

  return (
    <Badge
      accentColor={getBranchStripeColor(name)}
      textColor={getBranchTextColor(name)}
      size={size}
      className={className}
    >
      {name}
    </Badge>
  );
};
