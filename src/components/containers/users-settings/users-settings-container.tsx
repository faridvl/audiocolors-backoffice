import React from 'react';
import { KeyRound, Pencil, Plus, UserCheck, UserX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ActionMenu, ActionMenuItem } from '@/components/common/action-menu/action-menu';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { ConfirmDialog } from '@/components/common/confirm-dialog/confirm-dialog';
import { ResponsiveTable, TableColumn } from '@/components/common/table/responsive-table';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { ManagedUser, UserStatus } from '@/types/users/user';
import { tailwind } from '@/utils/tailwind-utils';
import { UserFormModal } from './user-form-modal';
import { UserPasswordModal } from './user-password-modal';
import { USER_STATUS_CLASSES } from './users-styles';
import { useUsersSettings } from './use-users-settings';

const TEXTS = TEXT.SETTINGS.USERS;
const ICON_CLASSES = 'h-4 w-4';

export const UsersSettingsContainer: React.FC = () => {
  const { t } = useTranslation();
  const {
    users,
    isLoading,
    isError,
    refetch,
    getActions,
    isCurrentUser,
    editor,
    password,
    status,
  } = useUsersSettings();

  const columns: TableColumn<ManagedUser>[] = [
    {
      key: 'name',
      header: t(TEXTS.COLUMNS.NAME),
      isCardTitle: true,
      render: (user) => (
        <span className="flex flex-wrap items-center gap-2">
          <Typography variant={TypographyVariant.ACCENT}>{user.fullName}</Typography>
          {isCurrentUser(user) && (
            <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand-700">
              {t(TEXTS.YOU)}
            </span>
          )}
        </span>
      ),
    },
    {
      key: 'email',
      header: t(TEXTS.COLUMNS.EMAIL),
      render: (user) => <span className="break-all">{user.email}</span>,
    },
    {
      key: 'role',
      header: t(TEXTS.COLUMNS.ROLE),
      render: (user) => t(TEXTS.ROLES[user.role]),
    },
    {
      key: 'status',
      header: t(TEXTS.COLUMNS.STATUS),
      render: (user) => (
        <span
          className={tailwind(
            'inline-block w-fit whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium',
            USER_STATUS_CLASSES[user.status],
          )}
        >
          {t(TEXTS.STATUS[user.status])}
        </span>
      ),
    },
    {
      key: 'specialty',
      header: t(TEXTS.COLUMNS.SPECIALTY),
      render: (user) => user.specialty || t(TEXTS.NO_VALUE),
    },
  ];

  const buildMenuItems = (user: ManagedUser): ActionMenuItem[] => {
    const { canToggleStatus } = getActions(user);
    const items: ActionMenuItem[] = [
      {
        label: t(TEXTS.ACTIONS.EDIT),
        icon: <Pencil className={ICON_CLASSES} aria-hidden />,
        onClick: () => editor.openFor(user),
      },
      {
        label: t(TEXTS.ACTIONS.SET_PASSWORD),
        icon: <KeyRound className={ICON_CLASSES} aria-hidden />,
        onClick: () => password.open(user),
      },
    ];
    if (!canToggleStatus) return items;
    const isActive = user.status === UserStatus.ACTIVE;
    items.push({
      label: t(isActive ? TEXTS.ACTIONS.DEACTIVATE : TEXTS.ACTIONS.REACTIVATE),
      icon: isActive ? (
        <UserX className={ICON_CLASSES} aria-hidden />
      ) : (
        <UserCheck className={ICON_CLASSES} aria-hidden />
      ),
      isDanger: isActive,
      onClick: () => status.open(user),
    });
    return items;
  };

  const getRoleLockReason = (user: ManagedUser | null): string | null => {
    if (!user) return null;
    if (isCurrentUser(user)) return t(TEXTS.FORM.ROLE_SELF_HINT);
    return getActions(user).canChangeRole ? null : t(TEXTS.FORM.ROLE_LAST_OWNER_HINT);
  };

  const isDeactivating = status.user?.status === UserStatus.ACTIVE;
  const statusDialog = isDeactivating
    ? {
        title: TEXTS.STATUS_DIALOG.DEACTIVATE_TITLE,
        message: TEXTS.STATUS_DIALOG.DEACTIVATE_MESSAGE,
        confirm: TEXTS.STATUS_DIALOG.DEACTIVATE_CONFIRM,
      }
    : {
        title: TEXTS.STATUS_DIALOG.REACTIVATE_TITLE,
        message: TEXTS.STATUS_DIALOG.REACTIVATE_MESSAGE,
        confirm: TEXTS.STATUS_DIALOG.REACTIVATE_CONFIRM,
      };

  return (
    <div className="flex w-full flex-col gap-4">
      <Button
        variant={ButtonVariant.PRIMARY}
        onClick={editor.openNew}
        icon={<Plus className={ICON_CLASSES} aria-hidden />}
        className="w-full sm:w-auto sm:self-end"
      >
        {t(TEXTS.ADD)}
      </Button>

      <ResponsiveTable
        columns={columns}
        rows={users}
        getRowKey={(user) => user.uuid}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        emptyTitle={t(TEXTS.EMPTY_TITLE)}
        errorTitle={t(TEXTS.LOAD_ERROR)}
        cardTitleClassName="pr-12"
        rowActions={(user) => (
          <ActionMenu
            ariaLabel={t(TEXTS.ACTIONS_LABEL, { name: user.fullName })}
            items={buildMenuItems(user)}
          />
        )}
      />

      {editor.isOpen && (
        <UserFormModal
          key={editor.user?.uuid ?? 'new-user'}
          user={editor.user}
          initialValues={editor.initialValues}
          validationSchema={editor.schema}
          isSaving={editor.isSaving}
          roleLockReason={getRoleLockReason(editor.user)}
          onSubmit={editor.submit}
          onClose={editor.close}
        />
      )}

      {password.user && (
        <UserPasswordModal
          user={password.user}
          validationSchema={password.schema}
          isSaving={password.isSaving}
          onSubmit={password.submit}
          onClose={password.close}
        />
      )}

      {status.user && (
        <ConfirmDialog
          title={t(statusDialog.title, { name: status.user.fullName })}
          message={t(statusDialog.message, { name: status.user.fullName })}
          confirmLabel={t(statusDialog.confirm)}
          cancelLabel={t(TEXT.GENERAL.BUTTONS.CANCEL)}
          onConfirm={status.confirm}
          onCancel={status.close}
        />
      )}
    </div>
  );
};
