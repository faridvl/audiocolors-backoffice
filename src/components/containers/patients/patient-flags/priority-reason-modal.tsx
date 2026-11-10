import React, { useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Form, Formik } from 'formik';
import { Flag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { FormField } from '@/components/common/input/input';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { useEscapeKey } from '@/hooks/use-escape-key';
import { useFocusTrap } from '@/hooks/use-focus-trap';
import { TEXT } from '@/static/texts/i18n';
import { PATIENT_PRIORITY_REASON_MAX_LENGTH } from '@/types/patients/patient';

interface PriorityReasonModalProps {
  /** Se muestra bajo el título para no marcar al paciente equivocado. */
  patientName: string;
  /** Mientras guarda, la ventana no se cierra con Escape ni con el fondo. */
  isSaving: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

interface PriorityReasonValues {
  reason: string;
}

const INITIAL_VALUES: PriorityReasonValues = { reason: '' };

/** Pide el motivo antes de marcar la prioridad; cancelar deja al paciente como estaba. */
export const PriorityReasonModal: React.FC<PriorityReasonModalProps> = ({
  patientName,
  isSaving,
  onConfirm,
  onClose,
}) => {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDivElement>(null);
  useEscapeKey(onClose, !isSaving);
  useFocusTrap(dialogRef);
  const validationSchema = useMemo(
    () =>
      Yup.object({
        reason: Yup.string()
          .trim()
          .required(t(TEXT.PATIENTS.FLAGS.PRIORITY.REASON_REQUIRED))
          .max(PATIENT_PRIORITY_REASON_MAX_LENGTH, t(TEXT.PATIENTS.FLAGS.PRIORITY.REASON_TOO_LONG)),
      }),
    [t],
  );
  const title = t(TEXT.PATIENTS.FLAGS.PRIORITY.REASON_TITLE);

  // Va al body: la lista la monta dentro de una fila clicable y un portal evita sus estilos y eventos.
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/70 sm:items-center sm:p-4"
      onClick={(event) => {
        event.stopPropagation();
        if (!isSaving) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="flex max-h-[92dvh] w-full max-w-md flex-col rounded-t-card bg-white sm:rounded-card"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center gap-3 px-5 pt-5 sm:px-6 sm:pt-6">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger/10">
            <Flag className="h-5 w-5 text-danger" aria-hidden />
          </span>
          <div className="min-w-0">
            <Typography variant={TypographyVariant.ACCENT}>{title}</Typography>
            <Typography variant={TypographyVariant.HELPER} className="break-words">
              {patientName}
            </Typography>
          </div>
        </div>

        <Formik<PriorityReasonValues>
          initialValues={INITIAL_VALUES}
          validationSchema={validationSchema}
          onSubmit={(values) => onConfirm(values.reason.trim())}
        >
          <Form className="mt-4 flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto px-5 sm:px-6">
              <FormField
                name="reason"
                as="textarea"
                label={t(TEXT.PATIENTS.FLAGS.PRIORITY.REASON_LABEL)}
                hint={t(TEXT.PATIENTS.FLAGS.PRIORITY.REASON_HINT)}
                maxLength={PATIENT_PRIORITY_REASON_MAX_LENGTH}
                showCount
                required
              />
            </div>
            <div
              className="mt-4 flex shrink-0 flex-col-reverse gap-2 border-t border-ink-100 px-5 pt-3 sm:flex-row sm:justify-end sm:px-6"
              style={{
                paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
              }}
            >
              <Button
                type="button"
                variant={ButtonVariant.SECONDARY}
                onClick={onClose}
                disabled={isSaving}
              >
                {t(TEXT.GENERAL.BUTTONS.CANCEL)}
              </Button>
              <Button type="submit" variant={ButtonVariant.PRIMARY} isLoading={isSaving}>
                {t(TEXT.PATIENTS.FLAGS.PRIORITY.REASON_CONFIRM)}
              </Button>
            </div>
          </Form>
        </Formik>
      </div>
    </div>,
    document.body,
  );
};
