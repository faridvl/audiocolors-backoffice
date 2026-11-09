interface Sortable {
  sortTime: number;
}

/** De la más reciente a la más antigua; una fecha ilegible queda al final. */
export function sortArchiveItems<T extends Sortable>(items: T[]): T[] {
  const timeOf = (item: Sortable) => (Number.isNaN(item.sortTime) ? -Infinity : item.sortTime);
  return [...items].sort((a, b) => timeOf(b) - timeOf(a));
}
