import { AudiometryEntryListItem } from '@/types/patients/audiometry-entry';
import { DocumentItem, PatientDocument } from '@/types/documents/document.types';
import { formatDateTime } from '@/shared/utils/formatters';
import { mapToDocumentItem } from './document-items';

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
  /** Solo si la audiometría está marcada como mal hecha. */
  invalidationReason: string | null;
  isInvalidated: boolean;
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
    // Una lista vieja o en caché puede no traer la marca: `!= null` cubre null y undefined.
    isInvalidated: entry.invalidatedAt != null,
    invalidationReason: entry.invalidationReason ?? null,
  };
}

/** De la más reciente a la más antigua; una fecha ilegible queda al final. */
export function sortArchiveItems(items: ArchiveItem[]): ArchiveItem[] {
  const timeOf = (item: ArchiveItem) => (Number.isNaN(item.sortTime) ? -Infinity : item.sortTime);
  return [...items].sort((a, b) => timeOf(b) - timeOf(a));
}
