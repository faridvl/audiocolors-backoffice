import React, { useEffect, useLayoutEffect } from 'react';
import { Form, useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { FormField } from '@/components/common/input/input';
import { useUnsavedChangesGuard } from '@/hooks/use-unsaved-changes-guard';
import { TEXT } from '@/static/texts/i18n';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { OTOSCOPY_TEXT_MAX_LENGTH } from '@/types/patients/otoscopy-entry';
import { OtoscopyFormValues } from './use-otoscopy-entry-form';

/** Alto del cuadro: dos líneas como mínimo y unas diez antes de que aparezca el scroll. */
const TEXTAREA_MIN_HEIGHT_PX = 68;
const TEXTAREA_MAX_HEIGHT_PX = 268;

const FIELD_IDS: (keyof OtoscopyFormValues)[] = ['otoscopyRight', 'otoscopyLeft'];

/** Anillo de foco un tono más visible, solo en estos cuadros. */
const FOCUS_RING_CLASS = '[&_textarea:focus]:ring-brand/40';

interface PhysicalExamFormBodyProps {
  isEditing: boolean;
  isPending: boolean;
  isEmpty: boolean;
  /** Mensaje del API cuando la otoscopia ya no se puede corregir. */
  staleMessage: string | null;
  /** Se llama al cambiar un texto, para borrar el aviso de otoscopia vacía. */
  onChange: () => void;
  onSaveAsNew: (values: OtoscopyFormValues) => void;
  onCancel: () => void;
}

/** Campos y botones de la edición. Vive dentro del Formik para saber si hay cambios sin guardar. */
export const PhysicalExamFormBody: React.FC<PhysicalExamFormBodyProps> = ({
  isEditing,
  isPending,
  isEmpty,
  staleMessage,
  onChange,
  onSaveAsNew,
  onCancel,
}) => {
  const { t } = useTranslation();
  const { values, dirty } = useFormikContext<OtoscopyFormValues>();
  useUnsavedChangesGuard(dirty);

  // El cuadro crece con el texto: FormField no expone `rows` ni `ref`, se ajusta por su id.
  useLayoutEffect(() => {
    FIELD_IDS.forEach((id) => {
      const element = document.getElementById(id);
      if (!(element instanceof HTMLTextAreaElement)) return;
      element.style.minHeight = `${TEXTAREA_MIN_HEIGHT_PX}px`;
      element.style.height = 'auto';
      element.style.height = `${Math.min(element.scrollHeight, TEXTAREA_MAX_HEIGHT_PX)}px`;
      element.style.overflowY = element.scrollHeight > TEXTAREA_MAX_HEIGHT_PX ? 'auto' : 'hidden';
    });
  }, [values.otoscopyRight, values.otoscopyLeft]);

  useEffect(() => {
    onChange();
  }, [values, onChange]);

  // Al entrar a editar, el cursor queda al final del primer cuadro.
  useEffect(() => {
    const element = document.getElementById(FIELD_IDS[0]);
    if (!(element instanceof HTMLTextAreaElement)) return;
    element.focus();
    element.setSelectionRange(element.value.length, element.value.length);
  }, []);

  const handleCancel = () => {
    if (dirty && !window.confirm(t(TEXT.GENERAL.UNSAVED_CHANGES))) return;
    onCancel();
  };

  return (
    <Form className="flex flex-col gap-4">
      <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-2">
        <FormField
          as="textarea"
          name="otoscopyRight"
          label={t(TEXT.PATIENTS.BACKGROUND.RIGHT_EAR)}
          maxLength={OTOSCOPY_TEXT_MAX_LENGTH}
          showCount
          className={FOCUS_RING_CLASS}
        />
        <FormField
          as="textarea"
          name="otoscopyLeft"
          label={t(TEXT.PATIENTS.BACKGROUND.LEFT_EAR)}
          maxLength={OTOSCOPY_TEXT_MAX_LENGTH}
          showCount
          className={FOCUS_RING_CLASS}
        />
      </div>
      {isEmpty && (
        <div role="alert">
          <Typography variant={TypographyVariant.ERROR}>
            {t(TEXT.PATIENTS.PHYSICAL_EXAM.EMPTY_ERROR)}
          </Typography>
        </div>
      )}
      {staleMessage && (
        <div role="alert" className="flex flex-col gap-1">
          <Typography variant={TypographyVariant.ERROR}>{staleMessage}</Typography>
          <Typography variant={TypographyVariant.HELPER}>
            {t(TEXT.QUESTIONS.ENTRY_STALE_HINT)}
          </Typography>
        </div>
      )}
      <div className="flex flex-col gap-3 border-t border-ink-100 pt-4 xl:flex-row xl:items-center xl:justify-end">
        {!staleMessage && (
          <Typography
            variant={TypographyVariant.HELPER}
            className="min-w-0 xl:flex-1 xl:text-right"
          >
            {t(TEXT.QUESTIONS.ENTRY_HINT)}
          </Typography>
        )}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant={ButtonVariant.SECONDARY}
            onClick={handleCancel}
            disabled={isPending}
            className="shrink-0 whitespace-nowrap"
          >
            {t(TEXT.GENERAL.BUTTONS.CANCEL)}
          </Button>
          {staleMessage ? (
            <Button
              type="button"
              variant={ButtonVariant.PRIMARY}
              isLoading={isPending}
              disabled={isPending}
              onClick={() => onSaveAsNew(values)}
              className="min-w-0"
            >
              {t(TEXT.QUESTIONS.ENTRY_SAVE_AS_NEW)}
            </Button>
          ) : (
            <Button
              type="submit"
              variant={ButtonVariant.PRIMARY}
              isLoading={isPending}
              disabled={isPending || !dirty}
              className="shrink-0 whitespace-nowrap"
            >
              {t(isEditing ? TEXT.QUESTIONS.ENTRY_EDIT_SAVE : TEXT.PATIENTS.PHYSICAL_EXAM.SAVE)}
            </Button>
          )}
        </div>
      </div>
    </Form>
  );
};
