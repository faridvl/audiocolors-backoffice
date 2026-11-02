import { useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { toTemplateFields } from '@/components/containers/clinical-history-template/clinical-template-form';
import { useSaveQuestionnaireTemplateMutation } from '@/shared/api/mutations/questionnaires/save-questionnaire-template-mutation';
import { FETCH_QUESTIONNAIRE_TEMPLATES_KEY } from '@/shared/api/querys/questionnaire-templates-query';
import { TEXT } from '@/static/texts/i18n';
import { ClinicalTemplate } from '@/types/clinical-templates/clinical-template';
import {
  buildQuestionnaireFormValues,
  buildQuestionnaireSchema,
  QuestionnaireTemplateFormValues,
} from './questionnaire-template-form';

interface UseQuestionnaireTemplateOptions {
  /** Null mientras la sección todavía no se crea en el API. */
  template: ClinicalTemplate | null;
  draftName: string;
  onSaved?: (template: ClinicalTemplate) => void;
}

export function useQuestionnaireTemplate({
  template,
  draftName,
  onSaved,
}: UseQuestionnaireTemplateOptions) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { executeSaveTemplate, isPending } = useSaveQuestionnaireTemplateMutation();
  const [isSaving, setIsSaving] = useState(false);
  // El ref corta el segundo clic del mismo instante, antes de que el estado se repinte.
  const savingRef = useRef(false);

  const initialValues = useMemo(
    () => buildQuestionnaireFormValues(template, draftName),
    [template, draftName],
  );
  const validationSchema = useMemo(() => buildQuestionnaireSchema(t), [t]);

  const releaseSaving = () => {
    savingRef.current = false;
    setIsSaving(false);
  };

  const handleSubmit = (values: QuestionnaireTemplateFormValues) => {
    if (savingRef.current) return;
    savingRef.current = true;
    setIsSaving(true);
    executeSaveTemplate(
      {
        templateUuid: template?.uuid ?? null,
        name: values.name.trim(),
        fields: toTemplateFields(values),
      },
      {
        onSuccess: async (saved) => {
          // Se espera la lista nueva para que la sección recién creada ya esté al soltar el borrador.
          await queryClient.invalidateQueries({ queryKey: [FETCH_QUESTIONNAIRE_TEMPLATES_KEY] });
          toast.success(t(TEXT.QUESTIONS.SECTION_SAVED));
          // El borrador se suelta recién aquí: hasta entonces Guardar sigue bloqueado.
          onSaved?.(saved);
          releaseSaving();
        },
        onError: (error: Error) => {
          toast.error(error.message);
          releaseSaving();
        },
      },
    );
  };

  return { initialValues, validationSchema, isPending: isPending || isSaving, handleSubmit };
}
