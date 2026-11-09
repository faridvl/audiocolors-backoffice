import React, { useState } from 'react';
import { Form, Formik, useFormikContext } from 'formik';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { InfoPopover } from '@/components/common/info-popover/info-popover';
import { FocusFirstError } from '@/components/common/form/focus-first-error';
import { FormDirtyReporter } from '@/components/common/form/form-dirty-reporter';
import { FormMultiSelectField } from '@/components/common/form/form-multi-select-field';
import { FormField } from '@/components/common/input/input';
import { PhoneField } from '@/components/common/phone-field/phone-field';
import { Switch } from '@/components/common/switch/switch';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { UserRole } from '@/types/auth/auth';
import {
  USER_EMAIL_MAX_LENGTH,
  USER_FULL_NAME_MAX_LENGTH,
  USER_PASSWORD_MAX_LENGTH,
} from '@/types/users/user';
import { SettingsCard } from '../settings/settings-card';
import {
  SETTINGS_FIELD_LABEL_HIDDEN,
  SettingsFieldRow,
  SettingsFieldWidth,
} from '../settings/settings-field-row';
import { UserAuditList } from './user-audit-list';
import { UserFormValues } from './users-form';
import { isKnownRole, isLegacyRole } from './users-logic';
import { useUserEditor } from './use-user-editor';

const FORM = TEXT.SETTINGS.USERS.FORM;
const TEXTS = TEXT.SETTINGS.USERS;

interface UserEditorContainerProps {
  userUuid?: string;
}

const RoleLevels: React.FC<{ roles: UserRole[] }> = ({ roles }) => {
  const { t } = useTranslation();
  return (
    <InfoPopover ariaLabel={t(FORM.ROLE_LEVELS_TITLE)} className="-my-2.5">
      <Typography variant={TypographyVariant.BODY_SEMIBOLD} as="p" className="mb-2">
        {t(FORM.ROLE_LEVELS_TITLE)}
      </Typography>
      <dl className="flex flex-col gap-2">
        {roles.map((role) => (
          <div key={role} className="flex flex-col">
            <dt className="font-medium text-ink-700">{t(TEXTS.ROLES[role])}</dt>
            <dd className="text-ink-500">{t(TEXTS.ROLE_DESCRIPTIONS[role])}</dd>
          </div>
        ))}
      </dl>
    </InfoPopover>
  );
};

interface ClinicalAccessSectionProps {
  canEdit: boolean;
  isLicensePending: boolean;
  specialtyOptions: { value: string; label: string }[];
}

const ClinicalAccessSection: React.FC<ClinicalAccessSectionProps> = ({
  canEdit,
  isLicensePending,
  specialtyOptions,
}) => {
  const { t } = useTranslation();
  const { values, setFieldValue } = useFormikContext<UserFormValues>();
  const selectedLabels = specialtyOptions
    .filter(({ value }) => values.specialties.includes(value))
    .map(({ label }) => label);

  return (
    <>
      <SettingsFieldRow label={t(FORM.CLINICAL_ACCESS_TITLE)} width={SettingsFieldWidth.LONG}>
        {canEdit ? (
          <Switch
            isChecked={values.attendsPatients}
            onChange={(isChecked) => void setFieldValue('attendsPatients', isChecked)}
            label={t(FORM.ATTENDS_PATIENTS)}
            description={t(FORM.ATTENDS_DESCRIPTION)}
          />
        ) : (
          <div className="flex flex-col gap-1">
            <Typography variant={TypographyVariant.BODY}>
              {t(FORM.ATTENDS_PATIENTS)}:{' '}
              {t(values.attendsPatients ? TEXT.GENERAL.YES : TEXT.GENERAL.NO)}
            </Typography>
            {values.attendsPatients && (
              <Typography variant={TypographyVariant.BODY}>
                {t(FORM.SPECIALTIES)}:{' '}
                {selectedLabels.length > 0 ? selectedLabels.join(', ') : t(FORM.NO_SPECIALTIES)}
              </Typography>
            )}
            <Typography variant={TypographyVariant.HELPER}>{t(FORM.ATTENDS_OWNER_ONLY)}</Typography>
          </div>
        )}
        {isLicensePending && (
          <Typography variant={TypographyVariant.HELPER} className="text-warning-700">
            {t(FORM.LICENSE_PENDING)}
          </Typography>
        )}
      </SettingsFieldRow>

      {canEdit && values.attendsPatients && (
        <SettingsFieldRow label={t(FORM.SPECIALTIES)} isRequired>
          <FormMultiSelectField
            name="specialties"
            label={t(FORM.SPECIALTIES)}
            labelClassName={SETTINGS_FIELD_LABEL_HIDDEN}
            options={specialtyOptions}
            placeholder={t(FORM.SPECIALTIES_PLACEHOLDER)}
            required
            isSheetOnMobile
          />
        </SettingsFieldRow>
      )}
    </>
  );
};

