import { useCallback, useEffect, useRef, useState } from "react";
import { useEscapeKey } from "@/hooks/use-escape-key";
import { setMainScrollTop } from "@/shared/utils/main-scroll";

export const VIEW_EXAMPLE_BUTTON_ID = "document-template-view-example";

enum DocumentTemplateMode {
  EDIT = "EDIT",
  PREVIEW = "PREVIEW",
}

/**
 * Alterna entre editar y ver la vista previa en la misma página. La vista previa parte de arriba;
 * al volver el foco queda en el botón "Vista previa".
 */
export function useDocumentTemplateMode() {
  const [mode, setMode] = useState(DocumentTemplateMode.EDIT);
  const isPreview = mode === DocumentTemplateMode.PREVIEW;
  const wasPreviewRef = useRef(false);

  const handleShowPreview = useCallback(
    () => setMode(DocumentTemplateMode.PREVIEW),
    [],
  );
  const handleShowEditor = useCallback(
    () => setMode(DocumentTemplateMode.EDIT),
    [],
  );

  useEffect(() => {
    if (isPreview) {
      setMainScrollTop(0);
    } else if (wasPreviewRef.current) {
      document
        .getElementById(VIEW_EXAMPLE_BUTTON_ID)
        ?.focus({ preventScroll: true });
    }
    wasPreviewRef.current = isPreview;
  }, [isPreview]);

  useEscapeKey(handleShowEditor, isPreview);

  return { isPreview, handleShowPreview, handleShowEditor };
}
