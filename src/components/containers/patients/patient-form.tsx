import React from 'react';
import { Form, useFormikContext, FieldArray } from 'formik';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { FormField } from '@/components/common/input/input';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { FormSelectField } from '@/components/common/form/form-select-field';
import { FormViewSection } from '@/components/common/form/form-view-section';
import {
  PatientNameFillButton,
  buildPatientFullName,
} from '@/components/containers/patients/patient-contacts/patient-name-fill-button';
import {
  DocumentType,
  DOCUMENT_TYPE_LABELS,
  GENDER_LABELS,
  PatientGender,
} from '@/types/patients/patient';
import { useBranchesQuery } from '@/shared/api/querys/branches-query';
import { getBranchStripeColor } from '@/shared/design/tokens';
import {
  DOCUMENT_MASKS,
  formatNationalId,
  formatPhone,
  PatientFormValues,
} from './patient-validation';

interface PatientFormProps {
  submitLabel: string;
  isSubmitting: boolean;
  onCancel: () => void;
}

export const PatientFormFields: React.FC<PatientFormProps> = ({
  submitLabel,
  isSubmitting,
  onCancel,
}) => {
  const { values, setFieldValue } = useFormikContext<PatientFormValues>();
  const patientFullName = buildPatientFullName(values.firstName, values.lastName);
  const documentMask = DOCUMENT_MASKS[values.documentType] ?? DOCUMENT_MASKS[DocumentType.NATIONAL];
  const { data: branches } = useBranchesQuery();

  const handleDocumentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    const next =
      values.documentType === DocumentType.NATIONAL ? formatNationalId(raw) : raw.trimStart();
    void setFieldValue('documentId', next);
  };

  return (
    <Form className="flex flex-col gap-6">
      <FormViewSection title="Datos personales">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField name="firstName" label="Nombre" required maxLength={60} />
          <FormField name="lastName" label="Apellidos" required maxLength={60} />

          <FormField name="documentType" label="Tipo de documento" as="select" required>
            {Object.values(DocumentType).map((type) => (
              <option key={type} value={type}>
                {DOCUMENT_TYPE_LABELS[type]}
              </option>
            ))}
          </FormField>

          <FormField
            name="documentId"
            label="Número de documento"
            hint={`Formato: ${documentMask.placeholder}`}
            maxLength={documentMask.maxLength}
            onChange={handleDocumentChange}
            inputMode={values.documentType === DocumentType.PASSPORT ? 'text' : 'numeric'}
            required
          />

          <FormField name="birthDate" label="Fecha de nacimiento" type="date" required />

          <FormField name="gender" label="Género" as="select" optional>
            <option value="">Sin especificar</option>
            {Object.values(PatientGender).map((gender) => (
              <option key={gender} value={gender}>
                {GENDER_LABELS[gender]}
              </option>
            ))}
          </FormField>

          <FormSelectField
            name="branchUuid"
            label="Sede"
            placeholder="Sin especificar"
            options={(branches ?? []).map((branch) => ({
              value: branch.uuid,
              label: branch.name,
              accentColor: getBranchStripeColor(branch.name),
            }))}
            optional
          />
        </div>
      </FormViewSection>

      <FormViewSection
        title="Contacto"
        caption="El primer teléfono es el principal: a ese se llama y se envían los recordatorios."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
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
                              label={index === 0 ? 'Contacto principal' : 'Contacto'}
                              hint="Vacío si es del paciente. Si es de un familiar: María (hija)"
                              maxLength={80}
                              endAdornment={
                                <PatientNameFillButton
                                  disabled={!patientFullName}
                                  onClick={() =>
                                    setFieldValue(
                                      `contacts.${index}.name`,
                                      patientFullName.slice(0, 80),
                                    )
                                  }
                                />
                              }
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <FormField
                              name={`contacts.${index}.phone`}
                              label="Teléfono"
                              hint="Formato: 8888-8888"
                              inputMode="tel"
                              required
                              onChange={(event) =>
                                setFieldValue(
                                  `contacts.${index}.phone`,
                                  formatPhone(event.target.value),
                                )
                              }
                              className="sm:w-40"
                            />
                          </div>
                        </div>
                        {values.contacts.length > 1 && (
                          // Mismo alto de etiqueta que los campos, para quedar a la par del input.
                          <div className="flex shrink-0 flex-col gap-1.5">
                            <Typography
                              variant={TypographyVariant.BODY}
                              className="invisible"
                              aria-hidden
                            >
                              &nbsp;
                            </Typography>
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              aria-label="Quitar contacto"
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
                        Agregar contacto
                      </button>
                    )}
                  </div>
                );
              }}
            </FieldArray>
          </div>

          <FormField
            name="email"
            label="Correo electrónico"
            type="email"
            optional
            className="sm:col-span-2"
          />
          <FormField
            name="address"
            label="Dirección"
            as="textarea"
            maxLength={240}
            hint="Provincia, cantón y señas exactas"
            optional
            className="sm:col-span-2"
          />
        </div>
      </FormViewSection>

      <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-4">
        <Button
          variant={ButtonVariant.SECONDARY}
          onClick={onCancel}
          disabled={isSubmitting}
          icon={<X className="h-4 w-4" aria-hidden />}
          className="w-full sm:w-auto"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant={ButtonVariant.PRIMARY}
          isLoading={isSubmitting}
          icon={<Save className="h-4 w-4" aria-hidden />}
          className="w-full sm:w-auto"
        >
          {submitLabel}
        </Button>
      </div>
    </Form>
  );
};
