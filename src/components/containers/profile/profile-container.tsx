import React from 'react';
import { Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { FormViewSection } from '@/components/common/form/form-view-section';
import { FormDirtyReporter } from '@/components/common/form/form-dirty-reporter';
import { FormField } from '@/components/common/input/input';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { USER_LICENSE_NUMBER_MAX_LENGTH } from '@/types/users/user';
import { useProfile } from './use-profile';

const TEXTS = TEXT.PROFILE;

const AccountField: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col">
      <Typography variant={TypographyVariant.HELPER}>{label}</Typography>
      <Typography variant={TypographyVariant.BODY} className="break-words">
        {value || t(TEXT.GENERAL.NOT_RECORDED)}
      </Typography>
    </div>
  );
};

export const ProfileContainer: React.FC = () => {
  const { t } = useTranslation();
  const profile = useProfile();
  const [isDirty, setIsDirty] = React.useState(false);
  const { user } = profile;

  if (profile.isLoading || !user) {
    return (
      <Typography variant={TypographyVariant.HELPER}>{t(TEXT.GENERAL.BUTTONS.LOADING)}</Typography>
    );
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-5">
      <Typography variant={TypographyVariant.HEADER}>{t(TEXTS.TITLE)}</Typography>

      <FormViewSection title={t(TEXTS.ACCOUNT)}>
        <div className="flex flex-col gap-3">
          <AccountField label={t(TEXT.SETTINGS.USERS.FORM.FULL_NAME)} value={user.fullName} />
          <AccountField label={t(TEXT.SETTINGS.USERS.FORM.EMAIL)} value={user.email} />
          <AccountField
            label={t(TEXT.SETTINGS.USERS.FORM.ROLE)}
            value={t(TEXT.SETTINGS.USERS.ROLES[user.role])}
          />
          {!profile.attendsPatients && (
            <Typography variant={TypographyVariant.HELPER}>{t(TEXTS.NOT_PROFESSIONAL)}</Typography>
          )}
        </div>
      </FormViewSection>

      {profile.attendsPatients && (
        <FormViewSection title={t(TEXTS.PROFESSIONAL)}>
          <Formik
            initialValues={profile.initialValues}
            validationSchema={profile.schema}
            onSubmit={profile.submit}
            enableReinitialize
          >
            <Form className="flex flex-col gap-4">
              <FormDirtyReporter onDirtyChange={setIsDirty} />
              <FormField name="professionalTitle" as="select" label={t(TEXTS.PROFESSIONAL_TITLE)}>
                <option value="">{t(TEXTS.TITLE_PLACEHOLDER)}</option>
                {profile.titleOptions.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </FormField>
              <FormField
                name="licenseNumber"
                label={t(TEXTS.LICENSE_NUMBER)}
                maxLength={USER_LICENSE_NUMBER_MAX_LENGTH}
                hint={t(TEXTS.LICENSE_HINT)}
                isHintAlwaysVisible
              />
              {profile.isLicenseMissing && (
                <Typography variant={TypographyVariant.HELPER} className="text-warning-700">
                  {t(TEXTS.LICENSE_MISSING)}
                </Typography>
              )}
              <div className="flex flex-col sm:flex-row sm:justify-end">
                <Button
                  type="submit"
                  variant={ButtonVariant.PRIMARY}
                  isLoading={profile.isSaving}
                  disabled={!isDirty}
                >
                  {t(TEXT.GENERAL.BUTTONS.SAVE)}
                </Button>
              </div>
            </Form>
          </Formik>
        </FormViewSection>
      )}
    </div>
  );
};
