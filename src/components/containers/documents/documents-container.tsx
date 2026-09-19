import React from 'react';
import {
  Search,
  Upload,
  Trash2,
  Pencil,
  FileText,
  Image as ImageIcon,
  File as FileIcon,
  Loader2,
  AlertTriangle,
  FolderOpen,
  X,
} from 'lucide-react';
import {
  ALL_CATEGORIES_FILTER,
  DocumentCategory,
  DocumentItem,
  DocumentKind,
  DOCUMENT_CATEGORY_LABELS,
} from '@/types/documents/document.types';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { inputBaseClasses } from '@/components/common/input/input';
import { tailwind } from '@/utils/tailwind-utils';
import { useResolveAuthorLabel } from '@/hooks/use-resolve-author-label';
import { useDocuments, ACCEPTED_MIME_TYPES } from './use-documents';
import { DocumentPreviewModal } from './document-preview-modal';
import { ConfirmDeleteModal } from './confirm-delete-modal';
import { RenameDocumentModal } from './rename-document-modal';

const KIND_ICONS: Record<DocumentKind, React.ComponentType<{ className?: string }>> = {
  [DocumentKind.IMAGE]: ImageIcon,
  [DocumentKind.PDF]: FileText,
  [DocumentKind.OTHER]: FileIcon,
};

const FILTER_OPTIONS = [
  { label: 'Todos', value: ALL_CATEGORIES_FILTER },
  ...Object.values(DocumentCategory).map((category) => ({
    label: DOCUMENT_CATEGORY_LABELS[category],
    value: category,
  })),
];

