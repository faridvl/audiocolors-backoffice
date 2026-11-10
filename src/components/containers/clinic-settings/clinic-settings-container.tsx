import React from 'react';
import { Form, Formik } from 'formik';
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
import { SettingsCard } from '../settings/settings-card';
import {
  SETTINGS_FIELD_LABEL_HIDDEN,
  SettingsFieldRow,
  SettingsFieldWidth,
} from '../settings/settings-field-row';
import { SettingsSectionError, SettingsSectionLoading } from '../settings/settings-section-state';
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
    return <SettingsSectionLoading message={t(TEXT.SETTINGS.CLINIC.LOADING)} />;
  }

  if (isError || !tenant || !initialValues) {
    return (
      <SettingsSectionError
        message={t(TEXT.SETTINGS.CLINIC.LOAD_ERROR)}
        onRetry={() => refetch()}
      />
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
        <Form className="w-full">
          <SettingsCard>
            <SettingsFieldRow
              label={t(TEXT.SETTINGS.CLINIC.NAME)}
              hint={t(TEXT.SETTINGS.CLINIC.NAME_HINT)}
            >
              <FormField
                name="name"
                label={t(TEXT.SETTINGS.CLINIC.NAME)}
                labelClassName={SETTINGS_FIELD_LABEL_HIDDEN}
                maxLength={TENANT_NAME_MAX_LENGTH}
                disabled={!canEdit}
              />
            </SettingsFieldRow>

            <ClinicLogoField
              logoUrl={tenant.logoUrl}
              clinicName={tenant.businessName}
              canEdit={canEdit}
              logo={logo}
            />

            <SettingsFieldRow
              label={t(TEXT.SETTINGS.CLINIC.PHONE)}
              width={SettingsFieldWidth.SHORT}
            >
              <PhoneField
                name="phone"
                label={t(TEXT.SETTINGS.CLINIC.PHONE)}
                labelClassName={SETTINGS_FIELD_LABEL_HIDDEN}
                disabled={!canEdit}
              />
            </SettingsFieldRow>

            <SettingsFieldRow label={t(TEXT.SETTINGS.CLINIC.EMAIL)}>
              <FormField
                name="email"
                type="email"
                label={t(TEXT.SETTINGS.CLINIC.EMAIL)}
                labelClassName={SETTINGS_FIELD_LABEL_HIDDEN}
                placeholder={t(TEXT.SETTINGS.CLINIC.EMAIL_PLACEHOLDER)}
                maxLength={TENANT_EMAIL_MAX_LENGTH}
                disabled={!canEdit}
              />
            </SettingsFieldRow>

            <SettingsFieldRow
              label={t(TEXT.SETTINGS.CLINIC.ADDRESS)}
              hint={t(TEXT.SETTINGS.CLINIC.ADDRESS_HINT)}
              width={SettingsFieldWidth.LONG}
            >
              <FormField
                name="address"
                as="textarea"
                label={t(TEXT.SETTINGS.CLINIC.ADDRESS)}
                labelClassName={SETTINGS_FIELD_LABEL_HIDDEN}
                maxLength={TENANT_ADDRESS_MAX_LENGTH}
                showCount
                disabled={!canEdit}
              />
            </SettingsFieldRow>

            <div className="flex justify-end border-t border-ink-100 pt-4">
              {canEdit ? (
                <Button
                  type="submit"
                  variant={ButtonVariant.PRIMARY}
                  isLoading={isSaving}
                  disabled={!dirty}
                  className="w-full sm:w-auto"
                >
                  {t(TEXT.GENERAL.BUTTONS.SAVE)}
                </Button>
              ) : (
                <Typography variant={TypographyVariant.HELPER}>
                  {t(TEXT.SETTINGS.CLINIC.READ_ONLY)}
                </Typography>
              )}
            </div>
          </SettingsCard>
        </Form>
      )}
    </Formik>
  );
};
