import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { FormikHelpers } from 'formik';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import * as Yup from 'yup';
import { SESSION_QUERY_KEY, useSession } from '@/hooks/use-session';
import { useUpdateUserMutation } from '@/shared/api/mutations/users/update-user-mutation';
import { FETCH_USERS_KEY } from '@/shared/api/querys/users-query';
import { useUserCatalogsQuery } from '@/shared/api/querys/user-catalogs-query';
import { TEXT } from '@/static/texts/i18n';
import { ProfessionalTitle } from '@/types/auth/auth';
import { formatProfessionalName } from '@/shared/utils/professional-name';
import { USER_LICENSE_NUMBER_MAX_LENGTH } from '@/types/users/user';

const ERRORS = TEXT.PROFILE.ERRORS;

export interface ProfileFormValues {
  /** Vacío = sin título. */
  professionalTitle: ProfessionalTitle | '';
  licenseNumber: string;
}

/** Perfil propio: quien atiende pacientes completa su título y colegiado. */
export function useProfile() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user, isLoading } = useSession();
  const { data: catalogs } = useUserCatalogsQuery();
  const { executeUpdateUser, isPending: isSaving } = useUpdateUserMutation();

  const titleOptions = (catalogs?.professionalTitles ?? Object.values(ProfessionalTitle)).map(
    (code) => ({
      value: code,
      label: t(TEXT.SETTINGS.USERS.TITLES[code]),
    }),
  );

  const schema = useMemo(
    () =>
      Yup.object({
        professionalTitle: Yup.string(),
        licenseNumber: Yup.string()
          .trim()
          .max(USER_LICENSE_NUMBER_MAX_LENGTH, t(ERRORS.LICENSE_MAX)),
      }),
    [t],
  );

  const initialValues: ProfileFormValues = {
    professionalTitle: user?.professionalTitle ?? '',
    licenseNumber: user?.licenseNumber ?? '',
  };

  /** El nombre como sale en los documentos: mismo formato y prefijo que el resumen del paciente. */
  const getPreviewName = (values: ProfileFormValues) =>
    formatProfessionalName({
      title: values.professionalTitle
        ? t(TEXT.SETTINGS.USERS.TITLES[values.professionalTitle])
        : null,
      fullName: user?.fullName ?? '',
      licenseNumber: values.licenseNumber,
      licensePrefix: t(TEXT.DOCUMENT_TEMPLATES.LICENSE_PREFIX),
    });

  const submit = (values: ProfileFormValues, helpers: FormikHelpers<ProfileFormValues>) => {
    if (!user) return;
    const licenseNumber = values.licenseNumber.trim();
    executeUpdateUser(
      {
        userUuid: user.uuid,
        changes: {
          ...(values.professionalTitle ? { professionalTitle: values.professionalTitle } : {}),
          ...(licenseNumber ? { licenseNumber } : {}),
        },
      },
      {
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: [SESSION_QUERY_KEY] });
          void queryClient.invalidateQueries({ queryKey: [FETCH_USERS_KEY] });
          toast.success(t(TEXT.PROFILE.SAVED));
        },
        onError: (error) => toast.error(error.message),
        onSettled: () => helpers.setSubmitting(false),
      },
    );
  };

  return {
    user,
    isLoading,
    attendsPatients: user?.attendsPatients ?? false,
    titleOptions,
    initialValues,
    schema,
    getPreviewName,
    isSaving,
    submit,
  };
}
