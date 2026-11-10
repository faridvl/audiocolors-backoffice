import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { SettingsCard } from '../settings/settings-card';
import { ProfilePasswordModal } from './profile-password-modal';
import { useProfilePassword } from './use-profile-password';

const TEXTS = TEXT.PROFILE.PASSWORD;

export const ProfilePasswordCard: React.FC = () => {
  const { t } = useTranslation();
  const { schema, submit, isSaving, isModalOpen, openModal, closeModal } = useProfilePassword();

  return (
    <>
      <SettingsCard>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <Typography variant={TypographyVariant.SUBTITLE}>{t(TEXTS.TITLE)}</Typography>
            <Typography variant={TypographyVariant.HELPER}>{t(TEXTS.DESCRIPTION)}</Typography>
          </div>
          <Button
            variant={ButtonVariant.SECONDARY}
            onClick={openModal}
            className="w-full sm:w-auto"
          >
            {t(TEXTS.SUBMIT)}
          </Button>
        </div>
      </SettingsCard>
      {isModalOpen && (
        <ProfilePasswordModal
          validationSchema={schema}
          isSaving={isSaving}
          onSubmit={submit}
          onClose={closeModal}
        />
      )}
    </>
  );
};
