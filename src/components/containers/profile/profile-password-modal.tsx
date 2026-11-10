import React from 'react';
import { Form, Formik, FormikHelpers } from 'formik';
import { KeyRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { FocusFirstError } from '@/components/common/form/focus-first-error';
import { FIELD_LABEL_CLASSES, FormField } from '@/components/common/input/input';
import { TEXT } from '@/static/texts/i18n';
import { USER_PASSWORD_MAX_LENGTH } from '@/types/users/user';
import { UserModalShell } from '../users-settings/user-modal-shell';
import { PROFILE_PASSWORD_INITIAL_VALUES, ProfilePasswordFormValues } from './use-profile-password';

const TEXTS = TEXT.PROFILE.PASSWORD;

interface ProfilePasswordModalProps {
  validationSchema: unknown;
  isSaving: boolean;
  onSubmit: (
    values: ProfilePasswordFormValues,
    helpers: FormikHelpers<ProfilePasswordFormValues>,
  ) => void | Promise<void>;
  onClose: () => void;
}

/** Los tres campos van siempre en una columna, también en pantallas anchas. */
export const ProfilePasswordModal: React.FC<ProfilePasswordModalProps> = ({
  validationSchema,
  isSaving,
  onSubmit,
  onClose,
}) => {
  const { t } = useTranslation();

  return (
    <UserModalShell
      title={t(TEXTS.MODAL_TITLE)}
      icon={<KeyRound className="h-5 w-5 text-brand-700" aria-hidden />}
      isDirty={false}
      isBusy={isSaving}
      onClose={onClose}
    >
      <Formik
        initialValues={PROFILE_PASSWORD_INITIAL_VALUES}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        <Form className="mt-4 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto" noValidate>
          <FocusFirstError />
          <FormField
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            label={t(TEXTS.CURRENT)}
            labelClassName={FIELD_LABEL_CLASSES}
            maxLength={USER_PASSWORD_MAX_LENGTH}
          />
          <FormField
            name="newPassword"
            type="password"
            autoComplete="new-password"
            label={t(TEXTS.NEW)}
            labelClassName={FIELD_LABEL_CLASSES}
            maxLength={USER_PASSWORD_MAX_LENGTH}
            hint={t(TEXT.SETTINGS.USERS.FORM.PASSWORD_HINT)}
          />
          <FormField
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            label={t(TEXTS.CONFIRM)}
            labelClassName={FIELD_LABEL_CLASSES}
            maxLength={USER_PASSWORD_MAX_LENGTH}
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant={ButtonVariant.SECONDARY} onClick={onClose} disabled={isSaving}>
              {t(TEXT.GENERAL.BUTTONS.CANCEL)}
            </Button>
            <Button
              type="submit"
              variant={ButtonVariant.PRIMARY}
              isLoading={isSaving}
              disabled={isSaving}
            >
              {t(TEXT.GENERAL.BUTTONS.SAVE)}
            </Button>
          </div>
        </Form>
      </Formik>
    </UserModalShell>
  );
};
