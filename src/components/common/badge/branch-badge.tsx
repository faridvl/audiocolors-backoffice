import React from 'react';
import { getBranchStripeColor, getBranchTextColor } from '@/shared/design/tokens';
import { Branch } from '@/types/branches/branch';
import { Badge, BadgeSize } from './badge';

interface BranchBadgeProps {
  /** La sede; sin ella no se muestra nada. */
  branch?: Pick<Branch, 'name' | 'color'>;
  size?: BadgeSize;
  className?: string;
}

/** La sede con el color que le dio la clínica, igual en pacientes, bitácora y agenda. */
export const BranchBadge: React.FC<BranchBadgeProps> = ({ branch, size, className }) => {
  if (!branch) return null;

  return (
    <Badge
      accentColor={getBranchStripeColor(branch.color)}
      textColor={getBranchTextColor(branch.color)}
      size={size}
      className={className}
    >
      {branch.name}
    </Badge>
  );
};
