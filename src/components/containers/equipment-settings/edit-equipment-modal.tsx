import React, { useRef } from 'react';
import { Form, Formik } from 'formik';
import { Ear } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { FormField } from '@/components/common/input/input';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { useEscapeKey } from '@/hooks/use-escape-key';
import { useFocusTrap } from '@/hooks/use-focus-trap';
import { TEXT } from '@/static/texts/i18n';
import {
  CreateEquipmentPayload,
  EQUIPMENT_BRAND_MAX_LENGTH,
  EQUIPMENT_MODEL_MAX_LENGTH,
  Equipment,
  UpdateEquipmentPayload,
} from '@/types/equipment/equipment';
import {
  SETTINGS_FIELD_LABEL_HIDDEN,
  SettingsFieldRow,
  SettingsFieldWidth,
} from '../settings/settings-field-row';
import { EquipmentFormValues } from './equipment-form';
import { useEditEquipment } from './use-edit-equipment';
import { EquipmentSaveCallbacks } from './use-equipment-settings';

interface EditEquipmentModalProps {
  /** Sin equipo, la ventana crea uno nuevo. */
  equipment: Equipment | null;
  onCreate: (payload: CreateEquipmentPayload, callbacks: EquipmentSaveCallbacks) => void;
  onUpdate: (
    equipmentUuid: string,
    changes: UpdateEquipmentPayload,
    callbacks: EquipmentSaveCallbacks,
  ) => void;
  /** Mientras guarda, la ventana no se cierra con Escape ni con el fondo. */
  isSaving: boolean;
  onClose: () => void;
}

export const EditEquipmentModal: React.FC<EditEquipmentModalProps> = ({
  equipment,
  onCreate,
  onUpdate,
  isSaving,
  onClose,
}) => {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDivElement>(null);
  useEscapeKey(onClose, !isSaving);
  useFocusTrap(dialogRef);
  const handleBackdropClick = () => {
    if (!isSaving) onClose();
  };
  const { isNew, initialValues, validationSchema, handleSubmit } = useEditEquipment({
    equipment,
    onCreate,
    onUpdate,
    onClose,
  });
  const title = t(isNew ? TEXT.SETTINGS.EQUIPMENT.NEW_TITLE : TEXT.SETTINGS.EQUIPMENT.EDIT_TITLE);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      // En el celular sube desde abajo, como las demás ventanas.
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/70 sm:items-center sm:p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={dialogRef}
        className="flex max-h-[92dvh] w-full max-w-2xl flex-col rounded-t-card bg-white sm:rounded-card"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center gap-3 px-5 pt-5 sm:px-6 sm:pt-6">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10">
            <Ear className="h-5 w-5 text-brand-700" aria-hidden />
          </span>
          <Typography variant={TypographyVariant.ACCENT}>{title}</Typography>
        </div>

        <Formik<EquipmentFormValues>
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ dirty, isSubmitting }) => (
            <Form className="mt-5 flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 overflow-y-auto px-5 sm:px-6">
                <SettingsFieldRow
                  label={t(TEXT.SETTINGS.EQUIPMENT.BRAND)}
                  width={SettingsFieldWidth.LONG}
                  isRequired
                >
                  <FormField
                    name="brand"
                    label={t(TEXT.SETTINGS.EQUIPMENT.BRAND)}
                    labelClassName={SETTINGS_FIELD_LABEL_HIDDEN}
                    maxLength={EQUIPMENT_BRAND_MAX_LENGTH}
                    required
                  />
                </SettingsFieldRow>

                <SettingsFieldRow
                  label={t(TEXT.SETTINGS.EQUIPMENT.MODEL)}
                  width={SettingsFieldWidth.LONG}
                  isRequired
                >
                  <FormField
                    name="model"
                    label={t(TEXT.SETTINGS.EQUIPMENT.MODEL)}
                    labelClassName={SETTINGS_FIELD_LABEL_HIDDEN}
                    maxLength={EQUIPMENT_MODEL_MAX_LENGTH}
                    required
                  />
                </SettingsFieldRow>
              </div>

              <div
                className="flex shrink-0 flex-col-reverse gap-2 border-t border-ink-100 px-5 pt-3 sm:flex-row sm:justify-end sm:px-6"
                style={{
                  paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
                }}
              >
                <Button
                  type="button"
                  variant={ButtonVariant.SECONDARY}
                  onClick={onClose}
                  disabled={isSubmitting || isSaving}
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
