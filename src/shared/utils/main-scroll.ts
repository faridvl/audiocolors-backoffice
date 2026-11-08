/** El área que se desplaza en la app es el `<main>` del layout, no la ventana. */
export function setMainScrollTop(top: number): void {
  const scroller = document.querySelector("main");
  if (scroller) scroller.scrollTop = top;
}
