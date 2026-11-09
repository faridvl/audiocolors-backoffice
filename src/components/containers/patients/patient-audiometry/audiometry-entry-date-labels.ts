export interface EntryDateLabelSource {
  uuid: string;
  createdAt: string;
  ptaRight: number | null;
  ptaLeft: number | null;
}

type LabelWithPta = (date: string, ptaRight: number | null, ptaLeft: number | null) => string;

/**
 * Etiqueta de cada audiometría en las listas: su fecha y hora. Si dos comparten la misma, se
 * agrega el PTA de cada oído para poder distinguirlas.
 */
export function buildEntryDateLabels(
  entries: EntryDateLabelSource[],
  formatDate: (isoDate: string) => string,
  labelWithPta: LabelWithPta,
): Map<string, string> {
  const dates = entries.map((entry) => formatDate(entry.createdAt));
  const timesSeen = new Map<string, number>();
  dates.forEach((date) => timesSeen.set(date, (timesSeen.get(date) ?? 0) + 1));

  return new Map(
    entries.map((entry, index) => {
      const date = dates[index];
      const isRepeated = (timesSeen.get(date) ?? 0) > 1;
      const hasPta = entry.ptaRight !== null || entry.ptaLeft !== null;
      return [
        entry.uuid,
        isRepeated && hasPta ? labelWithPta(date, entry.ptaRight, entry.ptaLeft) : date,
      ];
    }),
  );
}
