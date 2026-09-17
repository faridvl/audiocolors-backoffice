import React from 'react';
import { Form, useFormikContext, FieldArray } from 'formik';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { FormField } from '@/components/common/input/input';
import { FormViewSection } from '@/components/common/form/form-view-section';
import {
  DocumentType,
  DOCUMENT_TYPE_LABELS,
  GENDER_LABELS,
  PatientGender,
} from '@/types/patients/patient';
import { useBranchesQuery } from '@/shared/api/querys/branches-query';
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
  /** Al editar, el teléfono ya viene con prefijo y no se re-enmascara. */
  maskPhone?: boolean;
  /** Solo en alta: en edición los teléfonos adicionales se gestionan aparte, ya con el paciente creado. */
  showContacts?: boolean;
}

export const PatientFormFields: React.FC<PatientFormProps> = ({
  submitLabel,
  isSubmitting,
  onCancel,
  maskPhone = true,
  showContacts = false,
}) => {
  const { values, setFieldValue } = useFormikContext<PatientFormValues>();
  const documentMask = DOCUMENT_MASKS[values.documentType] ?? DOCUMENT_MASKS[DocumentType.NATIONAL];
  const { data: branches } = useBranchesQuery();

  const handleDocumentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    const next =
      values.documentType === DocumentType.NATIONAL ? formatNationalId(raw) : raw.trimStart();
    void setFieldValue('documentId', next);
  };

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = maskPhone ? formatPhone(event.target.value) : event.target.value;
    void setFieldValue('phone', next);
  };

  return (
    <Form className="flex flex-col gap-6">
      <FormViewSection title="Datos personales">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField name="firstName" label="Nombre" placeholder="Maria" required maxLength={60} />
          <FormField
            name="lastName"
            label="Apellidos"
            placeholder="Rodriguez Solis"
            required
            maxLength={60}
          />

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
            placeholder={documentMask.placeholder}
            maxLength={documentMask.maxLength}
            onChange={handleDocumentChange}
            inputMode={values.documentType === DocumentType.PASSPORT ? 'text' : 'numeric'}
            required
          />

          <FormField name="birthDate" label="Fecha de nacimiento" type="date" required />

          <FormField name="gender" label="Género" as="select">
            <option value="">Sin especificar</option>
            {Object.values(PatientGender).map((gender) => (
              <option key={gender} value={gender}>
                {GENDER_LABELS[gender]}
              </option>
            ))}
          </FormField>

          <FormField name="branchUuid" label="Sede" as="select">
            <option value="">Sin especificar</option>
            {(branches ?? []).map((branch) => (
              <option key={branch.uuid} value={branch.uuid}>
                {branch.name}
              </option>
            ))}
          </FormField>
        </div>
      </FormViewSection>

      <FormViewSection title="Contacto" caption="Al menos un medio de contacto facilita avisar al paciente.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            name="phone"
            label="Teléfono"
            placeholder={maskPhone ? '8888-8888' : '+506 8888-8888'}
            onChange={handlePhoneChange}
            inputMode="tel"
            required
          />
          <FormField
            name="email"
            label="Correo electrónico"
            type="email"
            placeholder="paciente@correo.com"
            hint="Opcional"
          />
          <FormField
            name="address"
            label="Dirección"
            as="textarea"
            maxLength={240}
            placeholder="Provincia, canton, senas exactas"
            className="sm:col-span-2"
          />

          {showContacts && (
            <div className="sm:col-span-2">
              <FieldArray name="contacts">
                {({ push, remove }) => {
                  const lastContact = values.contacts[values.contacts.length - 1];
                  const canAddAnother =
                    values.contacts.length === 0 ||
                    (!!lastContact?.name.trim() && !!lastContact?.phone.trim());

                  return (
                    <div className="flex flex-col gap-3">
                      {values.contacts.map((contact, index) => {
                        const hasData = !!contact.name.trim() || !!contact.phone.trim();

                        return (
                          <div
                            key={index}
                            className="flex flex-col gap-3 sm:flex-row sm:items-end"
                          >
                            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                              <FormField
                                name={`contacts.${index}.name`}
                                label="Nombre de contacto adicional"
                                placeholder="Ej. Juan (hijo)"
                                maxLength={80}
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <FormField
                                name={`contacts.${index}.phone`}
                                label="Teléfono"
                                placeholder="8888-8888"
                                inputMode="tel"
                                onChange={(event) =>
                                  setFieldValue(
                                    `contacts.${index}.phone`,
                                    formatPhone(event.target.value),
                                  )
                                }
                                className="sm:w-40"
                              />
                            </div>
                            {(hasData || values.contacts.length > 1) && (
                              <button
                                type="button"
                                onClick={() => remove(index)}
                                aria-label="Quitar teléfono"
                                className="mb-0.5 shrink-0 rounded-lg p-2.5 text-ink-400 transition-colors hover:bg-danger/10 hover:text-danger sm:mb-0"
                              >
                                <Trash2 className="h-4 w-4" aria-hidden />
                              </button>
                            )}
                          </div>
                        );
                      })}

                      {canAddAnother && (
                        <button
                          type="button"
                          onClick={() => push({ name: '', phone: '' })}
                          className="flex w-fit items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline"
                        >
                          <Plus className="h-3.5 w-3.5" aria-hidden />
                          {values.contacts.length === 0 ? 'Agregar contacto adicional' : 'Agregar otro'}
                        </button>
                      )}
                    </div>
                  );
                }}
              </FieldArray>
            </div>
          )}
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
