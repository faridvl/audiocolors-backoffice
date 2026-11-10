import {
  Building2,
  CalendarClock,
  Ear,
  FileText,
  MapPin,
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
  BRANCHES = 'BRANCHES',
  EQUIPMENT = 'EQUIPMENT',
  USERS = 'USERS',
}

/** Agrupa el menú en el orden en que una clínica nueva la va configurando. */
export enum SettingsGroup {
  PRACTICE = 'PRACTICE',
  CARE = 'CARE',
}

/** Los grupos en el orden en que se muestran. */
export const SETTINGS_GROUPS: SettingsGroup[] = [SettingsGroup.PRACTICE, SettingsGroup.CARE];

export interface SettingsSectionItem {
  section: SettingsSection;
  group: SettingsGroup;
  href: string;
  icon: LucideIcon;
  permission: Permission;
}

/** Secciones de Configuración en el orden en que se muestran, ya agrupadas por tarea. */
export const SETTINGS_SECTIONS: SettingsSectionItem[] = [
  {
    section: SettingsSection.CLINIC,
    group: SettingsGroup.PRACTICE,
    href: routesPrivate.settings.clinic,
    icon: Building2,
    permission: Permission.VIEW_CLINIC,
  },
  {
    section: SettingsSection.BRANCHES,
    group: SettingsGroup.PRACTICE,
    href: routesPrivate.settings.branches,
    icon: MapPin,
    permission: Permission.EDIT_APPOINTMENT_TYPES,
  },
  {
    section: SettingsSection.USERS,
    group: SettingsGroup.PRACTICE,
    href: routesPrivate.settings.users,
    icon: Users,
    permission: Permission.MANAGE_USERS,
  },
  {
    section: SettingsSection.APPOINTMENT_TYPES,
    group: SettingsGroup.CARE,
    href: routesPrivate.settings.appointmentTypes,
    icon: CalendarClock,
    permission: Permission.EDIT_APPOINTMENT_TYPES,
  },
  {
    section: SettingsSection.EQUIPMENT,
    group: SettingsGroup.CARE,
    href: routesPrivate.settings.equipment,
    icon: Ear,
    permission: Permission.EDIT_APPOINTMENT_TYPES,
  },
  {
    section: SettingsSection.QUESTIONS,
    group: SettingsGroup.CARE,
    href: routesPrivate.settings.questions,
    icon: MessageSquareText,
    permission: Permission.EDIT_CLINICAL_TEMPLATE,
  },
  {
    section: SettingsSection.TEMPLATES,
    group: SettingsGroup.CARE,
    href: routesPrivate.settings.templates,
    icon: FileText,
    permission: Permission.EDIT_CLINICAL_TEMPLATE,
  },
];

export interface SettingsSectionGroup {
  group: SettingsGroup;
  sections: SettingsSectionItem[];
}

/** Agrupa las secciones visibles; un grupo sin secciones no aparece. */
export const groupSettingsSections = (sections: SettingsSectionItem[]): SettingsSectionGroup[] =>
  SETTINGS_GROUPS.map((group) => ({
    group,
    sections: sections.filter((item) => item.group === group),
  })).filter((entry) => entry.sections.length > 0);

export const sectionTitleKey = (section: SettingsSection) =>
  `${TEXT.SETTINGS.SECTIONS_PREFIX}.${section}.title`;

export const sectionDescriptionKey = (section: SettingsSection) =>
  `${TEXT.SETTINGS.SECTIONS_PREFIX}.${section}.description`;

export const groupTitleKey = (group: SettingsGroup) => `${TEXT.SETTINGS.GROUPS_PREFIX}.${group}`;
