import { useMemo } from 'react';
import { FormikHelpers } from 'formik';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ApiError } from '@/shared/api/api-service-client';
import { TEXT } from '@/static/texts/i18n';
import {
  Branch,
  BranchColor,
  CreateBranchPayload,
  UpdateBranchPayload,
} from '@/types/branches/branch';
import {
  BranchFormValues,
  buildBranchFormInitialValues,
  buildBranchFormSchema,
  buildCreateBranchPayload,
  buildUpdateBranchPayload,
} from './branch-form';
import { BranchSaveCallbacks } from './use-branches-settings';

const HTTP_CONFLICT = 409;

interface UseEditBranchParams {
  /** Sin sede, la ventana crea una nueva. */
  branch: Branch | null;
  defaultColor: BranchColor;
  onCreate: (payload: CreateBranchPayload, callbacks: BranchSaveCallbacks) => void;
  onUpdate: (
    branchUuid: string,
    changes: UpdateBranchPayload,
    callbacks: BranchSaveCallbacks,
  ) => void;
  onClose: () => void;
}

export function useEditBranch({
  branch,
  defaultColor,
  onCreate,
  onUpdate,
  onClose,
}: UseEditBranchParams) {
  const { t } = useTranslation();
  const isNew = branch === null;
  const validationSchema = useMemo(() => buildBranchFormSchema(t), [t]);
  const initialValues = useMemo(
    () => buildBranchFormInitialValues(branch, defaultColor),
    [branch, defaultColor],
  );

  const handleSubmit = (values: BranchFormValues, helpers: FormikHelpers<BranchFormValues>) => {
    const callbacks: BranchSaveCallbacks = {
      onSuccess: () => helpers.setSubmitting(false),
      onError: (error: Error) => {
        helpers.setSubmitting(false);
        if (error instanceof ApiError && error.status === HTTP_CONFLICT) {
          helpers.setFieldError('name', t(TEXT.SETTINGS.BRANCHES.DUPLICATE_NAME));
          return;
        }
        toast.error(error.message);
      },
    };

    if (!branch) {
      onCreate(buildCreateBranchPayload(values), callbacks);
      return;
    }

    const changes = buildUpdateBranchPayload(branch, values);
    if (Object.keys(changes).length === 0) {
      helpers.setSubmitting(false);
      onClose();
      return;
    }
    onUpdate(branch.uuid, changes, callbacks);
  };

  return { isNew, initialValues, validationSchema, handleSubmit };
}
