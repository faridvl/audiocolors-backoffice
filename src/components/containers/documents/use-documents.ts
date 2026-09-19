import { useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ALL_CATEGORIES_FILTER,
  DocumentCategory,
  DocumentFilter,
  DocumentItem,
  DocumentKind,
  DOCUMENT_CATEGORY_LABELS,
  DOCUMENT_NAME_MAX_LENGTH,
  PatientDocument,
} from '@/types/documents/document.types';
import {
  usePatientDocumentsQuery,
  FETCH_PATIENT_DOCUMENTS_KEY,
} from '@/shared/api/querys/patient-documents-query';
import { useUploadDocumentMutation } from '@/shared/api/mutations/documents/upload-document-mutation';
import { useDeleteDocumentMutation } from '@/shared/api/mutations/documents/delete-document-mutation';
import { useRenameDocumentMutation } from '@/shared/api/mutations/documents/rename-document-mutation';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { formatDate, formatFileSize } from '@/shared/utils/formatters';

/** Solo se pagina en movil: el grid de escritorio ya muestra varias columnas a la vez. */
const MOBILE_PAGE_SIZE = 5;

/**
 * Sin restriccion de tipo: los equipos de audiometria de cada clinica
 * exportan en formatos distintos (PDF, imagen, o algo propio del
 * fabricante) y no vale la pena bloquear al medico por un tipo que no se
 * previsualiza — el visor ya cae con gracia a "Abrir archivo" para lo que
 * no es imagen o PDF. Limite de tamano: 20 MB por archivo.
 */
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];

/**
 * El tipo de archivo se decide por la URL (el archivo real en R2), nunca por
 * `name`: el nombre se puede editar libremente y el archivo subyacente no
 * cambia, así que basarse en el nombre rompería el preview en cuanto alguien
 * renombrara un PDF sin dejarle la extensión .pdf.
 */
function resolveDocumentKind(url: string): DocumentKind {
  const target = url.toLowerCase();

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
    kind: resolveDocumentKind(document.url),
    uploadedAtLabel: formatDate(document.uploadedAt),
    uploadedByUuid: document.uploadedByUuid,
    uploadedByName: document.uploadedByName,
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
  const [documentToRename, setDocumentToRename] = useState<DocumentItem | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [page, setPage] = useState(1);

  const isMobile = useIsMobile();
  const { data, isLoading, isError, refetch } = usePatientDocumentsQuery(patientUuid);
  const { executeUploadDocument, isPending: isUploading } = useUploadDocumentMutation();
  const { executeDeleteDocument, isPending: isDeleting } = useDeleteDocumentMutation();
  const { executeRenameDocument, isPending: isRenaming } = useRenameDocumentMutation();

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
    ? filteredDocuments.slice(
        (currentPage - 1) * MOBILE_PAGE_SIZE,
        currentPage * MOBILE_PAGE_SIZE,
      )
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
      toast.error('El archivo supera el límite de 20 MB');
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

  const handleStartRename = (document: DocumentItem) => {
    setDocumentToRename(document);
    setRenameValue(document.name);
  };

  const handleCancelRename = () => {
    setDocumentToRename(null);
    setRenameValue('');
  };

  const handleRenameValueChange = (value: string) =>
    setRenameValue(value.slice(0, DOCUMENT_NAME_MAX_LENGTH));

  const handleConfirmRename = () => {
    if (!documentToRename) return;

    const trimmedName = renameValue.trim();

    if (!trimmedName) {
      toast.error('El nombre no puede estar vacío');
      return;
    }

    executeRenameDocument(
      { patientUuid, documentUuid: documentToRename.uuid, originalName: trimmedName },
      {
        onSuccess: () => {
          toast.success('Archivo renombrado');
          handleCancelRename();
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
    documentToRename,
    renameValue,
    handleStartRename,
    handleCancelRename,
    handleRenameValueChange,
    handleConfirmRename,
    isRenaming,
  };
}
