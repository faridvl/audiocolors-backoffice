import React from 'react';
import { Ear, Pencil, UserCog } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { TEXT } from '@/static/texts/i18n';

interface PatientActionsProps {
  onEdit: () => void;
  onChangeStatus: () => void;
  onEditFlags: () => void;
}

/** Acciones del paciente a la vista. En el celular solo íconos: con texto no entran en una fila. */
export const PatientActions: React.FC<PatientActionsProps> = ({
  onEdit,
  onChangeStatus,
  onEditFlags,
}) => {
  const { t } = useTranslation();
  const actions = [
    { label: t(TEXT.PATIENTS.DETAIL.ACTIONS.EDIT), icon: Pencil, onClick: onEdit },
    {
      label: t(TEXT.PATIENTS.DETAIL.ACTIONS.CHANGE_STATUS),
      icon: UserCog,
      onClick: onChangeStatus,
    },
    { label: t(TEXT.PATIENTS.FLAGS.MENU), icon: Ear, onClick: onEditFlags },
  ];

  return (
    <div className="flex shrink-0 flex-wrap gap-2">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant={ButtonVariant.SECONDARY}
          onClick={action.onClick}
          aria-label={action.label}
          title={action.label}
          icon={<action.icon className="h-4 w-4 text-ink-500" aria-hidden />}
          className="min-w-[44px] whitespace-nowrap px-3"
        >
          <span className="hidden sm:inline">{action.label}</span>
        </Button>
      ))}
    </div>
  );
};
