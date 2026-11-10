import React from 'react';
import { Form, Formik } from 'formik';
import { MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { FormField } from '@/components/common/input/input';
import { PhoneField } from '@/components/common/phone-field/phone-field';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { useEscapeKey } from '@/hooks/use-escape-key';
import { TEXT } from '@/static/texts/i18n';
import {
  BRANCH_ADDRESS_MAX_LENGTH,
  BRANCH_NAME_MAX_LENGTH,
  Branch,
  BranchColor,
  CreateBranchPayload,
  UpdateBranchPayload,
} from '@/types/branches/branch';
import {
  SETTINGS_FIELD_LABEL_HIDDEN,
  SettingsFieldRow,
  SettingsFieldWidth,
} from '../settings/settings-field-row';
import { BranchColorPicker } from './branch-color-picker';
import { BranchFormValues } from './branch-form';
import { BranchSaveCallbacks } from './use-branches-settings';
import { useEditBranch } from './use-edit-branch';

interface EditBranchModalProps {
  /** Sin sede, la ventana crea una nueva. */
  branch: Branch | null;
  defaultColor: BranchColor;
  onCreate: (payload: CreateBranchPayload, callbacks: BranchSaveCallbacks) => void;
  onUpdate: (
    branchUuid: string,
    changes: UpdateBranchPayload,
    callbacks: BranchSaveCallbacks,
  ) => void;
  onClose: () => void;
}

export const EditBranchModal: React.FC<EditBranchModalProps> = ({
  branch,
  defaultColor,
  onCreate,
  onUpdate,
  onClose,
}) => {
  const { t } = useTranslation();
  useEscapeKey(onClose);
  const { isNew, initialValues, validationSchema, handleSubmit } = useEditBranch({
    branch,
    defaultColor,
    onCreate,
    onUpdate,
    onClose,
  });
  const title = t(isNew ? TEXT.SETTINGS.BRANCHES.NEW_TITLE : TEXT.SETTINGS.BRANCHES.EDIT_TITLE);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      // En el celular sube desde abajo, como las demás ventanas.
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/70 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-card bg-white p-5 sm:rounded-card sm:p-6"
        style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10">
            <MapPin className="h-5 w-5 text-brand-700" aria-hidden />
          </span>
          <Typography variant={TypographyVariant.ACCENT}>{title}</Typography>
        </div>

        <Formik<BranchFormValues>
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ dirty, isSubmitting, values, setFieldValue }) => (
            <Form className="mt-5">
              <SettingsFieldRow label={t(TEXT.SETTINGS.BRANCHES.NAME)} isRequired>
                <FormField
                  name="name"
                  label={t(TEXT.SETTINGS.BRANCHES.NAME)}
                  labelClassName={SETTINGS_FIELD_LABEL_HIDDEN}
                  maxLength={BRANCH_NAME_MAX_LENGTH}
                  required
                />
              </SettingsFieldRow>

              <SettingsFieldRow
                label={t(TEXT.SETTINGS.BRANCHES.PHONE)}
                width={SettingsFieldWidth.SHORT}
              >
                <PhoneField
                  name="phone"
                  label={t(TEXT.SETTINGS.BRANCHES.PHONE)}
                  labelClassName={SETTINGS_FIELD_LABEL_HIDDEN}
                />
              </SettingsFieldRow>

              <SettingsFieldRow
                label={t(TEXT.SETTINGS.BRANCHES.ADDRESS)}
                width={SettingsFieldWidth.LONG}
              >
                <FormField
                  name="address"
                  as="textarea"
                  label={t(TEXT.SETTINGS.BRANCHES.ADDRESS)}
                  labelClassName={SETTINGS_FIELD_LABEL_HIDDEN}
                  maxLength={BRANCH_ADDRESS_MAX_LENGTH}
                  showCount
                />
              </SettingsFieldRow>

              <SettingsFieldRow
                label={t(TEXT.SETTINGS.BRANCHES.COLOR)}
                hint={t(TEXT.SETTINGS.BRANCHES.COLOR_HINT)}
              >
                <BranchColorPicker
                  label={t(TEXT.SETTINGS.BRANCHES.COLOR)}
                  value={values.color}
                  onChange={(color) => void setFieldValue('color', color)}
                />
              </SettingsFieldRow>

              <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant={ButtonVariant.SECONDARY}
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  {t(TEXT.GENERAL.BUTTONS.CANCEL)}
                </Button>
                <Button
                  type="submit"
                  variant={ButtonVariant.PRIMARY}
                  disabled={!isNew && !dirty}
                  isLoading={isSubmitting}
                >
                  {t(TEXT.GENERAL.BUTTONS.SAVE)}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};
