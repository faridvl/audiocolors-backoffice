import { usePermissions } from '@/hooks/use-permissions';
import { SETTINGS_SECTIONS } from './settings-sections';

/** Las secciones de Configuración que el rol puede abrir. */
export function useSettingsNavigation() {
  const { can, isLoading } = usePermissions();

  return {
    sections: SETTINGS_SECTIONS.filter((item) => can(item.permission)),
    isLoading,
  };
}
