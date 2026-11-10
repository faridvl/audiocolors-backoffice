import React from 'react';
import { Ear, FileText, Pencil, UserCog } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { usePermissions } from '@/hooks/use-permissions';
import { Permission } from '@/shared/auth/permissions';
import { TEXT } from '@/static/texts/i18n';

const MAX_ACTIONS_WITH_MOBILE_LABEL = 2;

interface PatientActionsProps {
  onEdit: () => void;
  onChangeStatus: () => void;
  onEditFlags: () => void;
  onGenerateSummary: () => void;
}

/**
 * Acciones del paciente en una columna a la derecha. Con tres o más, en el celular solo íconos:
 * con texto le quitan ancho a los datos; con pocas, la etiqueta cabe y se ve siempre.
 */
export const PatientActions: React.FC<PatientActionsProps> = ({
  onEdit,
  onChangeStatus,
  onEditFlags,
  onGenerateSummary,
}) => {
  const { t } = useTranslation();
  const { can } = usePermissions();
  const actions = [
    {
      label: t(TEXT.PATIENTS.DETAIL.ACTIONS.EDIT),
      icon: Pencil,
      onClick: onEdit,
      permission: Permission.EDIT_PATIENT,
    },
    {
      label: t(TEXT.PATIENTS.DETAIL.ACTIONS.CHANGE_STATUS),
      icon: UserCog,
      onClick: onChangeStatus,
      permission: Permission.EDIT_PATIENT,
    },
    {
      label: t(TEXT.PATIENTS.FLAGS.MENU),
      icon: Ear,
      onClick: onEditFlags,
      permission: Permission.VIEW_CLINICAL_RECORD,
    },
    {
      label: t(TEXT.PATIENTS.DETAIL.ACTIONS.GENERATE_SUMMARY),
      icon: FileText,
      onClick: onGenerateSummary,
      permission: Permission.VIEW_CLINICAL_RECORD,
    },
  ].filter((action) => can(action.permission));

  if (actions.length === 0) return null;

  const showsLabelOnMobile = actions.length <= MAX_ACTIONS_WITH_MOBILE_LABEL;

  return (
    <div className="flex shrink-0 flex-col gap-2">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant={ButtonVariant.SECONDARY}
          onClick={action.onClick}
          aria-label={action.label}
          title={action.label}
          icon={<action.icon className="h-4 w-4 text-ink-500" aria-hidden />}
          className="min-w-[44px] justify-start whitespace-nowrap px-3"
        >
          <span className={showsLabelOnMobile ? undefined : 'hidden sm:inline'}>
            {action.label}
          </span>
        </Button>
      ))}
    </div>
  );
};