interface DocumentCardProps {
  document: DocumentItem;
  authorLabel: string;
  onPreview: () => void;
  onRename: () => void;
  onDelete: () => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  authorLabel,
  onPreview,
  onRename,
  onDelete,
}) => {
  const Icon = KIND_ICONS[document.kind];

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-card border border-ink-200 bg-white transition-shadow hover:shadow-md">
      <button
        type="button"
        onClick={onPreview}
        className="flex flex-1 flex-col items-start gap-3 p-4 text-left"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
          <Icon className="h-5 w-5 text-brand-600" />
        </span>

        <span className="flex min-w-0 flex-col">
          <Typography variant={TypographyVariant.BODY_SEMIBOLD} className="line-clamp-2 break-words">
            {document.name}
          </Typography>
          <Typography variant={TypographyVariant.HELPER} className="mt-1">
            {document.categoryLabel} &middot; {document.sizeLabel}
          </Typography>
          <Typography variant={TypographyVariant.HELPER}>{document.uploadedAtLabel}</Typography>
          <Typography variant={TypographyVariant.HELPER}>{authorLabel}</Typography>
        </span>
      </button>

      <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
        <button
          type="button"
          onClick={onRename}
          aria-label={`Renombrar ${document.name}`}
          className="rounded-lg p-1.5 text-ink-400 hover:bg-brand-50 hover:text-brand-600"
        >
          <Pencil className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Eliminar ${document.name}`}
          className="rounded-lg p-1.5 text-ink-400 hover:bg-danger/10 hover:text-danger"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
};

interface DocumentsContainerProps {
  patientUuid: string;
}

export const DocumentsContainer: React.FC<DocumentsContainerProps> = ({ patientUuid }) => {
  const {
    documents,
    totalCount,
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
    documentToRename,
    renameValue,
    handleStartRename,
    handleCancelRename,
    handleRenameValueChange,
    handleConfirmRename,
    isRenaming,
  } = useDocuments(patientUuid);

  const resolveAuthorLabel = useResolveAuthorLabel();

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <Typography variant={TypographyVariant.SUBTITLE}>
          Archivos {totalCount > 0 && <span className="text-ink-400">({totalCount})</span>}
        </Typography>

        <Button
          variant={ButtonVariant.PRIMARY}
          onClick={openFilePicker}
          icon={<Upload className="h-4 w-4" aria-hidden />}
          className="shrink-0"
        >
          <span className="hidden sm:inline">Subir archivo</span>
          <span className="sm:hidden">Subir</span>
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_MIME_TYPES}
        className="hidden"
        onChange={(event) => handleFileSelected(event.target.files?.[0] ?? null)}
      />

      {pendingFile && (
        <div className="flex flex-col gap-3 rounded-card border border-brand-200 bg-brand-50 p-4 sm:flex-row sm:items-end">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <Typography variant={TypographyVariant.HELPER}>Archivo seleccionado</Typography>
            <Typography variant={TypographyVariant.BODY_SEMIBOLD} className="truncate">
              {pendingFile.name}
            </Typography>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="document-category">
              <Typography variant={TypographyVariant.HELPER}>Categoría</Typography>
            </label>
            <select
              id="document-category"
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value as DocumentCategory)}
              className={tailwind(inputBaseClasses, 'sm:w-48')}
            >
              {Object.values(DocumentCategory).map((category) => (
                <option key={category} value={category}>
                  {DOCUMENT_CATEGORY_LABELS[category]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <Button
              variant={ButtonVariant.SECONDARY}
              onClick={clearPendingFile}
              disabled={isUploading}
              icon={<X className="h-4 w-4" aria-hidden />}
            >
              Cancelar
            </Button>
            <Button variant={ButtonVariant.PRIMARY} onClick={handleUpload} isLoading={isUploading}>
              Confirmar
            </Button>
          </div>
        </div>
      )}

      {totalCount > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative sm:max-w-xs sm:flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
              aria-hidden
            />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar archivo"
              aria-label="Buscar archivos"
              className={tailwind(inputBaseClasses, 'pl-9')}
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {FILTER_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                className={tailwind(
                  'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                  filter === option.value
                    ? 'bg-brand text-white'
                    : 'border border-ink-200 bg-white text-ink-600 hover:bg-ink-50',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center gap-2 rounded-card border border-ink-200 bg-white py-14">
          <Loader2 className="h-5 w-5 animate-spin text-brand" aria-hidden />
          <Typography variant={TypographyVariant.BODY}>Cargando archivos...</Typography>
        </div>
      )}

      {isError && !isLoading && (
        <div className="flex flex-col items-center gap-2 rounded-card border border-ink-200 bg-white py-14 text-center">
          <AlertTriangle className="h-8 w-8 text-danger" aria-hidden />
          <Typography variant={TypographyVariant.ACCENT}>
            No se pudieron cargar los archivos
          </Typography>
          <Button variant={ButtonVariant.SECONDARY} onClick={() => refetch()} className="mt-2">
            Reintentar
          </Button>
        </div>
      )}

      {!isLoading && !isError && !documents.length && (
        <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-ink-300 bg-white py-14 text-center">
          <FolderOpen className="h-8 w-8 text-ink-300" aria-hidden />
          <Typography variant={TypographyVariant.ACCENT}>
            {totalCount ? 'Sin resultados' : 'Aún no hay archivos'}
          </Typography>
          <Typography variant={TypographyVariant.BODY}>
            {totalCount
              ? 'Prueba con otro nombre o cambia el filtro.'
              : 'Sube recetas, audiometrías, facturas o garantias del paciente.'}
          </Typography>
        </div>
      )}

      {!isLoading && !isError && documents.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {documents.map((document) => (
            <DocumentCard
              key={document.uuid}
              document={document}
              authorLabel={resolveAuthorLabel(document.uploadedByUuid)}
              onPreview={() => setPreviewDocument(document)}
              onRename={() => handleStartRename(document)}
              onDelete={() => setDocumentToDelete(document)}
            />
          ))}
        </div>
      )}

      <DocumentPreviewModal document={previewDocument} onClose={() => setPreviewDocument(null)} />

      <ConfirmDeleteModal
        fileName={documentToDelete?.name ?? null}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDocumentToDelete(null)}
      />

      <RenameDocumentModal
        isOpen={!!documentToRename}
        value={renameValue}
        isRenaming={isRenaming}
        onChange={handleRenameValueChange}
        onConfirm={handleConfirmRename}
        onCancel={handleCancelRename}
      />
    </section>
  );
};
