import React from 'react';

export interface DatedEntry {
  uuid: string;
  createdAt: string;
}

export interface EntryRenderer<T extends DatedEntry> {
  getAuthor: (entry: T) => string;
  /** Línea "Corregido por ..."; sin ella, o si el registro no se corrigió, no se pinta. */
  getCorrection?: (entry: T) => string | undefined;
  /** `isMuted` en los registros anteriores: se leen más apagados que el último. */
  renderEntry: (entry: T, options: { isMuted: boolean }) => React.ReactNode;
}
