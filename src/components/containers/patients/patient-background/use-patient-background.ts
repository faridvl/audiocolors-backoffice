import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  isForbiddenError,
  usePatientBackgroundQuery,
} from '@/shared/api/querys/patient-background-query';
import { useClinicalHistoryTemplateQuery } from '@/shared/api/querys/clinical-history-template-query';
import { useResolveAuthorLabel } from '@/hooks/use-resolve-author-label';
import { formatDate } from '@/shared/utils/formatters';
import { TEXT } from '@/static/texts/i18n';
import { buildStandardFields, resolveAnswers } from './clinical-history';

export function usePatientBackground(patientUuid: string) {
  const { t } = useTranslation();
  const resolveAuthorLabel = useResolveAuthorLabel();
  const {
    data: background,
    isLoading,
    isError,
    error,
    refetch,
  } = usePatientBackgroundQuery(patientUuid);
  const {
    data: template,
    isLoading: isTemplateLoading,
    isError: isTemplateError,
    refetch: refetchTemplate,
  } = useClinicalHistoryTemplateQuery();

  // Una historia ya llena se *lee* con las preguntas que tenía al llenarse (sin copia, es de
  // antes de las preguntas configurables: la hoja estándar).
  const summaryFields = useMemo(
    () => (background ? (background.templateSnapshot ?? buildStandardFields(t)) : []),
    [background, t],
  );
  // Llenarla o editarla usa las preguntas actuales de la clínica: al editar aparecen las
  // agregadas después, con las respuestas que ya tenía en las demás.
  const formFields = useMemo(() => template?.fields ?? buildStandardFields(t), [template, t]);
  const answers = useMemo(() => (background ? resolveAnswers(background) : {}), [background]);

  const authorship: string[] = [];
  if (background) {
    authorship.push(
      t(TEXT.PATIENTS.BACKGROUND.CREATED_BY, {
        author: resolveAuthorLabel(background.createdByUuid ?? ''),
        date: formatDate(background.createdAt),
      }),
    );
    if (background.updatedAt !== background.createdAt) {
      authorship.push(
        t(TEXT.PATIENTS.BACKGROUND.UPDATED_BY, {
          author: resolveAuthorLabel(background.updatedByUuid ?? background.createdByUuid ?? ''),
          date: formatDate(background.updatedAt),
        }),
      );
    }
  }

  const [isUpdating, setIsUpdating] = useState(false);

  return {
    background: background ?? null,
    // STAFF no tiene acceso a antecedentes clínicos: la tarjeta no se muestra.
    isHidden: isForbiddenError(error),
    summaryFields,
    formFields,
    answers,
    isLoading: isLoading || isTemplateLoading,
    isError: isError || isTemplateError,
    refetch: () => {
      void refetch();
      void refetchTemplate();
    },
    authorship,
    isUpdating,
    handleStartUpdate: () => setIsUpdating(true),
    handleCloseUpdate: () => setIsUpdating(false),
  };
}
