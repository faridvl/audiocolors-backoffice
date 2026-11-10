import { useMemo } from 'react';
import { FormikHelpers } from 'formik';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import * as Yup from 'yup';
import {
  isInvalidCurrentPasswordError,
  isSamePasswordError,
  useChangeOwnPasswordMutation,
} from '@/shared/api/mutations/users/change-own-password-mutation';
import { TEXT } from '@/static/texts/i18n';
import { USER_PASSWORD_MAX_LENGTH } from '@/types/users/user';
import { buildPasswordSchema } from '../users-settings/users-form';

const TEXTS = TEXT.PROFILE.PASSWORD;

export interface ProfilePasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const PROFILE_PASSWORD_INITIAL_VALUES: ProfilePasswordFormValues = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

/** Cambio de la propia contraseña: las reglas de la nueva son las mismas que valida el API. */
export function useProfilePassword() {
  const { t } = useTranslation();
  const { executeChangeOwnPassword, isPending: isSaving } = useChangeOwnPasswordMutation();

  const schema = useMemo(
    () =>
      Yup.object({
        currentPassword: Yup.string()
          .required(t(TEXTS.ERRORS.CURRENT_REQUIRED))
          .max(USER_PASSWORD_MAX_LENGTH, t(TEXT.SETTINGS.USERS.ERRORS.PASSWORD_MAX)),
        newPassword: buildPasswordSchema(t),
        confirmPassword: Yup.string()
          .required(t(TEXTS.ERRORS.CONFIRM_REQUIRED))
          .oneOf([Yup.ref('newPassword')], t(TEXTS.ERRORS.CONFIRM_MISMATCH)),
      }),
    [t],
  );

  const submit = (
    values: ProfilePasswordFormValues,
    helpers: FormikHelpers<ProfilePasswordFormValues>,
  ) => {
    executeChangeOwnPassword(
      { currentPassword: values.currentPassword, newPassword: values.newPassword },
      {
        onSuccess: () => {
          helpers.resetForm();
          toast.success(t(TEXTS.CHANGED));
        },
        onError: (error) => {
          if (isInvalidCurrentPasswordError(error)) {
            helpers.setFieldError('currentPassword', t(TEXTS.ERRORS.CURRENT_INVALID));
          } else if (isSamePasswordError(error)) {
            helpers.setFieldError('newPassword', t(TEXTS.ERRORS.SAME_PASSWORD));
          } else {
            toast.error(error.message);
          }
        },
        onSettled: () => helpers.setSubmitting(false),
      },
    );
  };

  return { schema, submit, isSaving };
}
