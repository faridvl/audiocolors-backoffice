import { createElement, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PatientBackgroundContainer } from '@/components/containers/patients/patient-background/patient-background-container';
import {
  buildQuestionsSubtitle,
  QuestionSectionControls,
  QuestionSectionEntry,
  QuestionSectionState,
} from '@/components/containers/questions/question-sections';
import {
  isForbiddenError,
  usePatientBackgroundQuery,
} from '@/shared/api/querys/patient-background-query';
import { useQuestionnaireEntriesQuery } from '@/shared/api/querys/questionnaire-entries-query';
import { useQuestionnaireTemplatesQuery } from '@/shared/api/querys/questionnaire-templates-query';
import { formatShortDate } from '@/shared/utils/formatters';
import { TEXT } from '@/static/texts/i18n';
import { QuestionnaireEntry } from '@/types/questionnaires/questionnaire-entry';
import { QuestionnaireSectionContainer } from './questionnaire-section-container';

const HISTORY_KEY = 'clinical-history';

export function usePatientQuestions(patientUuid: string) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  // Solo una sección abierta a la vez.
  const [openSectionKey, setOpenSectionKey] = useState<string | null>(null);
  const [dirtyByKey, setDirtyByKey] = useState<Record<string, boolean>>({});
  // La historia se consulta aquí (no en su contenido) para saber si responde 403 y si falta
  // llenarla sin montarla; es la misma consulta, así que no se pide dos veces.
  const { data: background, isLoading, isError, error } = usePatientBackgroundQuery(patientUuid);
  const templatesQuery = useQuestionnaireTemplatesQuery();
  const entriesQuery = useQuestionnaireEntriesQuery(patientUuid);

  // Estable y sin cambiar el estado si el valor es igual: el reporte de cambios corre en un efecto.
  const handleDirtyChange = useCallback((key: string, isDirty: boolean) => {
    setDirtyByKey((current) =>
      !!current[key] === isDirty ? current : { ...current, [key]: isDirty },
    );
  }, []);
  const handleHistoryDirtyChange = useCallback(
    (isDirty: boolean) => handleDirtyChange(HISTORY_KEY, isDirty),
    [handleDirtyChange],
  );

  const sections: QuestionSectionEntry[] = [];
  if (!isForbiddenError(error)) {
    const isUnfilled = !isLoading && !isError && !background;
    let state = QuestionSectionState.COMPLETE;
    if (dirtyByKey[HISTORY_KEY]) state = QuestionSectionState.DRAFT;
    else if (isUnfilled) state = QuestionSectionState.UNFILLED;
    sections.push({
      key: HISTORY_KEY,
      title: t(TEXT.QUESTIONS.CLINICAL_HISTORY),
      state,
      render: (controls) =>
        createElement(PatientBackgroundContainer, {
          patientUuid,
          onDirtyChange: handleHistoryDirtyChange,
          ...controls,
        }),
    });
  }

  const isQuestionnaireForbidden =
    isForbiddenError(templatesQuery.error) || isForbiddenError(entriesQuery.error);
  if (!isQuestionnaireForbidden) {
    const entriesByTemplate = new Map<string, QuestionnaireEntry[]>();
    (entriesQuery.data ?? []).forEach((entry) => {
      const list = entriesByTemplate.get(entry.templateUuid) ?? [];
      list.push(entry);
      entriesByTemplate.set(entry.templateUuid, list);
    });

    (templatesQuery.data ?? [])
      .filter((template) => template.fields.length > 0)
      .forEach((template) => {
        const entries = entriesByTemplate.get(template.uuid) ?? [];
        const hasLoaded = !entriesQuery.isLoading && !entriesQuery.isError;
        let state = QuestionSectionState.COMPLETE;
        if (dirtyByKey[template.uuid]) state = QuestionSectionState.DRAFT;
        else if (hasLoaded && entries.length === 0) state = QuestionSectionState.UNFILLED;
        const statusText = hasLoaded
          ? entries.length === 0
            ? t(TEXT.QUESTIONS.SECTION_STATUS_NONE)
            : t(TEXT.QUESTIONS.SECTION_STATUS_SUMMARY, {
                count: entries.length,
                date: formatShortDate(entries[0].createdAt),
              })
          : undefined;
        sections.push({
          key: template.uuid,
          title: template.name,
          state,
          render: (controls) =>
            createElement(QuestionnaireSectionContainer, {
              patientUuid,
              template,
              entries,
              isLoading: entriesQuery.isLoading,
              isError: entriesQuery.isError,
              statusText,
              onRetry: () => void entriesQuery.refetch(),
              onDirtyChange: handleDirtyChange,
              ...controls,
            }),
        });
      });
  }

  const controlsFor = (key: string): QuestionSectionControls => ({
    isExpanded: openSectionKey === key,
    onToggle: () => setOpenSectionKey((current) => (current === key ? null : key)),
    onExpand: () => setOpenSectionKey(key),
  });

  const subtitle = buildQuestionsSubtitle(t, sections);

  return {
    sections,
    controlsFor,
    isHidden: sections.length === 0,
    subtitle: subtitle.text,
    hasDraft: subtitle.hasDraft,
    isExpanded,
    handleToggleExpanded: () => {
      // Con una sola sección no hay nada que elegir: se abre junto con "Preguntas".
      if (!isExpanded && sections.length === 1) setOpenSectionKey(sections[0].key);
      setIsExpanded((current) => !current);
    },
  };
}
