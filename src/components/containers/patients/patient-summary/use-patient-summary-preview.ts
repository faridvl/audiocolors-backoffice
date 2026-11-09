import { useCallback, useEffect, useRef, useState } from 'react';
import { useEscapeKey } from '@/hooks/use-escape-key';
import { printWithFileName, waitForImages } from '@/shared/utils/print-document';

// Ancho de una hoja A4 (210 mm) a 96 dpi y aire a los lados en pantalla angosta.
const SHEET_WIDTH_PX = 794;
const SIDE_GUTTER_PX = 16;
const FULL_ZOOM = 1;

interface UsePatientSummaryPreviewParams {
  /** Título del documento: con él el navegador propone el nombre del PDF. */
  fileName: string;
  onClose: () => void;
}

export function usePatientSummaryPreview({ fileName, onClose }: UsePatientSummaryPreviewParams) {
  const scrollRef = useRef<HTMLDivElement>(null);
  // Las correcciones viven en el DOM; aquí solo se anota que existen, sin re-pintar la hoja.
  const hasEditsRef = useRef(false);
  const [isConfirmingLeave, setIsConfirmingLeave] = useState(false);
  const [zoom, setZoom] = useState(FULL_ZOOM);
  const [isPreparingPrint, setIsPreparingPrint] = useState(false);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return undefined;
    const fit = () =>
      setZoom(Math.min(FULL_ZOOM, (element.clientWidth - SIDE_GUTTER_PX * 2) / SHEET_WIDTH_PX));
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const markEdited = useCallback(() => {
    hasEditsRef.current = true;
  }, []);

  const requestClose = useCallback(() => {
    if (hasEditsRef.current) setIsConfirmingLeave(true);
    else onClose();
  }, [onClose]);

  useEscapeKey(requestClose, !isConfirmingLeave);

  const print = async () => {
    setIsPreparingPrint(true);
    await waitForImages(document);
    setIsPreparingPrint(false);
    printWithFileName(fileName);
  };

  return {
    scrollRef,
    zoom,
    isConfirmingLeave,
    isPreparingPrint,
    markEdited,
    requestClose,
    keepEditing: () => setIsConfirmingLeave(false),
    print,
  };
}
