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
import { useTranslation } from 'react-i18next';
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
import { Pagination } from '@/components/common/table/pagination';
import { tailwind } from '@/utils/tailwind-utils';
import { useResolveAuthorLabel } from '@/hooks/use-resolve-author-label';
import { useDocuments } from './use-documents';
import { DocumentPreviewModal } from './document-preview-modal';
import { ConfirmDeleteModal } from './confirm-delete-modal';
import { EditDocumentModal } from './edit-document-modal';
import { TEXT } from '@/static/texts/i18n';

const KIND_ICONS: Record<DocumentKind, React.ComponentType<{ className?: string }>> = {
  [DocumentKind.IMAGE]: ImageIcon,
  [DocumentKind.PDF]: FileText,
  [DocumentKind.OTHER]: FileIcon,
};

const CATEGORY_FILTER_OPTIONS = Object.values(DocumentCategory).map((category) => ({
  label: DOCUMENT_CATEGORY_LABELS[category],
  value: category,
}));

const CARD_ACTION_CLASSES =
  'flex h-11 w-11 items-center justify-center rounded-lg text-ink-400 transition-colors';

interface DocumentCardProps {
  document: DocumentItem;
  authorLabel: string;
  onPreview: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  authorLabel,
  onPreview,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();
  const Icon = KIND_ICONS[document.kind];

  return (
    <div className="group flex flex-col overflow-hidden rounded-card border border-ink-200 bg-white transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3 p-4 pb-0">
        <button
          type="button"
          onClick={onPreview}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50">
            <Icon className="h-4 w-4 text-brand-600" />
          </span>
          <Typography variant={TypographyVariant.HELPER} className="min-w-0 truncate text-ink-700">
            {document.name}
          </Typography>
        </button>

        <div className="-mr-3 -mt-3 flex shrink-0 items-center">
          <button
            type="button"
            onClick={onEdit}
            aria-label={t(TEXT.DOCUMENTS.LIST.EDIT_LABEL, { name: document.name })}
            className={tailwind(CARD_ACTION_CLASSES, 'hover:bg-brand-50 hover:text-brand-600')}
          >
            <Pencil className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={t(TEXT.DOCUMENTS.LIST.DELETE_LABEL, { name: document.name })}
            className={tailwind(CARD_ACTION_CLASSES, 'hover:bg-danger/10 hover:text-danger')}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onPreview}
        className="flex flex-1 flex-col items-start gap-1.5 p-4 pt-3 text-left"
      >
        <Typography variant={TypographyVariant.HELPER}>
          {document.categoryLabel} &middot; {document.sizeLabel}
        </Typography>
        <Typography variant={TypographyVariant.HELPER}>{document.uploadedAtLabel}</Typography>
        <Typography variant={TypographyVariant.HELPER}>
          {t(TEXT.DOCUMENTS.LIST.REGISTERED_BY)} <span className="italic">{authorLabel}</span>
        </Typography>
      </button>
    </div>
  );
};

interface DocumentsContainerProps {
  patientUuid: string;
}

