import React from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/common/badge/badge';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { ColorDot } from '@/components/common/color-dot/color-dot';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { getBranchStripeColor } from '@/shared/design/tokens';
import { formatPhoneForDisplay } from '@/shared/utils/phone';
import { TEXT } from '@/static/texts/i18n';
import { Branch } from '@/types/branches/branch';
import { tailwind } from '@/utils/tailwind-utils';

interface BranchListRowProps {
  branch: Branch;
  isChanging: boolean;
  onEdit: () => void;
  onDeactivate: () => void;
  onReactivate: () => void;
}

/** Una sede tal como queda: se edita en su ventana; se desactiva o reactiva desde su fila. */
export const BranchListRow: React.FC<BranchListRowProps> = ({
  branch,
  isChanging,
  onEdit,
  onDeactivate,
  onReactivate,
}) => {
  const { t } = useTranslation();
  const details = [branch.phone ? formatPhoneForDisplay(branch.phone) : null, branch.address]
    .filter(Boolean)
    .join(' · ');

  return (
    <li className="flex min-h-[60px] items-center gap-3 border-b border-ink-100 px-4 py-2">
      <ColorDot color={getBranchStripeColor(branch.color)} className="h-3 w-3" />
      <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5 text-left">
        <span className="flex min-w-0 max-w-full items-center gap-2">
          <Typography
            variant={TypographyVariant.BODY_SEMIBOLD}
            inline
            className={tailwind('truncate', !branch.isActive && 'text-ink-500')}
          >
            {branch.name}
          </Typography>
          {!branch.isActive && <Badge>{t(TEXT.SETTINGS.BRANCHES.INACTIVE_BADGE)}</Badge>}
        </span>
        {details && (
          <Typography variant={TypographyVariant.HELPER} inline className="max-w-full truncate">
            {details}
          </Typography>
        )}
      </span>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          variant={ButtonVariant.SECONDARY}
          onClick={onEdit}
          aria-label={t(TEXT.SETTINGS.BRANCHES.EDIT_LABEL, { name: branch.name })}
        >
          {t(TEXT.SETTINGS.BRANCHES.EDIT)}
        </Button>
        <Button
          type="button"
          variant={ButtonVariant.GHOST}
          onClick={branch.isActive ? onDeactivate : onReactivate}
          isLoading={isChanging}
        >
          {t(
            branch.isActive ? TEXT.SETTINGS.BRANCHES.DEACTIVATE : TEXT.SETTINGS.BRANCHES.REACTIVATE,
          )}
        </Button>
      </div>
    </li>
  );
};
