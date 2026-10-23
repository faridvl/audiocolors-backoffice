import { useEffect, useState } from 'react';
import { LATEST_RELEASE, RELEASES } from '@/static/releases';

/** Última versión que el usuario ya abrió en Novedades, por usuario: varios comparten computadora. */
const seenVersionKey = (userUuid: string) => `audiocolors.novedades.versionVista.${userUuid}`;

function readSeenVersion(userUuid: string): string | null {
  try {
    return window.localStorage.getItem(seenVersionKey(userUuid));
  } catch {
    return null;
  }
}

export function useReleaseNotes(userUuid: string | undefined) {
  const [seenVersion, setSeenVersion] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // localStorage solo existe en el navegador: se lee al montar, no durante el render del servidor.
  useEffect(() => {
    if (!userUuid) return;
    setSeenVersion(readSeenVersion(userUuid));
    setIsReady(true);
  }, [userUuid]);

  // Las versiones van de la más nueva a la más antigua: las sin ver son las de antes de la vista.
  const seenIndex = RELEASES.findIndex((release) => release.version === seenVersion);
  const unseenCount = !isReady ? 0 : seenIndex === -1 ? RELEASES.length : seenIndex;

  const handleOpen = () => {
    setIsOpen(true);
    setSeenVersion(LATEST_RELEASE.version);
    if (!userUuid) return;
    try {
      window.localStorage.setItem(seenVersionKey(userUuid), LATEST_RELEASE.version);
    } catch {
      // Sin almacenamiento (modo privado) el contador vuelve a aparecer: no es grave.
    }
  };

  return {
    releases: RELEASES,
    unseenCount,
    isOpen,
    handleOpen,
    handleClose: () => setIsOpen(false),
  };
}
