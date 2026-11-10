import { useCallback, useMemo, useState } from 'react';
import { FormikHelpers } from 'formik';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import * as Yup from 'yup';
import { ApiError } from '@/shared/api/api-service-client';
import {
  isInvalidCurrentPasswordError,
  isSamePasswordError,
  useChangeOwnPasswordMutation,
} from '@/shared/api/mutations/users/change-own-password-mutation';
import { TEXT } from '@/static/texts/i18n';
import { buildPasswordSchema } from '../users-settings/users-form';
import { isPasswordWithinByteLimit } from '../users-settings/users-logic';

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

/** Campos del formulario que el API valida y puede marcar en un 400 con `details`. */
const API_FIELD_NAMES = ['currentPassword', 'newPassword'] as const;

/** Cambio de la propia contraseña: las reglas de la nueva son las mismas que valida el API. */
export function useProfilePassword() {
  const { t } = useTranslation();
  const { executeChangeOwnPassword, isPending: isSaving } = useChangeOwnPasswordMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  // El formulario vive dentro del modal: al cerrarlo se desmonta y queda en blanco.
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const schema = useMemo(
    () =>
      Yup.object({
        currentPassword: Yup.string()
          .required(t(TEXTS.ERRORS.CURRENT_REQUIRED))
          .test('password-max-bytes', t(TEXT.SETTINGS.USERS.ERRORS.PASSWORD_MAX), (value) =>
            isPasswordWithinByteLimit(value ?? ''),
          ),
        newPassword: buildPasswordSchema(t),
        confirmPassword: Yup.string()
          .required(t(TEXTS.ERRORS.CONFIRM_REQUIRED))
          .oneOf([Yup.ref('newPassword')], t(TEXTS.ERRORS.CONFIRM_MISMATCH)),
      }),
    [t],
  );

  const showApiError = (error: unknown, helpers: FormikHelpers<ProfilePasswordFormValues>) => {
    if (isInvalidCurrentPasswordError(error)) {
      helpers.setFieldError('currentPassword', t(TEXTS.ERRORS.CURRENT_INVALID));
      return;
    }
    if (isSamePasswordError(error)) {
      helpers.setFieldError('newPassword', t(TEXTS.ERRORS.SAME_PASSWORD));
      return;
    }
    if (error instanceof ApiError) {
      const fieldErrors = error.details.filter((detail) =>
        API_FIELD_NAMES.some((fieldName) => fieldName === detail.field),
      );
      if (fieldErrors.length > 0) {
        fieldErrors.forEach((detail) => helpers.setFieldError(detail.field, detail.message));
        return;
      }
    }
    toast.error(error instanceof Error ? error.message : t(TEXT.GENERAL.ERRORS.UNEXPECTED));
  };

  const submit = async (
    values: ProfilePasswordFormValues,
    helpers: FormikHelpers<ProfilePasswordFormValues>,
  ) => {
    try {
      await executeChangeOwnPassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
    } catch (error) {
      showApiError(error, helpers);
      return;
    }
    closeModal();
    toast.success(t(TEXTS.CHANGED));
  };

  return { schema, submit, isSaving, isModalOpen, openModal, closeModal };
}
