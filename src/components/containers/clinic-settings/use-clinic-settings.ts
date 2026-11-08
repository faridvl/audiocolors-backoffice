import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { FormikHelpers } from 'formik';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/use-permissions';
import { ApiError } from '@/shared/api/api-service-client';
import { useUpdateTenantMutation } from '@/shared/api/mutations/tenant/update-tenant-mutation';
import { FETCH_TENANT_KEY, useTenantQuery } from '@/shared/api/querys/tenant-query';
import { Permission } from '@/shared/auth/permissions';
import { toPatientPhone } from '@/shared/utils/phone';
import { TEXT } from '@/static/texts/i18n';
import {
  buildClinicFormInitialValues,
  buildClinicFormSchema,
  ClinicFormValues,
  isClinicFormField,
} from './clinic-form';

export function useClinicSettings() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { can } = usePermissions();
  const { data: tenant, isLoading, isError, refetch } = useTenantQuery();
  const { executeUpdateTenant, isPending } = useUpdateTenantMutation();

  const validationSchema = useMemo(() => buildClinicFormSchema(t), [t]);
  const initialValues = useMemo(
    () => (tenant ? buildClinicFormInitialValues(tenant) : null),
    [tenant],
  );

  const handleSubmit = (values: ClinicFormValues, helpers: FormikHelpers<ClinicFormValues>) => {
    executeUpdateTenant(
      {
        phone: toPatientPhone(values.phone),
        email: values.email.trim(),
        address: values.address.trim(),
      },
      {
        onSuccess: (updated) => {
          queryClient.setQueryData([FETCH_TENANT_KEY], updated);
          toast.success(t(TEXT.SETTINGS.CLINIC.SAVED));
        },
        onError: (error: Error) => {
          const details = error instanceof ApiError ? error.details : [];
          const fieldErrors = details.filter((detail) => isClinicFormField(detail.field));
          // Un 400 con detalle por campo se muestra junto al campo; el resto, como aviso.
          if (fieldErrors.length === 0) {
            toast.error(error.message);
            return;
          }
          fieldErrors.forEach(({ field, message }) => {
            if (isClinicFormField(field)) helpers.setFieldError(field, message);
          });
        },
        onSettled: () => helpers.setSubmitting(false),
      },
    );
  };

  return {
    tenant,
    initialValues,
    validationSchema,
    isLoading,
    isError,
    refetch,
    isSaving: isPending,
    canEdit: can(Permission.EDIT_CLINIC),
    handleSubmit,
  };
}
