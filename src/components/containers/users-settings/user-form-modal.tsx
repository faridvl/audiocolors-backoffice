import React, { useState } from 'react';
import { Form, Formik, FormikHelpers } from 'formik';
import { UserPlus, UserCog } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { FocusFirstError } from '@/components/common/form/focus-first-error';
import { FormDirtyReporter } from '@/components/common/form/form-dirty-reporter';
import { FormField } from '@/components/common/input/input';
import { PhoneField } from '@/components/common/phone-field/phone-field';
import { TEXT } from '@/static/texts/i18n';
import {
  ASSIGNABLE_USER_ROLES,
  ManagedUser,
  USER_EMAIL_MAX_LENGTH,
  USER_FULL_NAME_MAX_LENGTH,
  USER_PASSWORD_MAX_LENGTH,
  USER_SPECIALTY_MAX_LENGTH,
} from '@/types/users/user';
import { UserFormValues } from './users-form';
import { UserModalShell } from './user-modal-shell';

interface UserFormModalProps {
  /** Sin usuario, la ventana crea uno nuevo. */
  user: ManagedUser | null;
  initialValues: UserFormValues;
  validationSchema: unknown;
  isSaving: boolean;
  /** Por qué no se puede cambiar el rol; sin motivo, el rol se elige. */
  roleLockReason: string | null;
  /** Rol que se muestra cuando el selector está bloqueado. */
  lockedRoleLabel: string | null;
  /** Aviso fijo bajo el selector cuando no está bloqueado (p.ej. rol anterior). */
  roleHint: string | null;
  onSubmit: (values: UserFormValues, helpers: FormikHelpers<UserFormValues>) => void;
  onClose: () => void;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  user,
  initialValues,
  validationSchema,
  isSaving,
  roleLockReason,
  lockedRoleLabel,
  roleHint,
  onSubmit,
  onClose,
}) => {
  const { t } = useTranslation();
  const isNew = user === null;
  const isRoleLocked = roleLockReason !== null;
  const [isDirty, setIsDirty] = useState(false);
  const FORM = TEXT.SETTINGS.USERS.FORM;

  return (
    <UserModalShell
      title={t(isNew ? FORM.NEW_TITLE : FORM.EDIT_TITLE)}
      icon={
        isNew ? (
          <UserPlus className="h-5 w-5 text-brand-700" aria-hidden />
        ) : (
          <UserCog className="h-5 w-5 text-brand-700" aria-hidden />
        )
      }
      isDirty={isDirty}
      onClose={onClose}
    >
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
        <Form className="mt-5 flex min-h-0 flex-1 flex-col gap-4">
          <FocusFirstError />
          <FormDirtyReporter onDirtyChange={setIsDirty} />
          <div className="-mx-1 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-1 py-1">
            <FormField
              name="fullName"
              label={t(FORM.FULL_NAME)}
              maxLength={USER_FULL_NAME_MAX_LENGTH}
              required
            />
            <FormField
              name="email"
              type="email"
              label={t(FORM.EMAIL)}
              maxLength={USER_EMAIL_MAX_LENGTH}
              disabled={!isNew}
              hint={isNew ? undefined : t(FORM.EMAIL_READ_ONLY)}
              isHintAlwaysVisible
              required={isNew}
            />
            <FormField
              name="role"
              as="select"
              label={t(FORM.ROLE)}
              disabled={isRoleLocked}
              hint={roleLockReason ?? roleHint ?? undefined}
              isHintAlwaysVisible
              required={isNew}
              displayValue={isRoleLocked && user?.role ? user.role : undefined}
            >
              {isRoleLocked && user?.role ? (
                <option value={user.role}>{lockedRoleLabel}</option>
              ) : (
                <option value="">{t(FORM.ROLE_PLACEHOLDER)}</option>
              )}
              {!isRoleLocked &&
                ASSIGNABLE_USER_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {t(TEXT.SETTINGS.USERS.ROLES[role])}
                  </option>
                ))}
            </FormField>
            <FormField
              name="specialty"
              label={t(FORM.SPECIALTY)}
              maxLength={USER_SPECIALTY_MAX_LENGTH}
              optional
            />
            <PhoneField name="phone" label={t(FORM.PHONE)} />
            {isNew && (
              <FormField
                name="password"
                type="password"
                label={t(FORM.PASSWORD)}
                maxLength={USER_PASSWORD_MAX_LENGTH}
                hint={t(FORM.PASSWORD_HINT)}
                required
              />
            )}
          </div>

          <div className="flex shrink-0 flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant={ButtonVariant.SECONDARY} onClick={onClose} disabled={isSaving}>
              {t(TEXT.GENERAL.BUTTONS.CANCEL)}
            </Button>
            <Button type="submit" variant={ButtonVariant.PRIMARY} isLoading={isSaving}>
              {t(isNew ? FORM.CREATE : TEXT.GENERAL.BUTTONS.SAVE)}
            </Button>
          </div>
        </Form>
      </Formik>
    </UserModalShell>
  );
};
