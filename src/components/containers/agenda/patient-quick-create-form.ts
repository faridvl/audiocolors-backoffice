import * as Yup from 'yup';
import type { TFunction } from 'i18next';
import { TEXT } from '@/static/texts/i18n';
import { formatNationalId, NAME_REGEX } from '@/components/containers/patients/patient-validation';
import { PhoneError, validatePhone } from '@/shared/utils/phone';

const NAME_MAX_LENGTH = 60;
const NAME_MIN_LENGTH = 2;
const NATIONAL_ID_DIGITS = 9;
export const DOCUMENT_MAX_LENGTH = 20;
const ERRORS = TEXT.AGENDA.PICKER.CREATE.ERRORS;

export interface PatientQuickCreateValues {
  firstName: string;
  lastName: string;
  phone: string;
  documentId: string;
  branchUuid: string;
}

const PHONE_ERROR_KEYS: Record<PhoneError, string> = {
  [PhoneError.LOCAL_FORMAT]: ERRORS.PHONE_LOCAL,
  [PhoneError.INTERNATIONAL_FORMAT]: ERRORS.PHONE_INTERNATIONAL,
  [PhoneError.COSTA_RICA_WITH_PLUS]: ERRORS.PHONE_COSTA_RICA_WITH_PLUS,
};

/**
 * Misma forma que guarda el formulario completo: una cédula nacional de 9 dígitos queda
 * X-XXXX-XXXX, así "112345678" y "1-1234-5678" no crean dos expedientes. Lo demás
 * (DIMEX, pasaporte) solo pierde espacios y guiones.
 */
export function normalizeQuickCreateDocument(value: string): string {
  const compact = value.replace(/[\s-]/g, '');
  const isNationalId = compact.length === NATIONAL_ID_DIGITS && /^\d+$/.test(compact);
  return isNationalId ? formatNationalId(compact) : compact;
}

/** Con lo ya escrito en la búsqueda: un nombre entra al nombre, un número a la cédula. */
export function buildQuickCreateInitialValues(searchTerm: string): PatientQuickCreateValues {
  const term = searchTerm.trim();
  const isName = NAME_REGEX.test(term);
  const [firstName = '', ...restOfName] = isName ? term.split(/\s+/) : [];

  return {
    firstName,
    lastName: restOfName.join(' '),
    phone: '',
    documentId: isName ? '' : term.slice(0, DOCUMENT_MAX_LENGTH),
    branchUuid: '',
  };
}

const buildNameField = (t: TFunction, requiredKey: string, minKey: string) =>
  Yup.string()
    .trim()
    .matches(NAME_REGEX, t(ERRORS.NAME_LETTERS))
    .min(NAME_MIN_LENGTH, t(minKey))
    .max(NAME_MAX_LENGTH, t(ERRORS.NAME_MAX))
    .required(t(requiredKey));

/** `isBranchRequired`: la clínica tiene sedes (o aún se cargan); sin ninguna se sigue sin sede. */
export const buildPatientQuickCreateSchema = (t: TFunction, isBranchRequired: boolean) =>
  Yup.object({
    firstName: buildNameField(t, ERRORS.FIRST_NAME_REQUIRED, ERRORS.FIRST_NAME_MIN),
    lastName: buildNameField(t, ERRORS.LAST_NAME_REQUIRED, ERRORS.LAST_NAME_MIN),
    documentId: Yup.string()
      .trim()
      .max(DOCUMENT_MAX_LENGTH, t(ERRORS.DOCUMENT_MAX))
      .required(t(ERRORS.DOCUMENT_REQUIRED)),
    phone: Yup.string()
      .test('valid-phone', (value, context) => {
        const error = validatePhone(value ?? '');
        return error === null ? true : context.createError({ message: t(PHONE_ERROR_KEYS[error]) });
      })
      .required(t(ERRORS.PHONE_REQUIRED)),
    branchUuid: isBranchRequired
      ? Yup.string().required(t(ERRORS.BRANCH_REQUIRED))
      : Yup.string(),
  });
