import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  isForbiddenError,
  usePatientBackgroundQuery,
} from '@/shared/api/querys/patient-background-query';
import { useResolveAuthorLabel } from '@/hooks/use-resolve-author-label';
import { formatDate } from '@/shared/utils/formatters';
import { TEXT } from '@/static/texts/i18n';

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
    isLoading,
    isError,
    refetch,
    authorship,
    isUpdating,
    handleStartUpdate: () => setIsUpdating(true),
    handleCloseUpdate: () => setIsUpdating(false),
  };
}
