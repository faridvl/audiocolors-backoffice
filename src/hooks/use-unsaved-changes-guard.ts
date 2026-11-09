import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { TEXT } from '@/static/texts/i18n';

/** Pide confirmar al salir de la página (navegación o cerrar la pestaña) mientras haya cambios sin guardar. */
export function useUnsavedChangesGuard(hasUnsavedChanges: boolean) {
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleRouteChangeStart = () => {
      if (window.confirm(t(TEXT.GENERAL.UNSAVED_CHANGES))) return;
      router.events.emit('routeChangeError');
      // Next no tiene otra forma de cancelar una navegación en curso.
      throw new Error('Navegación cancelada: hay cambios sin guardar');
    };
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges, router, t]);
}
