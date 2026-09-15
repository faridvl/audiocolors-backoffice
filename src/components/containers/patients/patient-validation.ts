import * as Yup from 'yup';
import { DocumentType, PatientGender } from '@/types/patients/patient';

const NAME_REGEX = /^[a-zA-ZaeiouAEIOUuUnN\u00C0-\u017F\s]+$/;

export const DOCUMENT_MASKS: Record<DocumentType, { maxLength: number; placeholder: string }> = {
  [DocumentType.NATIONAL]: { maxLength: 11, placeholder: '1-2345-6789' },
  [DocumentType.DIMEX]: { maxLength: 12, placeholder: '123456789012' },
  [DocumentType.PASSPORT]: { maxLength: 20, placeholder: 'AB123456' },
};

/** Formatea una cedula nacional costarricense como X-XXXX-XXXX. */
export function formatNationalId(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 9);
  if (digits.length <= 1) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 1)}-${digits.slice(1)}`;
  return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5)}`;
}

/** Formatea un telefono local como XXXX-XXXX. */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
}

const baseFields = {
  firstName: Yup.string()
    .matches(NAME_REGEX, 'Solo letras y espacios')
    .max(60, 'Maximo 60 caracteres')
    .required('El nombre es obligatorio'),
  lastName: Yup.string()
    .matches(NAME_REGEX, 'Solo letras y espacios')
    .max(60, 'Maximo 60 caracteres')
    .required('El apellido es obligatorio'),
  documentId: Yup.string().max(20, 'Maximo 20 caracteres').required('La cedula es obligatoria'),
  email: Yup.string().email('Correo invalido'),
  birthDate: Yup.string()
    .required('La fecha de nacimiento es obligatoria')
    .test('not-future', 'La fecha no puede ser futura', (value) => {
      if (!value) return false;
      const parsed = new Date(value);
      return !Number.isNaN(parsed.getTime()) && parsed <= new Date();
    }),
  address: Yup.string().max(240, 'Maximo 240 caracteres'),
  gender: Yup.string().oneOf(Object.values(PatientGender), 'Selecciona una opcion'),
};

export const patientCreateValidationSchema = Yup.object({
  ...baseFields,
  phone: Yup.string()
    .matches(/^\d{4}-\d{4}$/, 'Formato: XXXX-XXXX')
    .required('El telefono es obligatorio'),
});

export const patientEditValidationSchema = Yup.object({
  ...baseFields,
  // Al editar, el telefono ya puede venir guardado como "+506 XXXX-XXXX".
  phone: Yup.string()
    .matches(/^\+?[\d\s-]{7,20}$/, 'Telefono invalido')
    .required('El telefono es obligatorio'),
});

export interface PatientFormValues {
  firstName: string;
  lastName: string;
  documentType: DocumentType;
  documentId: string;
  birthDate: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
}
