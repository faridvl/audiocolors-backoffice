import { useQueries, useQuery } from '@tanstack/react-query';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import {
  DocumentTemplate,
  DocumentTemplateSummary,
} from '@/types/document-templates/document-template';

export const FETCH_DOCUMENT_TEMPLATES_KEY = 'fetchDocumentTemplates';
export const FETCH_DOCUMENT_TEMPLATE_KEY = 'fetchDocumentTemplate';

export function useDocumentTemplatesQuery() {
  return useQuery({
    queryKey: [FETCH_DOCUMENT_TEMPLATES_KEY],
    queryFn: () =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).get<DocumentTemplateSummary[]>(
        '/document-templates',
      ),
  });
}

/** El contenido completo de una plantilla; sin `templateUuid` no consulta (plantilla nueva). */
export function useDocumentTemplateQuery(templateUuid: string | null) {
  return useQuery({
    queryKey: [FETCH_DOCUMENT_TEMPLATE_KEY, templateUuid],
    queryFn: () =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).get<DocumentTemplate>(
        `/document-templates/${templateUuid}`,
      ),
    enabled: templateUuid !== null,
    // El editor parte de una copia: que no se vuelva a pedir mientras se escribe.
    staleTime: Infinity,
    gcTime: 0,
  });
}

/** El contenido de varias plantillas a la vez (el resumen del paciente); sin uuids no consulta. */
export function useDocumentTemplatesContentQueries(templateUuids: string[]) {
  return useQueries({
    queries: templateUuids.map((templateUuid) => ({
      queryKey: [FETCH_DOCUMENT_TEMPLATE_KEY, templateUuid],
      queryFn: () =>
        ApiServiceClient(env.API.MEDICAL_RECORDS_URL).get<DocumentTemplate>(
          `/document-templates/${templateUuid}`,
        ),
      staleTime: Infinity,
    })),
  });
}
