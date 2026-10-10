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
    .max(60, 'Máximo 60 caracteres')
    .required('El nombre es obligatorio'),
  lastName: Yup.string()
    .matches(NAME_REGEX, 'Solo letras y espacios')
    .max(60, 'Máximo 60 caracteres')
    .required('El apellido es obligatorio'),
  documentId: Yup.string().max(20, 'Máximo 20 caracteres').required('La cédula es obligatoria'),
  email: Yup.string().email('Correo inválido'),
  birthDate: Yup.string()
    .required('La fecha de nacimiento es obligatoria')
    .test('not-future', 'La fecha no puede ser futura', (value) => {
      if (!value) return false;
      const parsed = new Date(value);
      return !Number.isNaN(parsed.getTime()) && parsed <= new Date();
    }),
  address: Yup.string().max(240, 'Máximo 240 caracteres'),
  gender: Yup.string().oneOf(Object.values(PatientGender), 'Selecciona una opción'),
};

const CONTACT_NAME_MAX_LENGTH = 80;
const LOCAL_PHONE_PATTERN = /^\d{4}-\d{4}$/;
const COUNTRY_PREFIX = '+506 ';

const buildContactsField = (phoneField: Yup.StringSchema) =>
  Yup.array()
    .of(
      Yup.object({
        name: Yup.string().max(CONTACT_NAME_MAX_LENGTH, 'Máximo 80 caracteres'),
        phone: phoneField.required('El teléfono es obligatorio'),
      }),
    )
    .min(1, 'Agrega al menos un contacto');

export const patientCreateValidationSchema = Yup.object({
  ...baseFields,
  contacts: buildContactsField(Yup.string().matches(LOCAL_PHONE_PATTERN, 'Formato: XXXX-XXXX')),
});

export const patientEditValidationSchema = Yup.object({
  ...baseFields,
  // Pacientes viejos pueden tener un teléfono extranjero o sin el formato local.
  contacts: buildContactsField(Yup.string().matches(/^\+?[\d\s-]{7,20}$/, 'Teléfono inválido')),
});

export interface PatientContactFormValues {
  /** Presente solo si el contacto ya existía al abrir el formulario. */
  uuid?: string;
  name: string;
  phone: string;
}

export interface PatientFormValues {
  firstName: string;
  lastName: string;
  documentType: DocumentType;
  documentId: string;
  birthDate: string;
  gender: string;
  email: string;
  address: string;
  branchUuid: string;
  contacts: PatientContactFormValues[];
}

/**
 * El paciente no tiene un campo de teléfono aparte: el primer contacto es el
 * principal y su número se guarda también en el paciente, que es el que usan
 * WhatsApp, "Llamar" y la búsqueda. Un contacto sin nombre es el paciente.
 */
export function resolveContactsForSave(
  contacts: PatientContactFormValues[],
  patientFullName: string,
): { phone: string | undefined; contacts: PatientContactFormValues[] } {
  const filled = contacts
    .filter((contact) => contact.phone.trim())
    .map((contact) => ({
      ...(contact.uuid && { uuid: contact.uuid }),
      name: (contact.name.trim() || patientFullName).slice(0, CONTACT_NAME_MAX_LENGTH),
      phone: contact.phone.trim(),
    }));
  const primaryPhone = filled[0]?.phone;

  return {
    phone:
      primaryPhone && LOCAL_PHONE_PATTERN.test(primaryPhone)
        ? `${COUNTRY_PREFIX}${primaryPhone}`
        : primaryPhone,
    contacts: filled,
  };
}

/** Teléfono del paciente como se escribe en un contacto: sin el prefijo del país. */
export function toContactPhone(patientPhone: string): string {
  return patientPhone.startsWith(COUNTRY_PREFIX)
    ? patientPhone.slice(COUNTRY_PREFIX.length)
    : patientPhone;
}

export function isSamePhone(first: string, second: string): boolean {
  const lastDigits = (phone: string) => phone.replace(/\D/g, '').slice(-8);
  return lastDigits(first) !== '' && lastDigits(first) === lastDigits(second);
}
