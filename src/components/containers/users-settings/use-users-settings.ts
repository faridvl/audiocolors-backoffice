import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { FormikHelpers } from 'formik';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useSession } from '@/hooks/use-session';
import { ApiError, HttpStatus } from '@/shared/api/api-service-client';
import { useCreateUserMutation } from '@/shared/api/mutations/users/create-user-mutation';
import { useSetUserPasswordMutation } from '@/shared/api/mutations/users/set-user-password-mutation';
import { useUpdateUserMutation } from '@/shared/api/mutations/users/update-user-mutation';
import { useUpdateUserStatusMutation } from '@/shared/api/mutations/users/update-user-status-mutation';
import { FETCH_USERS_KEY, useUsersQuery } from '@/shared/api/querys/users-query';
import { toPatientPhone } from '@/shared/utils/phone';
import { TEXT } from '@/static/texts/i18n';
import { ManagedUser, UserStatus } from '@/types/users/user';
import {
  API_FIELD_TO_FORM_FIELD,
  buildUserFormInitialValues,
  buildUserPasswordSchema,
  buildUserSchema,
  USER_FORM_FIELDS,
  UserFormValues,
  UserPasswordFormValues,
} from './users-form';
import { getRoleChange, getUserActions, sortUsers } from './users-logic';

const TOASTS = TEXT.SETTINGS.USERS.TOASTS;

/** Qué ventana de edición está abierta: una nueva, la de un usuario, o ninguna. */
const NEW_USER = 'new';
type Editor = typeof NEW_USER | ManagedUser | null;

export function useUsersSettings() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user: sessionUser } = useSession();
  const { data, isLoading, isError, refetch } = useUsersQuery();
  const { executeCreateUser, isPending: isCreating } = useCreateUserMutation();
  const { executeUpdateUser, isPending: isUpdating } = useUpdateUserMutation();
  const { executeSetUserPassword, isPending: isSettingPassword } = useSetUserPasswordMutation();
  const { executeUpdateUserStatus, isPending: isChangingStatus } = useUpdateUserStatusMutation();

  const [editor, setEditor] = useState<Editor>(null);
  const [passwordUser, setPasswordUser] = useState<ManagedUser | null>(null);
  const [statusUser, setStatusUser] = useState<ManagedUser | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  const users = useMemo(() => sortUsers(data ?? []), [data]);
  const currentUserUuid = sessionUser?.uuid;
  const editingUser = editor !== null && editor !== NEW_USER ? editor : null;
  const isNewUser = editor === NEW_USER;

  const userSchema = useMemo(() => buildUserSchema(t, isNewUser), [t, isNewUser]);
  const passwordSchema = useMemo(() => buildUserPasswordSchema(t), [t]);
  const userInitialValues = useMemo(() => buildUserFormInitialValues(editingUser), [editingUser]);

  const refreshUsers = () => queryClient.invalidateQueries({ queryKey: [FETCH_USERS_KEY] });

  const getActions = (user: ManagedUser) => getUserActions(user, currentUserUuid);
  const isCurrentUser = (user: ManagedUser) => user.uuid === currentUserUuid;

  const showApiError = <Values extends object>(
    error: Error,
    helpers: FormikHelpers<Values>,
    knownFields: string[],
  ) => {
    if (error instanceof ApiError && error.status === HttpStatus.CONFLICT) {
      helpers.setFieldError('email', t(TEXT.SETTINGS.USERS.ERRORS.EMAIL_TAKEN));
      return;
    }
    const details = error instanceof ApiError ? error.details : [];
    const fieldErrors = details
      .map(({ field, message }) => ({
        field: API_FIELD_TO_FORM_FIELD[field] ?? field,
        message,
      }))
      .filter(({ field }) => knownFields.includes(field));
    // Un 400 con detalle por campo se muestra junto al campo; el resto, como aviso.
    if (fieldErrors.length === 0) {
      toast.error(error.message);
      return;
    }
    fieldErrors.forEach(({ field, message }) => helpers.setFieldError(field, message));
  };

  const handleSubmitUser = (values: UserFormValues, helpers: FormikHelpers<UserFormValues>) => {
    const fullName = values.fullName.trim();
    const specialty = values.specialty.trim();
    const phoneNumber = values.phone.trim() ? toPatientPhone(values.phone) : '';
    const callbacks = {
      onError: (error: Error) => showApiError(error, helpers, USER_FORM_FIELDS),
      onSettled: () => helpers.setSubmitting(false),
    };

    if (editingUser) {
      const role = isCurrentUser(editingUser)
        ? undefined
        : getRoleChange(values.role, editingUser.role);
      executeUpdateUser(
        {
          userUuid: editingUser.uuid,
          changes: {
            fullName,
            specialty,
            phoneNumber,
            ...(role ? { role } : {}),
          },
        },
        {
          ...callbacks,
          onSuccess: () => {
            void refreshUsers();
            setEditor(null);
            toast.success(t(TOASTS.SAVED));
          },
        },
      );
      return;
    }

    // El esquema ya exige rol en el alta; esto solo acota el tipo.
    if (values.role === '') {
      helpers.setSubmitting(false);
      return;
    }

    executeCreateUser(
      {
        email: values.email.trim(),
        fullName,
        password: values.password,
        role: values.role,
        ...(specialty ? { specialty } : {}),
        ...(phoneNumber ? { phoneNumber } : {}),
      },
      {
        ...callbacks,
        onSuccess: () => {
          void refreshUsers();
          setEditor(null);
          toast.success(t(TOASTS.CREATED));
        },
      },
    );
  };

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
        onError: (error: Error) => showApiError(error, helpers, ['password']),
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
    editor: {
      isOpen: editor !== null,
      isNew: isNewUser,
      user: editingUser,
      initialValues: userInitialValues,
      schema: userSchema,
      isSaving: isCreating || isUpdating,
      openFor: (user: ManagedUser) => setEditor(user),
      openNew: () => setEditor(NEW_USER),
      close: () => setEditor(null),
      submit: handleSubmitUser,
    },
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
