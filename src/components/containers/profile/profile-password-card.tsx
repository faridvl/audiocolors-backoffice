import React from 'react';
import { Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { FIELD_LABEL_CLASSES, FormField } from '@/components/common/input/input';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { USER_PASSWORD_MAX_LENGTH } from '@/types/users/user';
import { SettingsCard } from '../settings/settings-card';
import { PROFILE_PASSWORD_INITIAL_VALUES, useProfilePassword } from './use-profile-password';

const TEXTS = TEXT.PROFILE.PASSWORD;

export const ProfilePasswordCard: React.FC = () => {
  const { t } = useTranslation();
  const { schema, submit, isSaving } = useProfilePassword();

  return (
    <Formik
      initialValues={PROFILE_PASSWORD_INITIAL_VALUES}
      validationSchema={schema}
      onSubmit={submit}
    >
      {({ dirty }) => (
        <Form className="w-full" noValidate>
          <SettingsCard>
            <Typography variant={TypographyVariant.SUBTITLE} className="mb-4">
              {t(TEXTS.TITLE)}
            </Typography>
            <div className="grid items-start gap-4 sm:grid-cols-[minmax(0,13rem)_minmax(0,14rem)]">
              <FormField
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                label={t(TEXTS.CURRENT)}
                labelClassName={FIELD_LABEL_CLASSES}
                maxLength={USER_PASSWORD_MAX_LENGTH}
                className="sm:col-span-2"
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
            </div>
            <div className="mt-4 flex justify-end border-t border-ink-100 pt-4">
              <Button
                type="submit"
                variant={ButtonVariant.PRIMARY}
                isLoading={isSaving}
                disabled={!dirty || isSaving}
                className="w-full sm:w-auto"
              >
                {t(TEXTS.SUBMIT)}
              </Button>
            </div>
          </SettingsCard>
        </Form>
      )}
    </Formik>
  );
};
