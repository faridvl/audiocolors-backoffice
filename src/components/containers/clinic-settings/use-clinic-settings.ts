import { useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { FormikHelpers } from 'formik';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/use-permissions';
import { SESSION_QUERY_KEY } from '@/hooks/use-session';
import { ApiError } from '@/shared/api/api-service-client';
import { useDeleteTenantLogoMutation } from '@/shared/api/mutations/tenant/delete-tenant-logo-mutation';
import { useUpdateTenantMutation } from '@/shared/api/mutations/tenant/update-tenant-mutation';
import { useUploadTenantLogoMutation } from '@/shared/api/mutations/tenant/upload-tenant-logo-mutation';
import { FETCH_TENANT_KEY, useTenantQuery } from '@/shared/api/querys/tenant-query';
import { Permission } from '@/shared/auth/permissions';
import { toPatientPhone } from '@/shared/utils/phone';
import { TEXT } from '@/static/texts/i18n';
import { Tenant, TENANT_LOGO_ACCEPTED_TYPES, TENANT_LOGO_MAX_BYTES } from '@/types/tenant/tenant';
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
  const { executeUploadTenantLogo, isPending: isUploadingLogo } = useUploadTenantLogoMutation();
  const { executeDeleteTenantLogo, isPending: isRemovingLogo } = useDeleteTenantLogoMutation();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [isConfirmingLogoRemoval, setIsConfirmingLogoRemoval] = useState(false);

  const validationSchema = useMemo(() => buildClinicFormSchema(t), [t]);
  const initialValues = useMemo(
    () => (tenant ? buildClinicFormInitialValues(tenant) : null),
    [tenant],
  );

  // El menú y los documentos leen la clínica de la sesión, no de esta consulta.
  const applyTenant = (updated: Tenant) => {
    queryClient.setQueryData([FETCH_TENANT_KEY], updated);
    void queryClient.invalidateQueries({ queryKey: [SESSION_QUERY_KEY] });
  };

  const openLogoPicker = () => {
    setLogoError(null);
    logoInputRef.current?.click();
  };

  const handleLogoSelected = (file: File | null) => {
    // Se limpia para poder elegir otra vez el mismo archivo después de un error.
    if (logoInputRef.current) logoInputRef.current.value = '';
    if (!file) return;

    if (!(TENANT_LOGO_ACCEPTED_TYPES as readonly string[]).includes(file.type)) {
      setLogoError(t(TEXT.SETTINGS.CLINIC.LOGO.ERROR_TYPE));
      return;
    }
    if (file.size > TENANT_LOGO_MAX_BYTES) {
      setLogoError(t(TEXT.SETTINGS.CLINIC.LOGO.ERROR_SIZE));
      return;
    }

    setLogoError(null);
    executeUploadTenantLogo(file, {
      onSuccess: (updated) => {
        applyTenant(updated);
        toast.success(t(TEXT.SETTINGS.CLINIC.LOGO.UPLOADED));
      },
      onError: (error: Error) => setLogoError(error.message),
    });
  };

  const requestLogoRemoval = () => {
    setLogoError(null);
    setIsConfirmingLogoRemoval(true);
  };
  const cancelLogoRemoval = () => setIsConfirmingLogoRemoval(false);

  const confirmLogoRemoval = () => {
    setIsConfirmingLogoRemoval(false);
    executeDeleteTenantLogo(undefined, {
      onSuccess: (updated) => {
        applyTenant(updated);
        toast.success(t(TEXT.SETTINGS.CLINIC.LOGO.REMOVED));
      },
      onError: (error: Error) => setLogoError(error.message),
    });
  };

  const handleSubmit = (values: ClinicFormValues, helpers: FormikHelpers<ClinicFormValues>) => {
    executeUpdateTenant(
      {
        name: values.name.trim(),
        phone: toPatientPhone(values.phone),
        email: values.email.trim(),
        address: values.address.trim(),
      },
      {
        onSuccess: (updated) => {
          applyTenant(updated);
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
    logo: {
      inputRef: logoInputRef,
      error: logoError,
      isBusy: isUploadingLogo || isRemovingLogo,
      isUploading: isUploadingLogo,
      isRemoving: isRemovingLogo,
      isConfirmingRemoval: isConfirmingLogoRemoval,
      openPicker: openLogoPicker,
      handleSelected: handleLogoSelected,
      requestRemoval: requestLogoRemoval,
      confirmRemoval: confirmLogoRemoval,
      cancelRemoval: cancelLogoRemoval,
    },
  };
}
