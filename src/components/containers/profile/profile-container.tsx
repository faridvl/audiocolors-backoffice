import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Form, Formik, useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { Badge, BadgeSize } from '@/components/common/badge/badge';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { FIELD_LABEL_CLASSES, FormField } from '@/components/common/input/input';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { UserAvatar, UserAvatarSize } from '@/components/common/user-avatar/user-avatar';
import { TEXT } from '@/static/texts/i18n';
import { tailwind } from '@/utils/tailwind-utils';
import { USER_LICENSE_NUMBER_MAX_LENGTH } from '@/types/users/user';
import { SettingsCard } from '../settings/settings-card';
import { SettingsSectionLoading } from '../settings/settings-section-state';
import { ProfileFormValues, useProfile } from './use-profile';

const TEXTS = TEXT.PROFILE;

interface ProfessionalFieldsProps {
  titleOptions: { value: string; label: string }[];
  getPreviewName: (values: ProfileFormValues) => string;
}

/** Va dentro del Formik: la vista previa sigue lo que se escribe, sin guardar. */
const ProfessionalFields: React.FC<ProfessionalFieldsProps> = ({
  titleOptions,
  getPreviewName,
}) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<ProfileFormValues>();
  const isLicenseMissing = !values.licenseNumber.trim();

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,13rem)_minmax(0,14rem)]">
        <FormField
          name="professionalTitle"
          as="select"
          label={t(TEXTS.PROFESSIONAL_TITLE)}
          labelClassName={FIELD_LABEL_CLASSES}
        >
          <option value="">{t(TEXTS.TITLE_PLACEHOLDER)}</option>
          {titleOptions.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </FormField>
        <FormField
          name="licenseNumber"
          label={t(TEXTS.LICENSE_NUMBER)}
          labelClassName={FIELD_LABEL_CLASSES}
          maxLength={USER_LICENSE_NUMBER_MAX_LENGTH}
        />
      </div>

      <div
        className={tailwind(
          'mt-4 flex flex-col gap-1 rounded-lg border p-4',
          isLicenseMissing ? 'border-warning-300 bg-warning-50' : 'border-ink-100 bg-ink-50',
        )}
      >
        <Typography variant={TypographyVariant.HELPER}>{t(TEXTS.PREVIEW_TITLE)}</Typography>
        <Typography
          variant={TypographyVariant.BODY_SEMIBOLD}
          className="break-words"
          id="profile-preview"
        >
          {getPreviewName(values)}
        </Typography>
        {isLicenseMissing && (
          <div role="status" className="flex items-start gap-2 text-warning-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning-700" aria-hidden />
            <Typography variant={TypographyVariant.HELPER} className="text-warning-800">
              {t(TEXTS.LICENSE_MISSING)}
            </Typography>
          </div>
        )}
      </div>
    </>
  );
};

export const ProfileContainer: React.FC = () => {
  const { t } = useTranslation();
  const profile = useProfile();
  const { user } = profile;

  if (profile.isLoading || !user) {
    return <SettingsSectionLoading message={t(TEXTS.LOADING)} />;
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
      <SettingsCard>
        <div className="flex items-center gap-4">
          <UserAvatar fullName={user.fullName} size={UserAvatarSize.LARGE} />
          <div className="flex min-w-0 flex-col items-start gap-1">
            <Typography variant={TypographyVariant.SUBTITLE} className="break-words">
              {user.fullName}
            </Typography>
            <Typography variant={TypographyVariant.HELPER} className="break-all sm:break-words">
              {user.email}
            </Typography>
            <Badge size={BadgeSize.REGULAR} className="mt-1">
              {t(TEXT.SETTINGS.USERS.ROLES[user.role])}
            </Badge>
          </div>
        </div>
        {!profile.attendsPatients && (
          <Typography variant={TypographyVariant.HELPER} className="mt-4">
            {t(TEXTS.NOT_PROFESSIONAL)}
          </Typography>
        )}
      </SettingsCard>

      {profile.attendsPatients && (
        <Formik
          initialValues={profile.initialValues}
          validationSchema={profile.schema}
          onSubmit={profile.submit}
          enableReinitialize
        >
          {({ dirty }) => (
            <Form className="w-full">
              <SettingsCard>
                <Typography variant={TypographyVariant.SUBTITLE} className="mb-4">
                  {t(TEXTS.PROFESSIONAL)}
                </Typography>
                <ProfessionalFields
                  titleOptions={profile.titleOptions}
                  getPreviewName={profile.getPreviewName}
                />
                <div className="mt-4 flex justify-end border-t border-ink-100 pt-4">
                  <Button
                    type="submit"
                    variant={ButtonVariant.PRIMARY}
                    isLoading={profile.isSaving}
                    disabled={!dirty}
                    className="w-full sm:w-auto"
                  >
                    {t(TEXT.GENERAL.BUTTONS.SAVE)}
                  </Button>
                </div>
              </SettingsCard>
            </Form>
          )}
        </Formik>
      )}
    </div>
  );
};
