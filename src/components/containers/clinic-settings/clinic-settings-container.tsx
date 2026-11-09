import React from 'react';
import { Form, Formik } from 'formik';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { FormField } from '@/components/common/input/input';
import { PhoneField } from '@/components/common/phone-field/phone-field';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import {
  TENANT_ADDRESS_MAX_LENGTH,
  TENANT_EMAIL_MAX_LENGTH,
  TENANT_NAME_MAX_LENGTH,
} from '@/types/tenant/tenant';
import { ClinicFormValues } from './clinic-form';
import { ClinicLogoField } from './clinic-logo-field';
import { useClinicSettings } from './use-clinic-settings';

export const ClinicSettingsContainer: React.FC = () => {
  const { t } = useTranslation();
  const {
    tenant,
    initialValues,
    validationSchema,
    isLoading,
    isError,
    refetch,
    isSaving,
    canEdit,
    handleSubmit,
    logo,
  } = useClinicSettings();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-12">
        <Loader2 className="h-5 w-5 animate-spin text-brand" aria-hidden />
        <Typography variant={TypographyVariant.BODY}>{t(TEXT.SETTINGS.CLINIC.LOADING)}</Typography>
      </div>
    );
  }

  if (isError || !tenant || !initialValues) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center">
        <AlertTriangle className="h-8 w-8 text-danger" aria-hidden />
        <Typography variant={TypographyVariant.ACCENT}>
          {t(TEXT.SETTINGS.CLINIC.LOAD_ERROR)}
        </Typography>
        <Button variant={ButtonVariant.SECONDARY} onClick={() => refetch()} className="mt-2">
          {t(TEXT.GENERAL.BUTTONS.RETRY)}
        </Button>
      </div>
    );
  }

  return (
    <Formik<ClinicFormValues>
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={handleSubmit}
    >
      {({ dirty }) => (
        <Form className="flex w-full flex-col gap-4 rounded-lg border border-ink-200 bg-white p-4 sm:p-5">
          <FormField
            name="name"
            label={t(TEXT.SETTINGS.CLINIC.NAME)}
            hint={t(TEXT.SETTINGS.CLINIC.NAME_HINT)}
            maxLength={TENANT_NAME_MAX_LENGTH}
            disabled={!canEdit}
            className="sm:max-w-sm"
          />
          <ClinicLogoField
            logoUrl={tenant.logoUrl}
            clinicName={tenant.businessName}
            canEdit={canEdit}
            logo={logo}
          />

          <PhoneField
            name="phone"
            label={t(TEXT.SETTINGS.CLINIC.PHONE)}
            disabled={!canEdit}
            className="sm:max-w-sm"
          />
          <FormField
            name="email"
            type="email"
            label={t(TEXT.SETTINGS.CLINIC.EMAIL)}
            placeholder={t(TEXT.SETTINGS.CLINIC.EMAIL_PLACEHOLDER)}
            maxLength={TENANT_EMAIL_MAX_LENGTH}
            disabled={!canEdit}
            className="sm:max-w-sm"
          />
          <FormField
            name="address"
            as="textarea"
            label={t(TEXT.SETTINGS.CLINIC.ADDRESS)}
            hint={t(TEXT.SETTINGS.CLINIC.ADDRESS_HINT)}
            maxLength={TENANT_ADDRESS_MAX_LENGTH}
            showCount
            disabled={!canEdit}
          />

          {canEdit ? (
            <Button
              type="submit"
              variant={ButtonVariant.PRIMARY}
              isLoading={isSaving}
              disabled={!dirty}
              className="w-full sm:w-auto sm:self-end"
            >
              {t(TEXT.GENERAL.BUTTONS.SAVE)}
            </Button>
          ) : (
            <Typography variant={TypographyVariant.HELPER}>
              {t(TEXT.SETTINGS.CLINIC.READ_ONLY)}
            </Typography>
          )}
        </Form>
      )}
    </Formik>
  );
};
