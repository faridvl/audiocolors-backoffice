/**
 * Abre la ventana de impresión con `fileName` como título de la página (el navegador lo propone
 * como nombre del archivo) y lo restaura al terminar o cancelar. `onAfterPrint` corre en ese momento.
 */
export function printWithFileName(fileName: string, onAfterPrint?: () => void) {
  const previousTitle = document.title;
  const restore = () => {
    window.removeEventListener('afterprint', restore);
    document.title = previousTitle;
    onAfterPrint?.();
  };

  if (fileName) document.title = fileName;
  window.addEventListener('afterprint', restore);
  window.print();
}

const IMAGE_WAIT_TIMEOUT_MS = 3000;

/** Espera a que las imágenes de `root` terminen de cargar (o fallen) para que salgan al imprimir. */
export function waitForImages(root: ParentNode): Promise<void> {
  const pending = Array.from(root.querySelectorAll('img')).filter((image) => !image.complete);
  if (pending.length === 0) return Promise.resolve();

  const loaded = Promise.all(
    pending.map(
      (image) =>
        new Promise<void>((resolve) => {
          image.addEventListener('load', () => resolve(), { once: true });
          image.addEventListener('error', () => resolve(), { once: true });
        }),
    ),
  ).then(() => undefined);
  const timeout = new Promise<void>((resolve) => setTimeout(resolve, IMAGE_WAIT_TIMEOUT_MS));
  return Promise.race([loaded, timeout]);
}