/** Alta (sin `userUuid`) o ficha de edición de un usuario, a página completa. */
export const UserEditorContainer: React.FC<UserEditorContainerProps> = ({ userUuid }) => {
  const { t } = useTranslation();
  const editor = useUserEditor(userUuid);
  const [isDirty, setIsDirty] = useState(false);
  const { isNew, user } = editor;

  const backButton = (
    <Button
      variant={ButtonVariant.GHOST}
      onClick={editor.goBack}
      icon={<ArrowLeft className="h-4 w-4" aria-hidden />}
      className="w-fit px-0 hover:bg-transparent hover:text-ink-900"
    >
      {t(FORM.BACK)}
    </Button>
  );

  if (editor.isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {backButton}
        <Typography variant={TypographyVariant.HELPER}>
          {t(TEXT.GENERAL.BUTTONS.LOADING)}
        </Typography>
      </div>
    );
  }

  if (editor.isError || editor.isNotFound) {
    return (
      <div className="flex flex-col items-start gap-4">
        {backButton}
        <Typography variant={TypographyVariant.ERROR}>
          {t(editor.isError ? TEXTS.LOAD_ERROR : FORM.NOT_FOUND)}
        </Typography>
        {editor.isError && (
          <Button variant={ButtonVariant.SECONDARY} onClick={() => editor.refetch()}>
            {t(TEXT.GENERAL.BUTTONS.RETRY)}
          </Button>
        )}
      </div>
    );
  }

  const isLocked = editor.isReadOnly;
  const isRoleLocked = !editor.canChangeRole;
  const roleHint = isRoleLocked
    ? t(FORM.ROLE_SELF_HINT)
    : user && isLegacyRole(user.role)
      ? t(FORM.ROLE_LEGACY_HINT)
      : undefined;
  const isCreatingWithoutOwnerLevel = isNew && !editor.assignableRoles.includes(UserRole.OWNER);
  const isLicensePending = Boolean(user?.attendsPatients && !user.licenseNumber);

  return (
    <div className="flex w-full flex-col gap-5">
      {backButton}
      <Typography variant={TypographyVariant.HEADER} as="h1">
        {t(isNew ? FORM.NEW_TITLE : FORM.EDIT_TITLE)}
      </Typography>
      {isLocked && (
        <Typography variant={TypographyVariant.HELPER}>{t(FORM.OWNER_READ_ONLY)}</Typography>
      )}

      <Formik
        initialValues={editor.initialValues}
        validationSchema={editor.schema}
        onSubmit={editor.submit}
        enableReinitialize
      >
        <Form className="w-full">
          <FocusFirstError />
          <FormDirtyReporter onDirtyChange={setIsDirty} />
          <SettingsCard>
            <SettingsFieldRow label={t(FORM.FULL_NAME)} isRequired>
              <FormField
                name="fullName"
                label={t(FORM.FULL_NAME)}
                labelClassName={SETTINGS_FIELD_LABEL_HIDDEN}
                maxLength={USER_FULL_NAME_MAX_LENGTH}
                disabled={isLocked}
                required
              />
            </SettingsFieldRow>

            <SettingsFieldRow
              label={t(FORM.EMAIL)}
              hint={isNew ? undefined : t(FORM.EMAIL_READ_ONLY)}
              isRequired={isNew}
            >
              <FormField
                name="email"
                type="email"
                label={t(FORM.EMAIL)}
                labelClassName={SETTINGS_FIELD_LABEL_HIDDEN}
                maxLength={USER_EMAIL_MAX_LENGTH}
                disabled={!isNew}
                required={isNew}
              />
            </SettingsFieldRow>

            <SettingsFieldRow
              label={t(FORM.ROLE)}
              hint={roleHint}
              isRequired={isNew}
              labelAddon={<RoleLevels roles={editor.assignableRoles} />}
              width={SettingsFieldWidth.SHORT}
            >
              <FormField
                name="role"
                as="select"
                label={t(FORM.ROLE)}
                labelClassName={SETTINGS_FIELD_LABEL_HIDDEN}
                disabled={isLocked || isRoleLocked}
                required={isNew}
                displayValue={isRoleLocked && user?.role ? user.role : undefined}
              >
                {isRoleLocked && user?.role ? (
                  <option value={user.role}>
                    {isKnownRole(user.role) ? t(TEXTS.ROLES[user.role]) : t(TEXTS.LEGACY_ROLE)}
                  </option>
                ) : (
                  <option value="">{t(FORM.ROLE_PLACEHOLDER)}</option>
                )}
                {!isRoleLocked &&
                  editor.assignableRoles.map((role) => (
                    <option key={role} value={role}>
                      {t(TEXTS.ROLES[role])}
                    </option>
                  ))}
              </FormField>
              {isCreatingWithoutOwnerLevel && (
                <Typography variant={TypographyVariant.HELPER} className="mt-1.5">
                  {t(FORM.OWNER_CREATE_ONLY)}
                </Typography>
              )}
            </SettingsFieldRow>

            <SettingsFieldRow label={t(FORM.PHONE)} width={SettingsFieldWidth.SHORT}>
              <PhoneField
                name="phone"
                label={t(FORM.PHONE)}
                labelClassName={SETTINGS_FIELD_LABEL_HIDDEN}
                disabled={isLocked}
              />
            </SettingsFieldRow>

            {isNew && (
              <SettingsFieldRow label={t(FORM.PASSWORD)} hint={t(FORM.PASSWORD_HINT)} isRequired>
                <FormField
                  name="password"
                  type="password"
                  label={t(FORM.PASSWORD)}
                  labelClassName={SETTINGS_FIELD_LABEL_HIDDEN}
                  maxLength={USER_PASSWORD_MAX_LENGTH}
                  required
                />
              </SettingsFieldRow>
            )}

            {(!isNew || editor.canEditClinicalAccess) && (
              <ClinicalAccessSection
                canEdit={editor.canEditClinicalAccess && !isLocked}
                isLicensePending={isLicensePending}
                specialtyOptions={editor.specialtyOptions}
              />
            )}

            {!isLocked && (
              <div className="flex flex-col-reverse gap-2 border-t border-ink-100 pt-4 sm:flex-row sm:justify-end">
                <Button
                  variant={ButtonVariant.SECONDARY}
                  onClick={editor.goBack}
                  disabled={editor.isSaving}
                  className="w-full sm:w-auto"
                >
                  {t(TEXT.GENERAL.BUTTONS.CANCEL)}
                </Button>
                <Button
                  type="submit"
                  variant={ButtonVariant.PRIMARY}
                  isLoading={editor.isSaving}
                  disabled={!isNew && !isDirty}
                  className="w-full sm:w-auto"
                >
                  {t(isNew ? FORM.CREATE : TEXT.GENERAL.BUTTONS.SAVE)}
                </Button>
              </div>
            )}
          </SettingsCard>
        </Form>
      </Formik>

      {user && <UserAuditList targetUuid={user.uuid} />}
    </div>
  );
};
