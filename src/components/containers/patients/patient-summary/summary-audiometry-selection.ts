export interface SelectableAudiometry {
  uuid: string;
  createdAt: string;
  invalidatedAt: string | null;
}

const toTime = (isoDate: string): number => new Date(isoDate).getTime();

/** Las marcadas como mal hechas no entran en ningún lado del resumen. */
export const filterValidAudiometries = <T extends SelectableAudiometry>(entries: T[]): T[] =>
  entries.filter((entry) => entry.invalidatedAt === null);

/** Por defecto va la audiometría válida más reciente; sin válidas, ninguna. */
export const resolveDefaultAudiometryUuids = (entries: SelectableAudiometry[]): string[] => {
  const valid = filterValidAudiometries(entries);
  if (valid.length === 0) return [];
  const newest = valid.reduce((latest, entry) =>
    toTime(entry.createdAt) > toTime(latest.createdAt) ? entry : latest,
  );
  return [newest.uuid];
};

/** Las elegidas que siguen siendo válidas, de la más antigua a la más nueva (orden de la hoja). */
export const resolveSelectedAudiometries = <T extends SelectableAudiometry>(
  entries: T[],
  selectedUuids: string[],
): T[] =>
  filterValidAudiometries(entries)
    .filter((entry) => selectedUuids.includes(entry.uuid))
    .sort((first, second) => toTime(first.createdAt) - toTime(second.createdAt));
