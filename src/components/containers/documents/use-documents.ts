import { useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import {
  ALL_CATEGORIES_FILTER,
  DocumentCategory,
  DocumentFilter,
  DocumentItem,
  DOCUMENT_NAME_MAX_LENGTH,
  UpdateDocumentPayload,
} from '@/types/documents/document.types';
import {
  usePatientDocumentsQuery,
  FETCH_PATIENT_DOCUMENTS_KEY,
} from '@/shared/api/querys/patient-documents-query';
import { useUploadDocumentMutation } from '@/shared/api/mutations/documents/upload-document-mutation';
import { useDeleteDocumentMutation } from '@/shared/api/mutations/documents/delete-document-mutation';
import { useUpdateDocumentMutation } from '@/shared/api/mutations/documents/update-document-mutation';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { TEXT } from '@/static/texts/i18n';
import { mapToDocumentItem } from './document-items';
import { useDocumentPreview } from './use-document-preview';

/** Solo se pagina en movil: el grid de escritorio ya muestra varias columnas a la vez. */
const MOBILE_PAGE_SIZE = 5;

/**
 * Sin restriccion de tipo: los equipos de audiometria de cada clinica
 * exportan en formatos distintos (PDF, imagen, o algo propio del
 * fabricante) y no vale la pena bloquear al medico por un tipo que no se
 * previsualiza — el visor ya cae con gracia a "Abrir archivo" para lo que
 * no es imagen o PDF. Limite de tamano: 20 MB por archivo.
 */
const MAX_FILE_SIZE_MB = 20;
const BYTES_PER_MB = 1024 * 1024;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * BYTES_PER_MB;

/**
 * Separa el nombre de su extensión. Al subir solo se deja editar la base:
 * el API arma la clave en R2 con la extensión del nombre recibido y el
 * preview depende de ella, así que perderla rompería la vista del archivo.
 */
function splitFileName(fileName: string): { baseName: string; extension: string } {
  const dotIndex = fileName.lastIndexOf('.');
  if (dotIndex <= 0) return { baseName: fileName, extension: '' };

  return { baseName: fileName.slice(0, dotIndex), extension: fileName.slice(dotIndex) };
}

export function useDocuments(patientUuid: string) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [filter, setFilter] = useState<DocumentFilter>(ALL_CATEGORIES_FILTER);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>(
    DocumentCategory.OTHER,
  );
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingFileBaseName, setPendingFileBaseName] = useState('');
  const preview = useDocumentPreview();
  const [documentToDelete, setDocumentToDelete] = useState<DocumentItem | null>(null);
  const [documentToEdit, setDocumentToEdit] = useState<DocumentItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState<DocumentCategory>(DocumentCategory.OTHER);
  const [page, setPage] = useState(1);

  const isMobile = useIsMobile();
  const { data, isLoading, isError, refetch } = usePatientDocumentsQuery(patientUuid);
  const { executeUploadDocument, isPending: isUploading } = useUploadDocumentMutation();
  const { executeDeleteDocument, isPending: isDeleting } = useDeleteDocumentMutation();
  const { executeUpdateDocument, isPending: isUpdating } = useUpdateDocumentMutation();

  const documents = useMemo(() => (data ?? []).map(mapToDocumentItem), [data]);

  const filteredDocuments = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return documents.filter((document) => {
      const matchesFilter = filter === ALL_CATEGORIES_FILTER || document.category === filter;
      const matchesSearch =
        !normalizedSearch || document.name.toLowerCase().includes(normalizedSearch);
      return matchesFilter && matchesSearch;
    });
  }, [documents, filter, searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [filter, searchTerm, isMobile]);

  const totalPages = isMobile
    ? Math.max(1, Math.ceil(filteredDocuments.length / MOBILE_PAGE_SIZE))
    : 1;
  const currentPage = Math.min(page, totalPages);
  const visibleDocuments = isMobile
    ? filteredDocuments.slice((currentPage - 1) * MOBILE_PAGE_SIZE, currentPage * MOBILE_PAGE_SIZE)
    : filteredDocuments;

  const invalidateDocuments = () =>
    queryClient.invalidateQueries({ queryKey: [FETCH_PATIENT_DOCUMENTS_KEY, patientUuid] });

  const openFilePicker = () => fileInputRef.current?.click();

  const handleFileSelected = (file: File | null) => {
    if (!file) {
      setPendingFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error(t(TEXT.DOCUMENTS.TOASTS.TOO_LARGE, { size: MAX_FILE_SIZE_MB }));
      return;
    }

    setPendingFile(file);
    setPendingFileBaseName(splitFileName(file.name).baseName);
  };

  const pendingFileExtension = pendingFile ? splitFileName(pendingFile.name).extension : '';

  const handlePendingFileBaseNameChange = (value: string) =>
    setPendingFileBaseName(value.slice(0, DOCUMENT_NAME_MAX_LENGTH - pendingFileExtension.length));

  const clearPendingFile = () => {
    setPendingFile(null);
    setPendingFileBaseName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = () => {
    if (!pendingFile) {
      openFilePicker();
      return;
    }

    const trimmedBaseName = pendingFileBaseName.trim();

    if (!trimmedBaseName) {
      toast.error(t(TEXT.DOCUMENTS.TOASTS.NAME_REQUIRED));
      return;
    }

    executeUploadDocument(
      {
        patientUuid,
        file: pendingFile,
        category: selectedCategory,
        fileName: `${trimmedBaseName}${pendingFileExtension}`,
      },
      {
        onSuccess: () => {
          toast.success(t(TEXT.DOCUMENTS.TOASTS.UPLOADED));
          clearPendingFile();
          void invalidateDocuments();
        },
        onError: (error: Error) => toast.error(error.message),
      },
    );
  };

  const handleConfirmDelete = () => {
    if (!documentToDelete) return;

    executeDeleteDocument(
      { patientUuid, documentUuid: documentToDelete.uuid },
      {
        onSuccess: () => {
          toast.success(t(TEXT.DOCUMENTS.TOASTS.DELETED));
          setDocumentToDelete(null);
          void invalidateDocuments();
        },
        onError: (error: Error) => {
          toast.error(error.message);
          setDocumentToDelete(null);
        },
      },
    );
  };

  const handleStartEdit = (document: DocumentItem) => {
    setDocumentToEdit(document);
    setEditName(document.name);
    setEditCategory(document.category);
  };

  const handleCancelEdit = () => {
    setDocumentToEdit(null);
    setEditName('');
  };

  const handleEditCategoryChange = (value: string) => {
    const category = Object.values(DocumentCategory).find((option) => option === value);
    if (category) setEditCategory(category);
  };

  const handleEditNameChange = (value: string) =>
    setEditName(value.slice(0, DOCUMENT_NAME_MAX_LENGTH));

  const handleConfirmEdit = () => {
    if (!documentToEdit) return;

    const trimmedName = editName.trim();

    if (!trimmedName) {
      toast.error(t(TEXT.DOCUMENTS.TOASTS.NAME_REQUIRED));
      return;
    }

    const changes: UpdateDocumentPayload = {};
    if (trimmedName !== documentToEdit.name) changes.originalName = trimmedName;
    if (editCategory !== documentToEdit.category) changes.category = editCategory;

    if (!Object.keys(changes).length) {
      handleCancelEdit();
      return;
    }

    executeUpdateDocument(
      { patientUuid, documentUuid: documentToEdit.uuid, changes },
      {
        onSuccess: () => {
          toast.success(t(TEXT.DOCUMENTS.TOASTS.UPDATED));
          handleCancelEdit();
          void invalidateDocuments();
        },
        onError: (error: Error) => toast.error(error.message),
      },
    );
  };

  return {
    documents: visibleDocuments,
    filteredCount: filteredDocuments.length,
    totalCount: documents.length,
    isLoading,
    isError,
    refetch,
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    page: currentPage,
    totalPages,
    handlePageChange: setPage,
    pendingFile,
    pendingFileBaseName,
    handlePendingFileBaseNameChange,
    handleFileSelected,
    clearPendingFile,
    fileInputRef,
    openFilePicker,
    handleUpload,
    isUploading,
    previewDocument: preview.previewDocument,
    previewRotationDegrees: preview.previewRotationDegrees,
    handleOpenPreview: preview.handleOpenPreview,
    handleClosePreview: preview.handleClosePreview,
    handleRotatePreview: preview.handleRotatePreview,
    documentToDelete,
    setDocumentToDelete,
    handleConfirmDelete,
    isDeleting,
    documentToEdit,
    editName,
    editCategory,
    handleEditCategoryChange,
    handleStartEdit,
    handleCancelEdit,
    handleEditNameChange,
    handleConfirmEdit,
    isUpdating,
  };
}
