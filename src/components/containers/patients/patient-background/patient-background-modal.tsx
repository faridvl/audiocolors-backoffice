import React from 'react';
import { Form, Formik } from 'formik';
import { ClipboardList } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { PatientBackground } from '@/types/patients/patient-background';
import { PatientBackgroundFields } from './patient-background-fields';
import { usePatientBackgroundForm } from './use-patient-background-form';

interface PatientBackgroundModalProps {
  patientUuid: string;
  background: PatientBackground | null;
  onClose: () => void;
}

export const PatientBackgroundModal: React.FC<PatientBackgroundModalProps> = ({
  patientUuid,
  background,
  onClose,
}) => {
  const { t } = useTranslation();
  const { initialValues, isPending, handleSubmit } = usePatientBackgroundForm(
    patientUuid,
    background,
    onClose,
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t(TEXT.PATIENTS.BACKGROUND.TITLE)}
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/70 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-card bg-white p-5 sm:rounded-card sm:p-6"
        style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10">
            <ClipboardList className="h-5 w-5 text-brand-700" aria-hidden />
          </span>
          <div className="min-w-0">
            <Typography variant={TypographyVariant.ACCENT}>
              {t(TEXT.PATIENTS.BACKGROUND.TITLE)}
            </Typography>
            <Typography variant={TypographyVariant.BODY} className="mt-1">
              {t(TEXT.PATIENTS.BACKGROUND.FORM_CAPTION)}
            </Typography>
          </div>
        </div>

        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          <Form className="mt-5 flex flex-col gap-6">
            <PatientBackgroundFields />

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant={ButtonVariant.SECONDARY}
                onClick={onClose}
                disabled={isPending}
              >
                {t(TEXT.GENERAL.BUTTONS.CANCEL)}
              </Button>
              <Button type="submit" variant={ButtonVariant.PRIMARY} isLoading={isPending}>
                {t(TEXT.GENERAL.BUTTONS.SAVE)}
              </Button>
            </div>
          </Form>
        </Formik>
      </div>
    </div>
  );
};
