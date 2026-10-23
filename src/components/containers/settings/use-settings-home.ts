import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useIsDesktop } from '@/hooks/use-is-desktop';
import { useSettingsNavigation } from './use-settings-navigation';

export function useSettingsHome() {
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const { sections, isLoading } = useSettingsNavigation();
  const firstSection = sections[0];

  // En computadora la lista ya está a la izquierda de cada sección: se abre la primera.
  useEffect(() => {
    if (isDesktop && firstSection) void router.replace(firstSection.href);
  }, [isDesktop, firstSection, router]);

  return { sections, isLoading };
}
