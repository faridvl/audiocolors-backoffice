import { createElement, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ClinicalHistoryTemplateContainer } from '@/components/containers/clinical-history-template/clinical-history-template-container';
import { useClinicalHistoryTemplateQuery } from '@/shared/api/querys/clinical-history-template-query';
import { useQuestionnaireTemplatesQuery } from '@/shared/api/querys/questionnaire-templates-query';
import { TEXT } from '@/static/texts/i18n';
import { ClinicalTemplate } from '@/types/clinical-templates/clinical-template';
import { QuestionnaireTemplateContainer } from './questionnaire-template/questionnaire-template-container';
import { QuestionSectionState, SettingsQuestionSection } from './question-sections';

const HISTORY_KEY = 'clinical-history';
const DRAFT_KEY = 'new-section';

/** Sección que la persona nombró pero todavía no se guarda en el API. */
interface PendingSection {
  name: string;
}

export function useQuestionsSettings() {
  const { t } = useTranslation();
  const templatesQuery = useQuestionnaireTemplatesQuery();
  // Se lee aquí para tener una sola puerta de carga y de error; el editor reusa el mismo caché.
  const historyQuery = useClinicalHistoryTemplateQuery();
  // Solo lo que la persona abrió o cerró a mano; el resto se decide por la lista actual.
  const [toggled, setToggled] = useState<Record<string, boolean>>({});
  const [dirtyByKey, setDirtyByKey] = useState<Record<string, boolean>>({});
  const [pending, setPending] = useState<PendingSection | null>(null);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);

  // Estable y sin cambio si el valor es igual: el reporte de cambios corre en un efecto.
  const handleDirtyChange = useCallback((key: string, isDirty: boolean) => {
    setDirtyByKey((current) =>
      !!current[key] === isDirty ? current : { ...current, [key]: isDirty },
    );
  }, []);
  const handleHistoryDirtyChange = useCallback(
    (isDirty: boolean) => handleDirtyChange(HISTORY_KEY, isDirty),
    [handleDirtyChange],
  );

  const stateOf = (key: string) =>
    dirtyByKey[key] ? QuestionSectionState.DRAFT : QuestionSectionState.COMPLETE;

  const templates = templatesQuery.data ?? [];
  const sections: SettingsQuestionSection[] = [
    {
      key: HISTORY_KEY,
      title: t(TEXT.QUESTIONS.CLINICAL_HISTORY),
      state: stateOf(HISTORY_KEY),
      render: (footerSlot) =>
        createElement(ClinicalHistoryTemplateContainer, {
          footerSlot,
          onDirtyChange: handleHistoryDirtyChange,
        }),
    },
    ...templates.map((template): SettingsQuestionSection => ({
      key: template.uuid,
      title: template.name,
      state: stateOf(template.uuid),
      render: (footerSlot) =>
        createElement(QuestionnaireTemplateContainer, {
          footerSlot,
          sectionKey: template.uuid,
          template,
          onDirtyChange: handleDirtyChange,
        }),
    })),
  ];
  if (pending) {
    sections.push({
      key: DRAFT_KEY,
      title: pending.name,
      // Aunque no se haya tocado nada, no está guardada: se avisa igual.
      state: QuestionSectionState.DRAFT,
      render: (footerSlot) =>
        createElement(QuestionnaireTemplateContainer, {
          footerSlot,
          sectionKey: DRAFT_KEY,
          template: null,
          draftName: pending.name,
          onDirtyChange: handleDirtyChange,
          onSaved: handleDraftSaved,
          onCancel: handleCancelDraft,
        }),
    });
  }

  function handleDraftSaved(saved: ClinicalTemplate) {
    setPending(null);
    setToggled((current) => ({ ...current, [saved.uuid]: true, [DRAFT_KEY]: false }));
  }

  function handleCancelDraft() {
    setPending(null);
    handleDirtyChange(DRAFT_KEY, false);
  }

  // Con una sola sección se abre sola; el borrador también, para seguir escribiendo.
  const isSectionExpanded = (key: string) =>
    toggled[key] ?? (key === DRAFT_KEY || sections.length === 1);

  const handleConfirmName = (name: string) => {
    setPending({ name });
    setToggled((current) => ({ ...current, [DRAFT_KEY]: true }));
    setIsNameModalOpen(false);
  };

  return {
    sections,
    isSectionExpanded,
    handleToggleSection: (key: string) =>
      setToggled((current) => ({ ...current, [key]: !isSectionExpanded(key) })),
    isLoading: templatesQuery.isLoading || historyQuery.isLoading,
    isError: templatesQuery.isError || historyQuery.isError,
    refetch: () => {
      if (templatesQuery.isError) void templatesQuery.refetch();
      if (historyQuery.isError) void historyQuery.refetch();
    },
    canAddSection: !pending,
    isNameModalOpen,
    handleOpenNameModal: () => setIsNameModalOpen(true),
    handleCloseNameModal: () => setIsNameModalOpen(false),
    handleConfirmName,
  };
}
