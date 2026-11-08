import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSession } from '@/hooks/use-session';
import { buildDocumentTemplatePdf, loadDocumentLogo } from '@/shared/utils/document-template-pdf';
import { fillVariables } from '@/shared/utils/document-template-text';
import { TEXT } from '@/static/texts/i18n';
import { DOCUMENT_TEMPLATE_VARIABLES } from '@/types/document-templates/document-template';

/** Logo que se usa en el pie cuando la clínica no subió el suyo. */
const FALLBACK_LOGO_URL = '/logo-audiocolors.png';

/** Arma el PDF de ejemplo de `content` con datos inventados. */
export function useDocumentTemplateExample(content: string) {
  const { t } = useTranslation();
  const { tenant } = useSession();
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [isError, setIsError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const clinicName = tenant?.businessName ?? '';
  const logoUrl = tenant?.logoUrl ?? FALLBACK_LOGO_URL;

  useEffect(() => {
    let isCancelled = false;
    const examples = Object.fromEntries(
      DOCUMENT_TEMPLATE_VARIABLES.map((variable) => [
        variable,
        t(`${TEXT.DOCUMENT_TEMPLATES.VARIABLES.ITEM_PREFIX}.${variable}.example`),
      ]),
    );

    const build = async () => {
      try {
        const logo = await loadDocumentLogo(logoUrl);
        const blob = await buildDocumentTemplatePdf({
          content: fillVariables(content, examples),
          clinicName,
          logo,
          pageLabel: (page, total) => t(TEXT.DOCUMENT_TEMPLATES.EXAMPLE.PAGE_OF, { page, total }),
        });
        if (isCancelled) return;
        setPdfBlob(blob);
      } catch {
        if (!isCancelled) setIsError(true);
      }
    };
    void build();

    return () => {
      isCancelled = true;
    };
  }, [content, clinicName, logoUrl, t, attempt]);

  const retry = useCallback(() => {
    setPdfBlob(null);
    setIsError(false);
    setAttempt((current) => current + 1);
  }, []);

  return { pdfBlob, isLoading: pdfBlob === null && !isError, isError, retry };
}
