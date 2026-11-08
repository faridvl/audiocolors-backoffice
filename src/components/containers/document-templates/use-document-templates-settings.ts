import { useState } from 'react';
import { useDocumentTemplatesQuery } from '@/shared/api/querys/document-templates-query';

/** Qué se ve en la sección: la lista o el editor (de una plantilla nueva o de una existente). */
export enum DocumentTemplatesView {
  LIST = 'LIST',
  CREATE = 'CREATE',
  EDIT = 'EDIT',
}

export function useDocumentTemplatesSettings() {
  const { data, isLoading, isError, refetch } = useDocumentTemplatesQuery();
  const [view, setView] = useState(DocumentTemplatesView.LIST);
  const [editingUuid, setEditingUuid] = useState<string | null>(null);

  const handleCreate = () => {
    setEditingUuid(null);
    setView(DocumentTemplatesView.CREATE);
  };

  const handleEdit = (templateUuid: string) => {
    setEditingUuid(templateUuid);
    setView(DocumentTemplatesView.EDIT);
  };

  const handleBack = () => {
    setEditingUuid(null);
    setView(DocumentTemplatesView.LIST);
  };

  return {
    templates: data ?? [],
    isLoading,
    isError,
    refetch,
    view,
    editingUuid,
    handleCreate,
    handleEdit,
    handleBack,
  };
}
