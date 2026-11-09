import {
  AudiometryTypeCode,
  ScreeningResult,
} from '@/components/containers/patients/patient-audiometry/audiometry-constants';
import { AudiometryEntryListItem } from '@/types/patients/audiometry-entry';
import { DocumentCategory, DocumentItem, PatientDocument } from '@/types/documents/document.types';
import { formatDateTime } from '@/shared/utils/formatters';
import { sortArchiveItems } from './archive-sort';
import { mapToDocumentItem } from './document-items';

// Las audiometrías no son archivos subidos, pero se listan y se filtran como Pruebas.
export const AUDIOMETRY_ARCHIVE_CATEGORY = DocumentCategory.EXTERNAL_TEST;

export enum ArchiveItemType {
  FILE = 'FILE',
  AUDIOMETRY = 'AUDIOMETRY',
}

export interface FileArchiveItem {
  type: ArchiveItemType.FILE;
  uuid: string;
  displayName: string;
  sortTime: number;
  document: DocumentItem;
}

export interface AudiometryArchiveItem {
  type: ArchiveItemType.AUDIOMETRY;
  uuid: string;
  displayName: string;
  sortTime: number;
  dateLabel: string;
  ptaRight: number | null;
  ptaLeft: number | null;
  createdByUuid: string;
  createdByName: string | null;
  typeCode: AudiometryTypeCode;
  typeName: string;
  /** Solo en rastreo. */
  screeningResult: ScreeningResult | null;
}

/** Lo que muestra la pestaña Archivos: archivos subidos y audiometrías guardadas, en una sola lista. */
export type ArchiveItem = FileArchiveItem | AudiometryArchiveItem;

export function mapFileToArchiveItem(file: PatientDocument): FileArchiveItem {
  const document = mapToDocumentItem(file);
  return {
    type: ArchiveItemType.FILE,
    uuid: document.uuid,
    displayName: document.displayName,
    sortTime: Date.parse(file.uploadedAt),
    document,
  };
}

export function mapAudiometryToArchiveItem(
  entry: AudiometryEntryListItem,
  displayName: string,
): AudiometryArchiveItem {
  return {
    type: ArchiveItemType.AUDIOMETRY,
    uuid: entry.uuid,
    displayName,
    sortTime: Date.parse(entry.createdAt),
    dateLabel: formatDateTime(entry.createdAt),
    ptaRight: entry.ptaRight ?? null,
    ptaLeft: entry.ptaLeft ?? null,
    createdByUuid: entry.createdByUuid ?? '',
    createdByName: entry.createdByName,
    typeCode: entry.typeCode,
    typeName: entry.typeName,
    screeningResult: entry.screeningResult ?? null,
  };
}

export { sortArchiveItems };
