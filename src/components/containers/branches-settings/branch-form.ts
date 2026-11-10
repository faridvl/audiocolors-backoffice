import * as Yup from 'yup';
import type { TFunction } from 'i18next';
import { PhoneError, toPatientPhone, validatePhone } from '@/shared/utils/phone';
import { TEXT } from '@/static/texts/i18n';
import {
  BRANCH_ADDRESS_MAX_LENGTH,
  BRANCH_NAME_MAX_LENGTH,
  Branch,
  BranchColor,
  CreateBranchPayload,
  UpdateBranchPayload,
} from '@/types/branches/branch';

const CLINIC_ERRORS = TEXT.SETTINGS.CLINIC.ERRORS;

export interface BranchFormValues {
  name: string;
  phone: string;
  address: string;
  color: BranchColor;
}

const PHONE_ERROR_KEYS: Record<PhoneError, string> = {
  [PhoneError.LOCAL_FORMAT]: CLINIC_ERRORS.PHONE_LOCAL,
  [PhoneError.INTERNATIONAL_FORMAT]: CLINIC_ERRORS.PHONE_INTERNATIONAL,
};

export const buildBranchFormInitialValues = (
  branch: Branch | null,
  defaultColor: BranchColor,
): BranchFormValues => ({
  name: branch?.name ?? '',
  phone: branch?.phone ?? '',
  address: branch?.address ?? '',
  color: branch?.color ?? defaultColor,
});

export const buildBranchFormSchema = (t: TFunction) =>
  Yup.object({
    name: Yup.string()
      .trim()
      .required(t(TEXT.SETTINGS.BRANCHES.NAME_REQUIRED))
      .max(BRANCH_NAME_MAX_LENGTH, t(TEXT.SETTINGS.BRANCHES.NAME_TOO_LONG)),
    phone: Yup.string().test('valid-phone', (value, context) => {
      const error = validatePhone(value ?? '');
      return error === null ? true : context.createError({ message: t(PHONE_ERROR_KEYS[error]) });
    }),
    address: Yup.string().max(
      BRANCH_ADDRESS_MAX_LENGTH,
      t(TEXT.SETTINGS.BRANCHES.ADDRESS_TOO_LONG),
    ),
    color: Yup.mixed<BranchColor>().required(),
  });

export function buildCreateBranchPayload(values: BranchFormValues): CreateBranchPayload {
  const phone = toPatientPhone(values.phone.trim());
  const address = values.address.trim();
  return {
    name: values.name.trim(),
    color: values.color,
    ...(phone ? { phone } : {}),
    ...(address ? { address } : {}),
  };
}

/** Solo lo que cambió; un teléfono o una dirección vaciados viajan como texto vacío. */
export function buildUpdateBranchPayload(
  branch: Branch,
  values: BranchFormValues,
): UpdateBranchPayload {
  const changes: UpdateBranchPayload = {};
  const name = values.name.trim();
  const phone = toPatientPhone(values.phone.trim());
  const address = values.address.trim();

  if (name !== branch.name) changes.name = name;
  if (phone !== toPatientPhone(branch.phone ?? '', true)) changes.phone = phone;
  if (address !== (branch.address ?? '')) changes.address = address;
  if (values.color !== branch.color) changes.color = values.color;
  return changes;
}
