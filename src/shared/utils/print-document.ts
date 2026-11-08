/**
 * Abre la ventana de impresión con `fileName` como título de la página (el navegador lo propone
 * como nombre del archivo). Al terminar o cancelar, lo que llegue primero entre `afterprint`, el
 * paso de la media `print` a pantalla y, como último recurso, el regreso del foco, restaura el
 * título y llama `onFinish`. Devuelve una función que hace la misma limpieza antes de tiempo.
 */
export function printWithFileName(fileName: string, onFinish?: () => void): () => void {
  const previousTitle = document.title;
  const printMedia = window.matchMedia('print');
  let isFinished = false;

  const finish = () => {
    if (isFinished) return;
    isFinished = true;
    window.removeEventListener('afterprint', finish);
    window.removeEventListener('focus', finish);
    printMedia.removeEventListener('change', onMediaChange);
    document.title = previousTitle;
    onFinish?.();
  };
  function onMediaChange(event: MediaQueryListEvent) {
    if (!event.matches) finish();
  }

  if (fileName) document.title = fileName;
  window.addEventListener('afterprint', finish);
  printMedia.addEventListener('change', onMediaChange);
  window.print();
  // `focus` solo dispara si la ventana perdió el foco, es decir, si el diálogo llegó a abrirse.
  if (!isFinished) window.addEventListener('focus', finish);
  return finish;
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
