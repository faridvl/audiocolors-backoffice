import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useSession } from '@/hooks/use-session';
import { useSaveClinicalHistoryTemplateMutation } from '@/shared/api/mutations/clinical-templates/save-clinical-history-template-mutation';
import {
  FETCH_CLINICAL_HISTORY_TEMPLATE_KEY,
  useClinicalHistoryTemplateQuery,
} from '@/shared/api/querys/clinical-history-template-query';
import { TEXT } from '@/static/texts/i18n';
import { UserRole } from '@/types/auth/auth';
import { CLINICAL_HISTORY_SPECIALITY } from '@/types/clinical-templates/clinical-template';
import {
  buildStandardFields,
  sortFields,
} from '@/components/containers/patients/patient-background/clinical-history';
import {
  buildClinicalTemplateSchema,
  ClinicalTemplateFormValues,
  toFormValues,
  toTemplateFields,
} from './clinical-template-form';

/** Mismos roles que acepta el API para cambiar la plantilla de la historia clínica. */
export const CLINICAL_TEMPLATE_EDITOR_ROLES = [UserRole.OWNER, UserRole.ADMIN];

export function useClinicalHistoryTemplate() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const { data: template, isLoading, isError, refetch } = useClinicalHistoryTemplateQuery();
  const { executeSaveTemplate, isPending } = useSaveClinicalHistoryTemplateMutation();

  // Mientras el administrador no la cambie, se parte de la hoja estándar de la clínica.
  const initialValues = useMemo(
    () => toFormValues(sortFields(template?.fields ?? buildStandardFields(t))),
    [template, t],
  );
  const validationSchema = useMemo(() => buildClinicalTemplateSchema(t), [t]);

  const handleSubmit = (values: ClinicalTemplateFormValues) => {
    executeSaveTemplate(
      {
        templateUuid: template?.uuid ?? null,
        template: {
          name: t(TEXT.CLINICAL_TEMPLATE.TEMPLATE_NAME),
          speciality: CLINICAL_HISTORY_SPECIALITY,
          fields: toTemplateFields(values),
        },
      },
      {
        onSuccess: () => {
          toast.success(t(TEXT.CLINICAL_TEMPLATE.SAVED));
          void queryClient.invalidateQueries({
            queryKey: [FETCH_CLINICAL_HISTORY_TEMPLATE_KEY],
          });
        },
        onError: (error: Error) => toast.error(error.message),
      },
    );
  };

  return {
    canEdit: user ? CLINICAL_TEMPLATE_EDITOR_ROLES.includes(user.role) : false,
    isSessionLoading: !user,
    initialValues,
    validationSchema,
    isLoading,
    isError,
    refetch,
    isPending,
    handleSubmit,
  };
}
