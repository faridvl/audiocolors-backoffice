import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";

/** Se empieza a dibujar una página un poco antes de que entre en pantalla. */
const VISIBILITY_MARGIN = "600px 0px";
/** Más de 3 píxeles por píxel de pantalla no se nota y gasta memoria (iOS limita el tamaño del canvas). */
const MAX_PIXEL_RATIO = 3;
/** Espera tras el último cambio de tamaño antes de volver a dibujar la página. */
const RESIZE_DEBOUNCE_MS = 150;

interface UsePdfPageCanvasParams {
  pdfDocument: PDFDocumentProxy;
  pageNumber: number;
}

/** Dibuja una página del PDF en un canvas: solo cuando está cerca de verse y de nuevo si cambia su ancho real en pantalla. */
export function usePdfPageCanvas({
  pdfDocument,
  pageNumber,
}: UsePdfPageCanvasParams) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);
  const [cssWidth, setCssWidth] = useState(0);
  // El dibujo anterior debe terminar antes de empezar otro sobre el mismo canvas.
  const lastRenderRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: VISIBILITY_MARGIN },
    );
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setCssWidth(width), RESIZE_DEBOUNCE_MS);
    });
    setCssWidth(canvas.clientWidth);
    observer.observe(canvas);
    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!isNearViewport || !canvas || cssWidth <= 0) return undefined;
    let isCancelled = false;
    let renderTask: RenderTask | null = null;

    const previousRender = lastRenderRef.current;
    const render = async () => {
      await previousRender;
      if (isCancelled) return;
      const page = await pdfDocument.getPage(pageNumber);
      const baseViewport = page.getViewport({ scale: 1 });
      const pixelRatio = Math.min(
        window.devicePixelRatio || 1,
        MAX_PIXEL_RATIO,
      );
      const viewport = page.getViewport({
        scale: (cssWidth * pixelRatio) / baseViewport.width,
      });
      const context = canvas.getContext("2d");
      if (isCancelled || !context) return;
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      renderTask = page.render({ canvasContext: context, viewport });
      await renderTask.promise;
    };

    lastRenderRef.current = render().catch(() => undefined);
    return () => {
      isCancelled = true;
      renderTask?.cancel();
    };
  }, [pdfDocument, pageNumber, cssWidth, isNearViewport]);

  return { canvasRef };
}
