import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useQueryClient } from '@tanstack/react-query';
import { FormikHelpers } from 'formik';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useSession } from '@/hooks/use-session';
import { ApiError } from '@/shared/api/api-service-client';
import { useSetUserPasswordMutation } from '@/shared/api/mutations/users/set-user-password-mutation';
import { useUpdateUserStatusMutation } from '@/shared/api/mutations/users/update-user-status-mutation';
import { FETCH_USERS_KEY, useUsersQuery } from '@/shared/api/querys/users-query';
import { routesPrivate } from '@/shared/navigation/routes';
import { TEXT } from '@/static/texts/i18n';
import { ManagedUser, UserStatus } from '@/types/users/user';
import { buildUserPasswordSchema, UserPasswordFormValues } from './users-form';
import { getUserActions, sortUsers } from './users-logic';

const TOASTS = TEXT.SETTINGS.USERS.TOASTS;

export function useUsersSettings() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: sessionUser } = useSession();
  const { data, isLoading, isError, refetch } = useUsersQuery();
  const { executeSetUserPassword, isPending: isSettingPassword } = useSetUserPasswordMutation();
  const { executeUpdateUserStatus, isPending: isChangingStatus } = useUpdateUserStatusMutation();

  const [passwordUser, setPasswordUser] = useState<ManagedUser | null>(null);
  const [statusUser, setStatusUser] = useState<ManagedUser | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  const users = useMemo(() => sortUsers(data ?? []), [data]);
  const currentUserUuid = sessionUser?.uuid;
  const passwordSchema = useMemo(() => buildUserPasswordSchema(t), [t]);

  const refreshUsers = () => queryClient.invalidateQueries({ queryKey: [FETCH_USERS_KEY] });

  const getActions = (user: ManagedUser) => getUserActions(user, currentUserUuid);
  const isCurrentUser = (user: ManagedUser) => user.uuid === currentUserUuid;

  const handleSubmitPassword = (
    values: UserPasswordFormValues,
    helpers: FormikHelpers<UserPasswordFormValues>,
  ) => {
    if (!passwordUser) return;
    executeSetUserPassword(
      { userUuid: passwordUser.uuid, password: values.password },
      {
        onSuccess: () => {
          setPasswordUser(null);
          toast.success(t(TOASTS.PASSWORD_SET));
        },
        onError: (error: Error) => {
          const details = error instanceof ApiError ? error.details : [];
          const message = details.find(({ field }) => field === 'password')?.message;
          if (message) helpers.setFieldError('password', message);
          else toast.error(error.message);
        },
        onSettled: () => helpers.setSubmitting(false),
      },
    );
  };

  const openStatusDialog = (user: ManagedUser) => {
    setStatusError(null);
    setStatusUser(user);
  };

  const closeStatusDialog = () => {
    setStatusError(null);
    setStatusUser(null);
  };

  const confirmStatusChange = () => {
    if (!statusUser) return;
    const isDeactivating = statusUser.status === UserStatus.ACTIVE;
    executeUpdateUserStatus(
      {
        userUuid: statusUser.uuid,
        status: isDeactivating ? UserStatus.INACTIVE : UserStatus.ACTIVE,
      },
      {
        onSuccess: () => {
          void refreshUsers();
          closeStatusDialog();
          toast.success(t(isDeactivating ? TOASTS.DEACTIVATED : TOASTS.REACTIVATED));
        },
        onError: () => setStatusError(t(TEXT.SETTINGS.USERS.STATUS_DIALOG.ERROR)),
      },
    );
  };

  return {
    users,
    isLoading,
    isError,
    refetch,
    getActions,
    isCurrentUser,
    openNew: () => void router.push(routesPrivate.settings.usersNew),
    openEditor: (user: ManagedUser) =>
      void router.push(routesPrivate.settings.userDetail(user.uuid)),
    password: {
      user: passwordUser,
      schema: passwordSchema,
      isSaving: isSettingPassword,
      open: setPasswordUser,
      close: () => setPasswordUser(null),
      submit: handleSubmitPassword,
    },
    status: {
      user: statusUser,
      isChanging: isChangingStatus,
      error: statusError,
      open: openStatusDialog,
      close: closeStatusDialog,
      confirm: confirmStatusChange,
    },
  };
}
