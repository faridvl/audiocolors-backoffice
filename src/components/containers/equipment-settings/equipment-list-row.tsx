import React from 'react';
import { Pencil, Power, PowerOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ActionMenu, ActionMenuItem } from '@/components/common/action-menu/action-menu';
import { Badge } from '@/components/common/badge/badge';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { formatEquipmentName } from '@/shared/utils/equipment';
import { TEXT } from '@/static/texts/i18n';
import { Equipment } from '@/types/equipment/equipment';
import { tailwind } from '@/utils/tailwind-utils';

interface EquipmentListRowProps {
  equipment: Equipment;
  isChanging: boolean;
  onEdit: () => void;
  onDeactivate: () => void;
  onReactivate: () => void;
}

const MENU_ICON_CLASSES = 'h-4 w-4 shrink-0';

/** Un equipo tal como queda: se edita en su ventana; se desactiva o reactiva desde su fila. */
export const EquipmentListRow: React.FC<EquipmentListRowProps> = ({
  equipment,
  isChanging,
  onEdit,
  onDeactivate,
  onReactivate,
}) => {
  const { t } = useTranslation();
  const name = formatEquipmentName(equipment);
  const toggleLabel = t(
    equipment.isActive ? TEXT.SETTINGS.EQUIPMENT.DEACTIVATE : TEXT.SETTINGS.EQUIPMENT.REACTIVATE,
  );
  const menuItems: ActionMenuItem[] = [
    {
      label: t(TEXT.SETTINGS.EQUIPMENT.EDIT),
      icon: <Pencil className={MENU_ICON_CLASSES} aria-hidden />,
      onClick: onEdit,
    },
    {
      label: toggleLabel,
      icon: equipment.isActive ? (
        <PowerOff className={MENU_ICON_CLASSES} aria-hidden />
      ) : (
        <Power className={MENU_ICON_CLASSES} aria-hidden />
      ),
      onClick: equipment.isActive ? onDeactivate : onReactivate,
    },
  ];

  return (
    <li className="flex min-h-[60px] items-center gap-3 border-b border-ink-100 px-4 py-2">
      <span className="flex min-w-0 flex-1 items-center gap-2 text-left">
        <Typography
          variant={TypographyVariant.BODY_SEMIBOLD}
          inline
          className={tailwind('truncate', !equipment.isActive && 'text-ink-500')}
        >
          {name}
        </Typography>
        {!equipment.isActive && <Badge>{t(TEXT.SETTINGS.EQUIPMENT.INACTIVE_BADGE)}</Badge>}
      </span>
      <ActionMenu
        ariaLabel={t(TEXT.SETTINGS.EQUIPMENT.ACTIONS_LABEL, { name })}
        items={menuItems}
        className="sm:hidden"
      />
      <div className="hidden shrink-0 items-center gap-2 sm:flex">
        <Button
          type="button"
          variant={ButtonVariant.SECONDARY}
          onClick={onEdit}
          aria-label={t(TEXT.SETTINGS.EQUIPMENT.EDIT_LABEL, { name })}
        >
          {t(TEXT.SETTINGS.EQUIPMENT.EDIT)}
        </Button>
        <Button
          type="button"
          variant={ButtonVariant.GHOST}
          onClick={equipment.isActive ? onDeactivate : onReactivate}
          isLoading={isChanging}
        >
          {toggleLabel}
        </Button>
      </div>
    </li>
  );
};
