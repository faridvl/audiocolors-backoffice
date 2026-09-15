import { useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ALL_CATEGORIES_FILTER,
  DocumentCategory,
  DocumentFilter,
  DocumentItem,
  DocumentKind,
  DOCUMENT_CATEGORY_LABELS,
  PatientDocument,
} from '@/types/documents/document.types';
import {
  usePatientDocumentsQuery,
  FETCH_PATIENT_DOCUMENTS_KEY,
} from '@/shared/api/querys/patient-documents-query';
import { useUploadDocumentMutation } from '@/shared/api/mutations/documents/upload-document-mutation';
import { useDeleteDocumentMutation } from '@/shared/api/mutations/documents/delete-document-mutation';
import { formatDate, formatFileSize } from '@/shared/utils/formatters';

/** El API acepta imagenes y PDF, con un limite de 20 MB por archivo. */
export const ACCEPTED_MIME_TYPES = 'image/*,application/pdf';
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];

function resolveDocumentKind(name: string, url: string): DocumentKind {
  const target = (name || url).toLowerCase();

  if (target.endsWith('.pdf')) return DocumentKind.PDF;
  if (IMAGE_EXTENSIONS.some((extension) => target.endsWith(extension))) return DocumentKind.IMAGE;

  return DocumentKind.OTHER;
}

function mapToDocumentItem(document: PatientDocument): DocumentItem {
  const category = DOCUMENT_CATEGORY_LABELS[document.category]
    ? document.category
    : DocumentCategory.OTHER;

  return {
    uuid: document.uuid,
    name: document.originalName,
    url: document.url,
    category,
    categoryLabel: DOCUMENT_CATEGORY_LABELS[category],
    kind: resolveDocumentKind(document.originalName, document.url),
    uploadedAtLabel: formatDate(document.uploadedAt),
    sizeLabel: formatFileSize(document.size),
  };
}

export function useDocuments(patientUuid: string) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [filter, setFilter] = useState<DocumentFilter>(ALL_CATEGORIES_FILTER);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>(
    DocumentCategory.OTHER,
  );
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewDocument, setPreviewDocument] = useState<DocumentItem | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<DocumentItem | null>(null);

  const { data, isLoading, isError, refetch } = usePatientDocumentsQuery(patientUuid);
  const { executeUploadDocument, isPending: isUploading } = useUploadDocumentMutation();
  const { executeDeleteDocument, isPending: isDeleting } = useDeleteDocumentMutation();

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

  const invalidateDocuments = () =>
    queryClient.invalidateQueries({ queryKey: [FETCH_PATIENT_DOCUMENTS_KEY, patientUuid] });

  const openFilePicker = () => fileInputRef.current?.click();

  const handleFileSelected = (file: File | null) => {
    if (!file) {
      setPendingFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error('El archivo supera el limite de 20 MB');
      return;
    }

    setPendingFile(file);
  };

  const clearPendingFile = () => {
    setPendingFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = () => {
    if (!pendingFile) {
      openFilePicker();
      return;
    }

    executeUploadDocument(
      { patientUuid, file: pendingFile, category: selectedCategory },
      {
        onSuccess: () => {
          toast.success('Archivo subido');
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
          toast.success('Archivo eliminado');
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

  return {
    documents: filteredDocuments,
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
    pendingFile,
    handleFileSelected,
    clearPendingFile,
    fileInputRef,
    openFilePicker,
    handleUpload,
    isUploading,
    previewDocument,
    setPreviewDocument,
    documentToDelete,
    setDocumentToDelete,
    handleConfirmDelete,
    isDeleting,
  };
}
