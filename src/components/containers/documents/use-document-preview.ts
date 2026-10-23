import { useState } from 'react';
import { DocumentItem } from '@/types/documents/document.types';

const ROTATION_STEP_DEGREES = 90;
const FULL_TURN_DEGREES = 360;

/** Archivo abierto en el visor y su giro, que vuelve a 0 cada vez que se abre uno. */
export function useDocumentPreview() {
  const [previewDocument, setPreviewDocument] = useState<DocumentItem | null>(null);
  const [previewRotationDegrees, setPreviewRotationDegrees] = useState(0);

  const handleOpenPreview = (document: DocumentItem) => {
    setPreviewRotationDegrees(0);
    setPreviewDocument(document);
  };

  const handleClosePreview = () => setPreviewDocument(null);

  const handleRotatePreview = () =>
    setPreviewRotationDegrees((current) => (current + ROTATION_STEP_DEGREES) % FULL_TURN_DEGREES);

  return {
    previewDocument,
    previewRotationDegrees,
    handleOpenPreview,
    handleClosePreview,
    handleRotatePreview,
  };
}
