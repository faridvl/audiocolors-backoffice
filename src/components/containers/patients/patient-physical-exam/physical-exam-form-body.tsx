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
  isPending: boolean;
  isEmpty: boolean;
  /** Se llama al cambiar un texto, para borrar el aviso de otoscopia vacía. */
  onChange: () => void;
}

/** Campos y botones. Vive dentro del Formik para saber si hay texto sin guardar. */
export const PhysicalExamFormBody: React.FC<PhysicalExamFormBodyProps> = ({
  isPending,
  isEmpty,
  onChange,
}) => {
  const { t } = useTranslation();
  const { values, dirty, resetForm } = useFormikContext<OtoscopyFormValues>();
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
      <div className="flex items-center justify-end gap-3 border-t border-ink-100 pt-4">
        {dirty && (
          <Button
            type="button"
            variant={ButtonVariant.SECONDARY}
            onClick={() => resetForm()}
            disabled={isPending}
            className="shrink-0 whitespace-nowrap"
          >
            {t(TEXT.GENERAL.BUTTONS.CLEAR)}
          </Button>
        )}
        <Button
          type="submit"
          variant={ButtonVariant.PRIMARY}
          isLoading={isPending}
          disabled={isPending || !dirty}
          className="shrink-0 whitespace-nowrap"
        >
          {t(TEXT.PATIENTS.PHYSICAL_EXAM.SAVE)}
        </Button>
      </div>
    </Form>
  );
};
