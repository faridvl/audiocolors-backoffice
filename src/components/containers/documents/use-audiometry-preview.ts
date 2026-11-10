import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useAudiometryEntriesQuery,
  useAudiometryEntryQuery,
} from '@/shared/api/querys/patient-audiometry-entries-query';
import { usePatientQuery } from '@/shared/api/querys/get-patient-query';
import { useEscapeKey } from '@/hooks/use-escape-key';
import { useResolveAuthorLabel } from '@/hooks/use-resolve-author-label';
import { useAuthorSignatureName } from '@/hooks/use-author-signature-name';
import { useSession } from '@/hooks/use-session';
import { calculateAge, formatCalendarDate, formatDateTime } from '@/shared/utils/formatters';
import { printWithFileName, waitForImages } from '@/shared/utils/print-document';
import { buildPrintFileName } from '@/shared/utils/print-file-name';
import { TEXT } from '@/static/texts/i18n';
import {
  AudiometryInvalidationNotice,
  PrintReportHeader,
} from '../patients/patient-audiometry/use-audiometry-poc';
import { buildSummaryAudiometry } from '../patients/patient-summary/summary-print-data';

// Ancho de una hoja A4 (210 mm) a 96 dpi y aire a los lados en pantalla angosta.
const SHEET_WIDTH_PX = 794;
const SIDE_GUTTER_PX = 16;
const FULL_ZOOM = 1;

interface UseAudiometryPreviewParams {
  patientUuid: string;
  entryUuid: string;
  onClose: () => void;
}

export function useAudiometryPreview({
  patientUuid,
  entryUuid,
  onClose,
}: UseAudiometryPreviewParams) {
  const { t } = useTranslation();
  const resolveAuthorLabel = useResolveAuthorLabel();
  const { tenant } = useSession();
  const { data: patient } = usePatientQuery(patientUuid);
  const entryQuery = useAudiometryEntryQuery(patientUuid, entryUuid);
  // La marca de "mal hecha" puede cambiar después de guardada: se toma siempre de la lista.
  const { data: entries } = useAudiometryEntriesQuery(patientUuid);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(FULL_ZOOM);
  const [isPreparingPrint, setIsPreparingPrint] = useState(false);

  useEscapeKey(onClose);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return undefined;
    const fit = () => {
      const fitZoom = (element.clientWidth - SIDE_GUTTER_PX * 2) / SHEET_WIDTH_PX;
      setZoom(Math.min(FULL_ZOOM, Math.max(0, fitZoom)));
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const header: PrintReportHeader = {
    clinicName: tenant?.businessName ?? '',
    clinicLogoUrl: tenant?.logoUrl ?? null,
    patientName: patient ? `${patient.firstName} ${patient.lastName}`.trim() : '',
    patientDocumentId: patient?.documentId ?? '',
    patientAge: calculateAge(patient?.birthDate),
    patientBirthDate: formatCalendarDate(patient?.birthDate),
  };

  const entry = entryQuery.data;
  const { signatureName, isLoading: isSignatureLoading } = useAuthorSignatureName(
    entry?.createdByUuid,
    entry?.createdByName,
  );
  const listItem = entries?.find((item) => item.uuid === entryUuid);
  const invalidation: AudiometryInvalidationNotice | null = listItem?.invalidatedAt
    ? {
        author: resolveAuthorLabel(listItem.invalidatedByUuid ?? '', listItem.invalidatedByName),
        date: formatDateTime(listItem.invalidatedAt),
        reason: listItem.invalidationReason ?? '',
      }
    : null;
  const report = entry
    ? buildSummaryAudiometry(
        entry,
        header,
        resolveAuthorLabel(entry.createdByUuid ?? '', entry.createdByName),
      )
    : null;

  const print = async () => {
    setIsPreparingPrint(true);
    await waitForImages(document);
    setIsPreparingPrint(false);
    printWithFileName(
      buildPrintFileName({
        type: t(TEXT.DOCUMENTS.AUDIOMETRY.NAME),
        clinic: header.clinicName,
        patient: header.patientName,
        documentId: header.patientDocumentId,
      }),
    );
  };

  return {
    scrollRef,
    zoom,
    report,
    signatureName,
    isSignatureLoading,
    invalidation,
    isLoading: entryQuery.isLoading,
    isError: entryQuery.isError,
    refetch: () => void entryQuery.refetch(),
    isPreparingPrint,
    print,
  };
}
