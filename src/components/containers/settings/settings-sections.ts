import {
  Building2,
  CalendarClock,
  FileText,
  MessageSquareText,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { Permission } from '@/shared/auth/permissions';
import { routesPrivate } from '@/shared/navigation/routes';
import { TEXT } from '@/static/texts/i18n';

export enum SettingsSection {
  APPOINTMENT_TYPES = 'APPOINTMENT_TYPES',
  QUESTIONS = 'QUESTIONS',
  TEMPLATES = 'TEMPLATES',
  CLINIC = 'CLINIC',
  USERS = 'USERS',
}

export interface SettingsSectionItem {
  section: SettingsSection;
  href: string;
  icon: LucideIcon;
  /** `${TEXT.SETTINGS.SECTIONS_PREFIX}.${section}.title` y `.description`. */
  permission: Permission;
  /** Pantallas con dos columnas (editor y panel): usan más ancho que el resto. */
  isWide?: boolean;
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
    section: SettingsSection.QUESTIONS,
    href: routesPrivate.settings.questions,
    icon: MessageSquareText,
    permission: Permission.EDIT_CLINICAL_TEMPLATE,
  },
  {
    section: SettingsSection.TEMPLATES,
    href: routesPrivate.settings.templates,
    icon: FileText,
    permission: Permission.EDIT_CLINICAL_TEMPLATE,
    isWide: true,
  },
  {
    section: SettingsSection.CLINIC,
    href: routesPrivate.settings.clinic,
    icon: Building2,
    permission: Permission.VIEW_CLINIC,
  },
  {
    section: SettingsSection.USERS,
    href: routesPrivate.settings.users,
    icon: Users,
    permission: Permission.MANAGE_USERS,
  },
];

export const sectionTitleKey = (section: SettingsSection) =>
  `${TEXT.SETTINGS.SECTIONS_PREFIX}.${section}.title`;

export const sectionDescriptionKey = (section: SettingsSection) =>
  `${TEXT.SETTINGS.SECTIONS_PREFIX}.${section}.description`;
