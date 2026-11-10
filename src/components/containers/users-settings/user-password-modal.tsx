import React, { useState } from 'react';
import { Form, Formik, FormikHelpers } from 'formik';
import { KeyRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { FocusFirstError } from '@/components/common/form/focus-first-error';
import { FormDirtyReporter } from '@/components/common/form/form-dirty-reporter';
import { FormField } from '@/components/common/input/input';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { ManagedUser, USER_PASSWORD_MAX_LENGTH } from '@/types/users/user';
import { UserPasswordFormValues } from './users-form';
import { UserModalShell } from './user-modal-shell';

interface UserPasswordModalProps {
  user: ManagedUser;
  validationSchema: unknown;
  isSaving: boolean;
  onSubmit: (
    values: UserPasswordFormValues,
    helpers: FormikHelpers<UserPasswordFormValues>,
  ) => void;
  onClose: () => void;
}

const INITIAL_VALUES: UserPasswordFormValues = { password: '' };

export const UserPasswordModal: React.FC<UserPasswordModalProps> = ({
  user,
  validationSchema,
  isSaving,
  onSubmit,
  onClose,
}) => {
  const { t } = useTranslation();
  const PASSWORD_MODAL = TEXT.SETTINGS.USERS.PASSWORD_MODAL;
  const [isDirty, setIsDirty] = useState(false);

  return (
    <UserModalShell
      title={t(PASSWORD_MODAL.TITLE)}
      icon={<KeyRound className="h-5 w-5 text-brand-700" aria-hidden />}
      isDirty={isDirty}
      onClose={onClose}
    >
      <Formik
        initialValues={INITIAL_VALUES}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        <Form className="mt-4 flex min-h-0 flex-1 flex-col gap-4">
          <FocusFirstError />
          <FormDirtyReporter onDirtyChange={setIsDirty} />
          <Typography variant={TypographyVariant.BODY}>
            {t(PASSWORD_MODAL.DESCRIPTION, { name: user.fullName })}
          </Typography>
          <FormField
            name="password"
            type="password"
            label={t(PASSWORD_MODAL.LABEL)}
            maxLength={USER_PASSWORD_MAX_LENGTH}
            hint={t(TEXT.SETTINGS.USERS.FORM.PASSWORD_HINT)}
            required
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant={ButtonVariant.SECONDARY} onClick={onClose} disabled={isSaving}>
              {t(TEXT.GENERAL.BUTTONS.CANCEL)}
            </Button>
            <Button type="submit" variant={ButtonVariant.PRIMARY} isLoading={isSaving}>
              {t(PASSWORD_MODAL.SUBMIT)}
            </Button>
          </div>
        </Form>
      </Formik>
    </UserModalShell>
  );
};