export const DocumentsContainer: React.FC<DocumentsContainerProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const {
    documents,
    filteredCount,
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
    pendingFileBaseName,
    handlePendingFileBaseNameChange,
    handleFileSelected,
    clearPendingFile,
    fileInputRef,
    openFilePicker,
    handleUpload,
    isUploading,
    previewDocument,
    previewRotationDegrees,
    handleOpenPreview,
    handleClosePreview,
    handleRotatePreview,
    documentToDelete,
    setDocumentToDelete,
    handleConfirmDelete,
    isDeleting,
    documentToEdit,
    editName,
    editCategory,
    handleStartEdit,
    handleCancelEdit,
    handleEditNameChange,
    handleEditCategoryChange,
    handleConfirmEdit,
    isUpdating,
    page,
    totalPages,
    handlePageChange,
  } = useDocuments(patientUuid);

  const resolveAuthorLabel = useResolveAuthorLabel();
  const filterOptions = [
    { label: t(TEXT.DOCUMENTS.LIST.FILTER_ALL), value: ALL_CATEGORIES_FILTER },
    ...CATEGORY_FILTER_OPTIONS,
  ];

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <Typography variant={TypographyVariant.SUBTITLE}>
          {t(TEXT.DOCUMENTS.TITLE)}{' '}
          {totalCount > 0 && <span className="text-ink-400">({totalCount})</span>}
        </Typography>

        <Button
          variant={ButtonVariant.PRIMARY}
          onClick={openFilePicker}
          icon={<Upload className="h-4 w-4" aria-hidden />}
          className="shrink-0"
        >
          <span className="hidden sm:inline">{t(TEXT.DOCUMENTS.UPLOAD.BUTTON)}</span>
          <span className="sm:hidden">{t(TEXT.DOCUMENTS.UPLOAD.BUTTON_SHORT)}</span>
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(event) => handleFileSelected(event.target.files?.[0] ?? null)}
      />

      {pendingFile && (
        <div className="flex flex-col gap-3 rounded-card border border-brand-200 bg-brand-50 p-4 sm:flex-row sm:items-end">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <label htmlFor="document-upload-name">
              <Typography variant={TypographyVariant.HELPER}>
                {t(TEXT.DOCUMENTS.UPLOAD.NAME_LABEL)}
              </Typography>
            </label>
            {/* La extensión no se muestra, pero el hook la vuelve a agregar al subir. */}
            <input
              id="document-upload-name"
              type="text"
              value={pendingFileBaseName}
              onChange={(event) => handlePendingFileBaseNameChange(event.target.value)}
              autoFocus
              className={tailwind(inputBaseClasses, 'min-w-0')}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !isUploading) handleUpload();
              }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="document-category">
              <Typography variant={TypographyVariant.HELPER}>
                {t(TEXT.DOCUMENTS.FIELDS.CATEGORY)}
              </Typography>
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
              {t(TEXT.GENERAL.BUTTONS.CANCEL)}
            </Button>
            <Button variant={ButtonVariant.PRIMARY} onClick={handleUpload} isLoading={isUploading}>
              {t(TEXT.DOCUMENTS.UPLOAD.CONFIRM)}
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
              placeholder={t(TEXT.DOCUMENTS.LIST.SEARCH_PLACEHOLDER)}
              aria-label={t(TEXT.DOCUMENTS.LIST.SEARCH_LABEL)}
              className={tailwind(inputBaseClasses, 'pl-9')}
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {filterOptions.map((option) => (
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
          <Typography variant={TypographyVariant.BODY}>{t(TEXT.DOCUMENTS.LIST.LOADING)}</Typography>
        </div>
      )}

      {isError && !isLoading && (
        <div className="flex flex-col items-center gap-2 rounded-card border border-ink-200 bg-white py-14 text-center">
          <AlertTriangle className="h-8 w-8 text-danger" aria-hidden />
          <Typography variant={TypographyVariant.ACCENT}>{t(TEXT.DOCUMENTS.LIST.ERROR)}</Typography>
          <Button variant={ButtonVariant.SECONDARY} onClick={() => refetch()} className="mt-2">
            {t(TEXT.GENERAL.BUTTONS.RETRY)}
          </Button>
        </div>
      )}

      {!isLoading && !isError && !filteredCount && (
        <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-ink-300 bg-white py-14 text-center">
          <FolderOpen className="h-8 w-8 text-ink-300" aria-hidden />
          <Typography variant={TypographyVariant.ACCENT}>
            {t(totalCount ? TEXT.DOCUMENTS.LIST.NO_RESULTS_TITLE : TEXT.DOCUMENTS.LIST.EMPTY_TITLE)}
          </Typography>
          <Typography variant={TypographyVariant.BODY}>
            {t(
              totalCount
                ? TEXT.DOCUMENTS.LIST.NO_RESULTS_DESCRIPTION
                : TEXT.DOCUMENTS.LIST.EMPTY_DESCRIPTION,
            )}
          </Typography>
        </div>
      )}

      {!isLoading && !isError && filteredCount > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {documents.map((document) => (
            <DocumentCard
              key={document.uuid}
              document={document}
              authorLabel={resolveAuthorLabel(document.uploadedByUuid, document.uploadedByName)}
              onPreview={() => handleOpenPreview(document)}
              onEdit={() => handleStartEdit(document)}
              onDelete={() => setDocumentToDelete(document)}
            />
          ))}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        total={filteredCount}
        onPageChange={handlePageChange}
      />

      <DocumentPreviewModal
        document={previewDocument}
        rotationDegrees={previewRotationDegrees}
        onRotate={handleRotatePreview}
        onClose={handleClosePreview}
      />

      <ConfirmDeleteModal
        fileName={documentToDelete?.name ?? null}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDocumentToDelete(null)}
      />

      <EditDocumentModal
        isOpen={!!documentToEdit}
        name={editName}
        category={editCategory}
        isSaving={isUpdating}
        onNameChange={handleEditNameChange}
        onCategoryChange={handleEditCategoryChange}
        onConfirm={handleConfirmEdit}
        onCancel={handleCancelEdit}
      />
    </section>
  );
};
