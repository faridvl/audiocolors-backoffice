import { useCallback, useEffect, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { TEXT } from "@/static/texts/i18n";
import { useTranslation } from "react-i18next";
import { buildDownloadFileName } from "@/shared/utils/file-name";
import { createPdfWorker, loadPdfjs } from "@/shared/utils/pdfjs-loader";
import { useDocumentTemplateExample } from "./use-document-template-example";

export interface PdfPageSize {
  width: number;
  height: number;
}

/** Vista previa en pantalla del PDF de ejemplo: el documento de pdf.js, el tamaño de las hojas y la descarga. */
export function useDocumentTemplatePreview(
  content: string,
  templateName: string,
) {
  const { t } = useTranslation();
  const {
    pdfBlob,
    isLoading: isBuilding,
    isError: isBuildError,
    retry,
  } = useDocumentTemplateExample(content);
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [pageSizes, setPageSizes] = useState<PdfPageSize[]>([]);
  const [isLoadError, setIsLoadError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    if (!pdfBlob) return undefined;
    let isCancelled = false;
    let destroyResources: (() => Promise<void>) | null = null;

    const load = async () => {
      try {
        const pdfjs = await loadPdfjs();
        const data = new Uint8Array(await pdfBlob.arrayBuffer());
        const pdfWorker = createPdfWorker(pdfjs);
        const loadingTask = pdfjs.getDocument({
          data,
          worker: pdfWorker.worker,
        });
        destroyResources = async () => {
          await loadingTask.destroy();
          pdfWorker.destroy();
        };
        const loadedDocument = await Promise.race([
          loadingTask.promise,
          pdfWorker.failure,
        ]);
        const sizes = await Promise.all(
          Array.from({ length: loadedDocument.numPages }, async (_, index) => {
            const viewport = (
              await loadedDocument.getPage(index + 1)
            ).getViewport({ scale: 1 });
            return { width: viewport.width, height: viewport.height };
          }),
        );
        if (isCancelled) return;
        setPageSizes(sizes);
        setPdfDocument(loadedDocument);
      } catch {
        if (isCancelled) return;
        setIsLoadError(true);
        void destroyResources?.();
      }
    };
    void load();

    return () => {
      isCancelled = true;
      setPdfDocument(null);
      setPageSizes([]);
      void destroyResources?.();
    };
  }, [pdfBlob, loadAttempt]);

  const handleRetry = useCallback(() => {
    setIsLoadError(false);
    if (isBuildError) retry();
    else setLoadAttempt((current) => current + 1);
  }, [isBuildError, retry]);

  const handleDownload = useCallback(() => {
    if (!pdfBlob) return;
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = buildDownloadFileName(
      templateName,
      t(TEXT.DOCUMENT_TEMPLATES.EXAMPLE.UNNAMED),
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, [pdfBlob, templateName, t]);

  return {
    pdfDocument,
    pageSizes,
    isLoading:
      !isBuildError && !isLoadError && (isBuilding || pdfDocument === null),
    isError: isBuildError || isLoadError,
    canDownload: pdfBlob !== null,
    handleRetry,
    handleDownload,
  };
}
