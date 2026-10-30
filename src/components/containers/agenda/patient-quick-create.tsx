import React, { useEffect } from 'react';
import { Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Save } from 'lucide-react';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { FormField } from '@/components/common/input/input';
import { FormSelectField } from '@/components/common/form/form-select-field';
import { FocusFirstError } from '@/components/common/form/focus-first-error';
import { PhoneField } from '@/components/common/phone-field/phone-field';
import { getBranchStripeColor } from '@/shared/design/tokens';
import { TEXT } from '@/static/texts/i18n';
import { Patient } from '@/types/patients/patient';
import { DOCUMENT_MAX_LENGTH } from './patient-quick-create-form';
import { usePatientQuickCreate } from './use-patient-quick-create';

interface PatientQuickCreateFormProps {
  searchTerm: string;
  onCreated: (patient: Patient) => void;
  onBack: () => void;
  onSavingChange: (isSaving: boolean) => void;
}

/** Pre-registro: solo lo necesario para agendar; el expediente se completa en la cita. */
export const PatientQuickCreateForm: React.FC<PatientQuickCreateFormProps> = ({
  searchTerm,
  onCreated,
  onBack,
  onSavingChange,
}) => {
  const { t } = useTranslation();
  const { initialValues, validationSchema, handleSubmit, isPending, branches } =
    usePatientQuickCreate(searchTerm, onCreated);

  useEffect(() => {
    onSavingChange(isPending);
  }, [isPending, onSavingChange]);

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      <Form className="mt-4 flex flex-col gap-4">
        <FocusFirstError />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField name="firstName" label={t(TEXT.AGENDA.PICKER.CREATE.FIRST_NAME)} required />
          <FormField name="lastName" label={t(TEXT.AGENDA.PICKER.CREATE.LAST_NAME)} required />
        </div>
        <PhoneField name="phone" label={t(TEXT.AGENDA.PICKER.CREATE.PHONE)} required />
        <FormField
          name="documentId"
          label={t(TEXT.AGENDA.PICKER.CREATE.DOCUMENT_ID)}
          maxLength={DOCUMENT_MAX_LENGTH}
          required
        />
        <FormSelectField
          name="branchUuid"
          label={t(TEXT.AGENDA.PICKER.CREATE.BRANCH)}
          placeholder={t(TEXT.AGENDA.PICKER.CREATE.BRANCH_PLACEHOLDER)}
          options={branches.map((branch) => ({
            value: branch.uuid,
            label: branch.name,
            accentColor: getBranchStripeColor(branch.name),
          }))}
          required={branches.length > 0}
          optional={branches.length === 0}
        />

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            variant={ButtonVariant.SECONDARY}
            onClick={onBack}
            disabled={isPending}
            icon={<ArrowLeft className="h-4 w-4" aria-hidden />}
            className="w-full sm:w-auto"
          >
            {t(TEXT.AGENDA.PICKER.CREATE.BACK)}
          </Button>
          <Button
            type="submit"
            variant={ButtonVariant.PRIMARY}
            isLoading={isPending}
            icon={<Save className="h-4 w-4" aria-hidden />}
            className="w-full sm:w-auto"
          >
            {t(TEXT.AGENDA.PICKER.CREATE.SUBMIT)}
          </Button>
        </div>
      </Form>
    </Formik>
  );
};
