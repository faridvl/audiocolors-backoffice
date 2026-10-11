import React from 'react';
import { Form, Formik } from 'formik';
import { Loader2, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { patientContactsValidationSchema } from '@/components/containers/patients/patient-validation';
import { TEXT } from '@/static/texts/i18n';
import { Patient } from '@/types/patients/patient';
import { PatientContactsFields } from './patient-contacts-fields';
import { useEditContacts } from './use-edit-contacts';

interface EditContactsModalProps {
  patient: Patient;
  onClose: () => void;
}

export const EditContactsModal: React.FC<EditContactsModalProps> = ({ patient, onClose }) => {
  const { t } = useTranslation();
  const { initialValues, isLoading, isPending, errorMessage, patientFullName, handleSubmit } =
    useEditContacts(patient, onClose);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t(TEXT.PATIENTS.CONTACTS.TITLE)}
      // En el celular sube desde abajo y se desplaza solo, como el de próxima cita.
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/70 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-card bg-white p-5 sm:rounded-card sm:p-6"
        style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10">
            <Phone className="h-5 w-5 text-brand-700" aria-hidden />
          </span>
          <div className="min-w-0">
            <Typography variant={TypographyVariant.ACCENT}>
              {t(TEXT.PATIENTS.CONTACTS.TITLE)}
            </Typography>
            <Typography variant={TypographyVariant.BODY} className="mt-1">
              {t(TEXT.PATIENTS.CONTACTS.CAPTION)}
            </Typography>
          </div>
        </div>

        {isLoading || !initialValues ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-brand" aria-hidden />
          </div>
        ) : (
          <Formik
            initialValues={initialValues}
            validationSchema={patientContactsValidationSchema}
            onSubmit={handleSubmit}
          >
            <Form className="mt-5 flex flex-col gap-5">
              <PatientContactsFields patientFullName={patientFullName} />

              {errorMessage && (
                <Typography variant={TypographyVariant.ERROR}>{errorMessage}</Typography>
              )}

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
        )}
      </div>
    </div>
  );
};
