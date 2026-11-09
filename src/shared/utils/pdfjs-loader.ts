import type * as PdfJs from "pdfjs-dist";

/**
 * pdf.js se carga solo en el navegador y a pedido: pesa mucho y toca `window` al importarse.
 * El worker se resuelve con `new URL`, que webpack emite como archivo estático en dev y en build.
 */
export async function loadPdfjs(): Promise<typeof PdfJs> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.js",
    import.meta.url,
  ).toString();
  return pdfjs;
}

export interface PdfWorkerHandle {
  worker: PdfJs.PDFWorker;
  /** Rechaza si el archivo del worker no se pudo cargar o el worker se cayó. */
  failure: Promise<never>;
  destroy: () => void;
}

/**
 * Un worker propio por intento. Si pdf.js crea el suyo y no carga, guarda para siempre el
 * fallo de su worker de respaldo y ningún reintento se recupera; con uno propio, reintentar parte de cero.
 */
export function createPdfWorker(pdfjs: typeof PdfJs): PdfWorkerHandle {
  const port = new Worker(pdfjs.GlobalWorkerOptions.workerSrc);
  const worker: PdfJs.PDFWorker = pdfjs.PDFWorker.fromPort({ port });
  const failure = new Promise<never>((_, reject) => {
    port.addEventListener(
      "error",
      () => reject(new Error("pdf.js worker failed")),
      { once: true },
    );
  });
  failure.catch(() => undefined);
  return {
    worker,
    failure,
    destroy: () => {
      worker.destroy();
      port.terminate();
    },
  };
}
