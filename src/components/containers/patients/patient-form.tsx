import React from 'react';
import { Form, useFormikContext } from 'formik';
import { Save, X } from 'lucide-react';
import { tailwind } from '@/utils/tailwind-utils';
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
}

export const PatientFormFields: React.FC<PatientFormProps> = ({
  submitLabel,
  isSubmitting,
  onCancel,
  maskPhone = true,
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
        </div>
      </FormViewSection>

      {/*
        Sticky en movil: en formularios largos los botones de guardar se
        perdian al hacer scroll y quedaba "raro" no ver una accion visible.
        Desde md vuelve a fluir con el contenido (ya no hace falta, el
        formulario entra completo en pantalla).
      */}
      <div
        className={tailwind(
          'sticky bottom-0 -mx-4 mt-6 flex flex-col-reverse gap-3 border-t border-ink-200 bg-white/95',
          'px-4 py-3 backdrop-blur-sm sm:flex-row sm:justify-end sm:gap-4',
          'md:static md:mx-0 md:border-t-0 md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-none',
        )}
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
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
