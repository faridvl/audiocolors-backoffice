import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { useQueryClient } from '@tanstack/react-query';
import { FormikHelpers } from 'formik';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/use-permissions';
import { SESSION_QUERY_KEY, useSession } from '@/hooks/use-session';
import { ApiError, HttpStatus } from '@/shared/api/api-service-client';
import { useCreateUserMutation } from '@/shared/api/mutations/users/create-user-mutation';
import { useUpdateUserMutation } from '@/shared/api/mutations/users/update-user-mutation';
import { FETCH_USER_AUDIT_KEY } from '@/shared/api/querys/user-audit-query';
import { useUserCatalogsQuery } from '@/shared/api/querys/user-catalogs-query';
import { FETCH_USERS_KEY, useUsersQuery } from '@/shared/api/querys/users-query';
import { Permission } from '@/shared/auth/permissions';
import { routesPrivate } from '@/shared/navigation/routes';
import { toPatientPhone } from '@/shared/utils/phone';
import { TEXT } from '@/static/texts/i18n';
import { ClinicalSpecialty } from '@/types/auth/auth';
import {
  API_FIELD_TO_FORM_FIELD,
  buildUserFormInitialValues,
  buildUserSchema,
  USER_FORM_FIELDS,
  UserFormValues,
} from './users-form';
import {
  getAssignableRoles,
  getClinicalAccessChange,
  getRoleChange,
  getSelectableRoles,
  getUserActions,
} from './users-logic';

const TOASTS = TEXT.SETTINGS.USERS.TOASTS;

/** Alta (sin `userUuid`) o edición de un usuario de la clínica. */
export function useUserEditor(userUuid?: string) {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: sessionUser, isLoading: isLoadingSession } = useSession();
  const { can } = usePermissions();
  const { data: users, isLoading: isLoadingUsers, isError, refetch } = useUsersQuery();
  const { data: catalogs } = useUserCatalogsQuery();
  const { executeCreateUser, isPending: isCreating } = useCreateUserMutation();
  const { executeUpdateUser, isPending: isUpdating } = useUpdateUserMutation();

  const isNew = userUuid === undefined;
  const user = useMemo(
    () => (isNew ? null : (users?.find(({ uuid }) => uuid === userUuid) ?? null)),
    [isNew, users, userUuid],
  );
  const isSelf = user !== null && user.uuid === sessionUser?.uuid;
  const actions = user ? getUserActions(user, sessionUser?.uuid) : null;
  const canEditClinicalAccess = can(Permission.MANAGE_CLINICAL_ACCESS);
  const assignableRoles = useMemo(() => getAssignableRoles(sessionUser?.role), [sessionUser?.role]);

  const selectableRoles = useMemo(
    () => getSelectableRoles(assignableRoles, user?.role),
    [assignableRoles, user?.role],
  );

  const schema = useMemo(
    () => buildUserSchema(t, isNew, selectableRoles),
    [t, isNew, selectableRoles],
  );
  const initialValues = useMemo(
    () => buildUserFormInitialValues(user, selectableRoles),
    [user, selectableRoles],
  );

  const specialtyOptions = (catalogs?.specialties ?? Object.values(ClinicalSpecialty)).map(
    (code) => ({ value: code, label: t(TEXT.SETTINGS.USERS.SPECIALTIES[code]) }),
  );

  const goBack = () => void router.push(routesPrivate.settings.users);

  const refreshAfterSave = () => {
    void queryClient.invalidateQueries({ queryKey: [FETCH_USERS_KEY] });
    void queryClient.invalidateQueries({ queryKey: [FETCH_USER_AUDIT_KEY] });
    if (isSelf) void queryClient.invalidateQueries({ queryKey: [SESSION_QUERY_KEY] });
  };

  const showApiError = (error: Error, helpers: FormikHelpers<UserFormValues>) => {
    if (error instanceof ApiError && error.status === HttpStatus.CONFLICT) {
      helpers.setFieldError('email', t(TEXT.SETTINGS.USERS.ERRORS.EMAIL_TAKEN));
      return;
    }
    const details = error instanceof ApiError ? error.details : [];
    const fieldErrors = details
      .map(({ field, message }) => ({ field: API_FIELD_TO_FORM_FIELD[field] ?? field, message }))
      .filter(({ field }) => USER_FORM_FIELDS.includes(field));
    // Un 400 con detalle por campo se muestra junto al campo; el resto, como aviso.
    if (fieldErrors.length === 0) {
      toast.error(error.message);
      return;
    }
    fieldErrors.forEach(({ field, message }) => helpers.setFieldError(field, message));
  };

  const submit = (values: UserFormValues, helpers: FormikHelpers<UserFormValues>) => {
    const fullName = values.fullName.trim();
    const phoneNumber = values.phone.trim() ? toPatientPhone(values.phone) : '';
    const callbacks = {
      onError: (error: Error) => showApiError(error, helpers),
      onSettled: () => helpers.setSubmitting(false),
    };
    const clinicalAccess = canEditClinicalAccess
      ? getClinicalAccessChange(values, user)
      : undefined;

    if (user) {
      const role = isSelf ? undefined : getRoleChange(values.role, user.role, assignableRoles);
      executeUpdateUser(
        {
          userUuid: user.uuid,
          changes: { fullName, phoneNumber, ...(role ? { role } : {}), ...clinicalAccess },
        },
        {
          ...callbacks,
          onSuccess: () => {
            refreshAfterSave();
            toast.success(t(TOASTS.SAVED));
            goBack();
          },
        },
      );
      return;
    }

    // El esquema ya exige nivel en el alta; esto solo acota el tipo.
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
        ...(phoneNumber ? { phoneNumber } : {}),
        ...(clinicalAccess?.attendsPatients ? clinicalAccess : {}),
      },
      {
        ...callbacks,
        onSuccess: () => {
          refreshAfterSave();
          toast.success(t(TOASTS.CREATED));
          goBack();
        },
      },
    );
  };

  return {
    isNew,
    user,
    isSelf,
    isLoading: isLoadingUsers || isLoadingSession,
    isError,
    isNotFound: !isNew && !isLoadingUsers && !isError && user === null,
    refetch,
    isReadOnly: actions !== null && !actions.canEdit,
    canChangeRole: actions?.canChangeRole ?? true,
    canEditClinicalAccess,
    assignableRoles: selectableRoles,
    specialtyOptions,
    initialValues,
    schema,
    isSaving: isCreating || isUpdating,
    submit,
    goBack,
  };
}
