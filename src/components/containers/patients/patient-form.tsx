import React from 'react';
import { Form, useFormikContext } from 'formik';
import { Save, X } from 'lucide-react';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { FormField } from '@/components/common/input/input';
import { FormSelectField } from '@/components/common/form/form-select-field';
import { FormViewSection } from '@/components/common/form/form-view-section';
import { buildPatientFullName } from '@/components/containers/patients/patient-contacts/patient-name-fill-button';
import { PatientContactsFields } from '@/components/containers/patients/patient-contacts/patient-contacts-fields';
import {
  DocumentType,
  DOCUMENT_TYPE_LABELS,
  GENDER_LABELS,
  PatientGender,
} from '@/types/patients/patient';
import { useBranchesQuery } from '@/shared/api/querys/branches-query';
import { getBranchStripeColor } from '@/shared/design/tokens';
import { DOCUMENT_MASKS, formatNationalId, PatientFormValues } from './patient-validation';

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
            <PatientContactsFields patientFullName={patientFullName} />
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
