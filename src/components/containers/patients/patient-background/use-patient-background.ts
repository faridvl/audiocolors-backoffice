import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  isForbiddenError,
  usePatientBackgroundQuery,
} from '@/shared/api/querys/patient-background-query';
import { useResolveAuthorLabel } from '@/hooks/use-resolve-author-label';
import { formatDate } from '@/shared/utils/formatters';
import { TEXT } from '@/static/texts/i18n';
import {
  BACKGROUND_SECTIONS,
  BackgroundCondition,
  PatientBackground,
} from '@/types/patients/patient-background';

export interface BackgroundSummaryGroup {
  key: string;
  /** `null` cuando el antecedente va suelto, sin grupo (infecciones de oído). */
  title: string | null;
  items: string[];
}

function buildSummaryGroups(
  background: PatientBackground,
  translate: (key: string, options?: Record<string, string>) => string,
): BackgroundSummaryGroup[] {
  return BACKGROUND_SECTIONS.map(({ section, hasTitle, conditions }) => ({
    key: section,
    title: hasTitle ? translate(`${TEXT.PATIENTS.BACKGROUND.SECTION_PREFIX}.${section}`) : null,
    items: conditions
      .filter((condition) => background[condition])
      .map((condition) => {
        const label = translate(`${TEXT.PATIENTS.BACKGROUND.CONDITION_PREFIX}.${condition}`);
        const tone = background.tinnitusTone?.trim();
        return condition === BackgroundCondition.TINNITUS && tone
          ? translate(TEXT.PATIENTS.BACKGROUND.TINNITUS_WITH_TONE, { label, tone })
          : label;
      }),
  })).filter((group) => group.items.length > 0);
}

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

  const summaryGroups = useMemo(
    () => (background ? buildSummaryGroups(background, (key, options) => t(key, options)) : []),
    [background, t],
  );

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

  return {
    background: background ?? null,
    // STAFF no tiene acceso a antecedentes clínicos: la tarjeta no se muestra.
    isHidden: isForbiddenError(error),
    isLoading,
    isError,
    refetch,
    summaryGroups,
    authorship,
  };
}
