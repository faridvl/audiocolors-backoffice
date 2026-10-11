import React from 'react';
import { FieldArray, useFormikContext } from 'formik';
import { Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FormField } from '@/components/common/input/input';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import {
  formatPhone,
  PatientContactFormValues,
} from '@/components/containers/patients/patient-validation';
import { PatientNameFillButton } from './patient-name-fill-button';

const CONTACT_NAME_MAX_LENGTH = 80;

interface PatientContactsFieldsProps {
  /** Nombre que propone el botón para marcar que el teléfono es del paciente. */
  patientFullName: string;
}

/** Lista editable de contactos; el primero es el principal. Va dentro de un Formik con `contacts`. */
export const PatientContactsFields: React.FC<PatientContactsFieldsProps> = ({
  patientFullName,
}) => {
  const { t } = useTranslation();
  const { values, setFieldValue } = useFormikContext<{ contacts: PatientContactFormValues[] }>();

  return (
    <FieldArray name="contacts">
      {({ push, remove }) => {
        const lastContact = values.contacts[values.contacts.length - 1];
        const canAddAnother = !lastContact || !!lastContact.phone.trim();

        return (
          <div className="flex flex-col gap-3">
            {values.contacts.map((contact, index) => (
              <div key={contact.uuid ?? index} className="flex items-start gap-2">
                <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start">
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <FormField
                      name={`contacts.${index}.name`}
                      label={
                        index === 0
                          ? t(TEXT.PATIENTS.CONTACTS.PRIMARY)
                          : t(TEXT.PATIENTS.CONTACTS.CONTACT)
                      }
                      hint={t(TEXT.PATIENTS.CONTACTS.NAME_HINT)}
                      maxLength={CONTACT_NAME_MAX_LENGTH}
                      endAdornment={
                        <PatientNameFillButton
                          disabled={!patientFullName}
                          onClick={() =>
                            setFieldValue(
                              `contacts.${index}.name`,
                              patientFullName.slice(0, CONTACT_NAME_MAX_LENGTH),
                            )
                          }
                        />
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <FormField
                      name={`contacts.${index}.phone`}
                      label={t(TEXT.PATIENTS.CONTACTS.PHONE)}
                      hint={t(TEXT.PATIENTS.CONTACTS.PHONE_HINT)}
                      inputMode="tel"
                      required
                      onChange={(event) =>
                        setFieldValue(`contacts.${index}.phone`, formatPhone(event.target.value))
                      }
                      className="sm:w-40"
                    />
                  </div>
                </div>
                {values.contacts.length > 1 && (
                  // Mismo alto de etiqueta que los campos, para quedar a la par del input.
                  <div className="flex shrink-0 flex-col gap-1.5">
                    <Typography variant={TypographyVariant.BODY} className="invisible" aria-hidden>
                      &nbsp;
                    </Typography>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      aria-label={t(TEXT.PATIENTS.CONTACTS.REMOVE)}
                      className="flex h-[46px] w-10 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-danger/10 hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {canAddAnother && (
              <button
                type="button"
                onClick={() => push({ name: '', phone: '' })}
                className="flex w-fit items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden />
                {t(TEXT.PATIENTS.CONTACTS.ADD)}
              </button>
            )}
          </div>
        );
      }}
    </FieldArray>
  );
};
