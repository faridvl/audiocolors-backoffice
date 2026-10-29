import { createElement, useState } from 'react';
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
import { TEXT } from '@/static/texts/i18n';

export function usePatientQuestions(patientUuid: string) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  // Solo una sección abierta a la vez.
  const [openSectionKey, setOpenSectionKey] = useState<string | null>(null);
  const [isHistoryDirty, setIsHistoryDirty] = useState(false);
  // La historia se consulta aquí (no en su contenido) para saber si responde 403 y si falta
  // llenarla sin montarla; es la misma consulta, así que no se pide dos veces.
  const { data: background, isLoading, isError, error } = usePatientBackgroundQuery(patientUuid);

  const sections: QuestionSectionEntry[] = [];
  if (!isForbiddenError(error)) {
    const isUnfilled = !isLoading && !isError && !background;
    let state = QuestionSectionState.COMPLETE;
    if (isHistoryDirty) state = QuestionSectionState.DRAFT;
    else if (isUnfilled) state = QuestionSectionState.UNFILLED;
    sections.push({
      key: 'clinical-history',
      title: t(TEXT.QUESTIONS.CLINICAL_HISTORY),
      state,
      render: (controls) =>
        createElement(PatientBackgroundContainer, {
          patientUuid,
          onDirtyChange: setIsHistoryDirty,
          ...controls,
        }),
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
