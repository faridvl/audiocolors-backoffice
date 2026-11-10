import React, { useId } from 'react';
import { Pencil, Power, PowerOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ActionMenu, ActionMenuItem } from '@/components/common/action-menu/action-menu';
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
  /** Es la única sede activa: no se puede desactivar. */
  isLastActive: boolean;
  onEdit: () => void;
  onDeactivate: () => void;
  onReactivate: () => void;
}

const MENU_ICON_CLASSES = 'h-4 w-4 shrink-0';

/** Una sede tal como queda: se edita en su ventana; se desactiva o reactiva desde su fila. */
export const BranchListRow: React.FC<BranchListRowProps> = ({
  branch,
  isChanging,
  isLastActive,
  onEdit,
  onDeactivate,
  onReactivate,
}) => {
  const { t } = useTranslation();
  const helpId = useId();
  const cannotDeactivate = branch.isActive && isLastActive;
  const menuItems: ActionMenuItem[] = [
    {
      label: t(TEXT.SETTINGS.BRANCHES.EDIT),
      icon: <Pencil className={MENU_ICON_CLASSES} aria-hidden />,
      onClick: onEdit,
    },
  ];
  if (!cannotDeactivate) {
    menuItems.push({
      label: t(
        branch.isActive ? TEXT.SETTINGS.BRANCHES.DEACTIVATE : TEXT.SETTINGS.BRANCHES.REACTIVATE,
      ),
      icon: branch.isActive ? (
        <PowerOff className={MENU_ICON_CLASSES} aria-hidden />
      ) : (
        <Power className={MENU_ICON_CLASSES} aria-hidden />
      ),
      onClick: branch.isActive ? onDeactivate : onReactivate,
    });
  }
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
        {cannotDeactivate && (
          <Typography id={helpId} variant={TypographyVariant.HELPER} inline className="max-w-full">
            {t(TEXT.SETTINGS.BRANCHES.LAST_ACTIVE_BRANCH)}
          </Typography>
        )}
      </span>
      <ActionMenu
        ariaLabel={t(TEXT.SETTINGS.BRANCHES.ACTIONS_LABEL, { name: branch.name })}
        items={menuItems}
        className="sm:hidden"
      />
      <div className="hidden shrink-0 items-center gap-2 sm:flex">
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
          disabled={cannotDeactivate}
          aria-describedby={cannotDeactivate ? helpId : undefined}
        >
          {t(
            branch.isActive ? TEXT.SETTINGS.BRANCHES.DEACTIVATE : TEXT.SETTINGS.BRANCHES.REACTIVATE,
          )}
        </Button>
      </div>
    </li>
  );
};
