import { CalendarClock, ClipboardList, type LucideIcon } from 'lucide-react';
import { Permission } from '@/shared/auth/permissions';
import { routesPrivate } from '@/shared/navigation/routes';
import { TEXT } from '@/static/texts/i18n';

export enum SettingsSection {
  APPOINTMENT_TYPES = 'APPOINTMENT_TYPES',
  CLINICAL_HISTORY = 'CLINICAL_HISTORY',
}

export interface SettingsSectionItem {
  section: SettingsSection;
  href: string;
  icon: LucideIcon;
  /** `${TEXT.SETTINGS.SECTIONS_PREFIX}.${section}.title` y `.description`. */
  permission: Permission;
}

/** Secciones de Configuración en el orden en que se muestran; se agrupan por tarea, no por tabla. */
export const SETTINGS_SECTIONS: SettingsSectionItem[] = [
  {
    section: SettingsSection.APPOINTMENT_TYPES,
    href: routesPrivate.settings.appointmentTypes,
    icon: CalendarClock,
    permission: Permission.EDIT_APPOINTMENT_TYPES,
  },
  {
    section: SettingsSection.CLINICAL_HISTORY,
    href: routesPrivate.settings.clinicalHistory,
    icon: ClipboardList,
    permission: Permission.EDIT_CLINICAL_TEMPLATE,
  },
];

export const sectionTitleKey = (section: SettingsSection) =>
  `${TEXT.SETTINGS.SECTIONS_PREFIX}.${section}.title`;

export const sectionDescriptionKey = (section: SettingsSection) =>
  `${TEXT.SETTINGS.SECTIONS_PREFIX}.${section}.description`;
