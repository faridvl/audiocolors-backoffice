import type { TFunction } from 'i18next';
import {
  CalendarCheck,
  CalendarClock,
  CircleCheck,
  DoorOpen,
  FilePen,
  FileX,
  NotebookText,
  Paperclip,
  Pencil,
  Phone,
  PhoneOff,
  UserCog,
  UserPlus,
  type LucideIcon,
  Ear,
  ShieldCheck,
  Video,
} from 'lucide-react';
import { TEXT } from '@/static/texts/i18n';
import { DOCUMENT_CATEGORY_LABELS } from '@/types/documents/document.types';
import { GENDER_LABELS, PatientGender } from '@/types/patients/patient';
import {
  PatientActivity,
  PatientActivityAction,
  PatientFieldChange,
} from '@/types/patient-activity/patient-activity';
import { formatDate, formatMonthLabel } from '@/shared/utils/formatters';
import { repairFileName } from '@/shared/utils/file-name';

enum ActionTone {
  ACCENT = 'bg-brand-50 text-brand-700',
  SUCCESS = 'bg-success/10 text-success',
  NEUTRAL = 'bg-ink-100 text-ink-600',
  DANGER = 'bg-danger/10 text-danger',
}

/**
 * Icono y color de cada acción. Solo la cita confirmada lleva el acento de
 * marca y el alta el tono de éxito: son lo que el negocio busca de un
 * vistazo. Lo demás va neutro, y lo que se borra en rojo.
 */
export const ACTION_STYLES: Record<PatientActivityAction, { icon: LucideIcon; tone: ActionTone }> =
  {
    [PatientActivityAction.APPOINTMENT_CONFIRMED]: { icon: CalendarCheck, tone: ActionTone.ACCENT },
    [PatientActivityAction.APPOINTMENT_TENTATIVE]: {
      icon: CalendarClock,
      tone: ActionTone.NEUTRAL,
    },
    [PatientActivityAction.APPOINTMENT_ARRIVED]: { icon: DoorOpen, tone: ActionTone.NEUTRAL },
    [PatientActivityAction.APPOINTMENT_COMPLETED]: { icon: CircleCheck, tone: ActionTone.SUCCESS },
    [PatientActivityAction.PATIENT_CREATED]: { icon: UserPlus, tone: ActionTone.SUCCESS },
    [PatientActivityAction.PATIENT_UPDATED]: { icon: Pencil, tone: ActionTone.NEUTRAL },
    [PatientActivityAction.CONTACT_ADDED]: { icon: Phone, tone: ActionTone.NEUTRAL },
    [PatientActivityAction.CONTACT_UPDATED]: { icon: Phone, tone: ActionTone.NEUTRAL },
    [PatientActivityAction.CONTACT_REMOVED]: { icon: PhoneOff, tone: ActionTone.DANGER },
    [PatientActivityAction.NOTE_ADDED]: { icon: NotebookText, tone: ActionTone.NEUTRAL },
    [PatientActivityAction.DOCUMENT_UPLOADED]: { icon: Paperclip, tone: ActionTone.NEUTRAL },
    [PatientActivityAction.DOCUMENT_RENAMED]: { icon: FilePen, tone: ActionTone.NEUTRAL },
    [PatientActivityAction.DOCUMENT_DELETED]: { icon: FileX, tone: ActionTone.DANGER },
    [PatientActivityAction.STATUS_CHANGED]: { icon: UserCog, tone: ActionTone.NEUTRAL },
    [PatientActivityAction.HEARING_AIDS_LAB_CHANGED]: { icon: Ear, tone: ActionTone.NEUTRAL },
    [PatientActivityAction.WARRANTY_CHANGED]: { icon: ShieldCheck, tone: ActionTone.NEUTRAL },
    [PatientActivityAction.VIDEO_CANDIDATE_CHANGED]: { icon: Video, tone: ActionTone.NEUTRAL },
  };

export function getActionLabel(t: TFunction, action: PatientActivityAction): string {
  return t(`${TEXT.ACTIVITY.ACTION_PREFIX}.${action}`);
}

/** Cuántos campos cambiados se listan antes de resumir con "+N más". */
const MAX_VISIBLE_CHANGES = 3;

/**
 * Fila de la bitácora ya lista para la tabla. Varios archivos subidos
 * seguidos al mismo paciente por la misma persona se juntan en una sola
 * fila ("3 archivos subidos") para que una carga de varios no llene la
 * pantalla.
 */
export interface ActivityRow {
  key: string;
  activity: PatientActivity;
  groupedFiles: PatientActivity[];
}

/** Ventana dentro de la cual dos subidas seguidas cuentan como una sola carga. */
const UPLOAD_GROUP_WINDOW_MS = 5 * 60 * 1000;

export function groupConsecutiveUploads(activities: PatientActivity[]): ActivityRow[] {
  const rows: ActivityRow[] = [];

  for (const activity of activities) {
    const previous = rows[rows.length - 1];
    const canJoin =
      previous &&
      activity.action === PatientActivityAction.DOCUMENT_UPLOADED &&
      previous.activity.action === PatientActivityAction.DOCUMENT_UPLOADED &&
      previous.activity.patientUuid === activity.patientUuid &&
      previous.activity.actorUuid === activity.actorUuid &&
      Math.abs(
        new Date(previous.groupedFiles[previous.groupedFiles.length - 1].createdAt).getTime() -
          new Date(activity.createdAt).getTime(),
      ) <= UPLOAD_GROUP_WINDOW_MS;

    if (canJoin) {
      previous.groupedFiles.push(activity);
    } else {
      rows.push({ key: activity.uuid, activity, groupedFiles: [activity] });
    }
  }

  return rows;
}

/** "2026-10-02" -> "02 oct 2026", leído como día local (no UTC). */
function formatDayKey(dayKey?: string): string {
  if (!dayKey) return '—';
  const [year, month, day] = dayKey.split('-').map(Number);
  if (!year || !month || !day) return '—';
  return formatDate(new Date(year, month - 1, day).toISOString());
}

function joinParts(...parts: (string | null | undefined)[]): string {
  return parts.filter(Boolean).join(' · ') || '—';
}

interface DetailContext {
  t: TFunction;
  resolveBranchName: (branchUuid: string) => string | undefined;
}

function formatFieldValue(
  change: PatientFieldChange,
  value: string | null,
  context: DetailContext,
): string {
  if (!value) return context.t(TEXT.ACTIVITY.DETAIL.EMPTY_VALUE);
  if (change.field === 'branchUuid') return context.resolveBranchName(value) ?? value;
  if (change.field === 'gender') return GENDER_LABELS[value as PatientGender] ?? value;
  return value;
}

function formatChanges(changes: PatientFieldChange[], context: DetailContext): string {
  const visible = changes.slice(0, MAX_VISIBLE_CHANGES).map((change) => {
    const label = context.t(`${TEXT.ACTIVITY.DETAIL.FIELD_PREFIX}.${change.field}`);
    const before = formatFieldValue(change, change.before, context);
    const after = formatFieldValue(change, change.after, context);
    return `${label}: ${before} → ${after}`;
  });

  const hidden = changes.length - visible.length;
  if (hidden > 0) visible.push(context.t(TEXT.ACTIVITY.DETAIL.MORE, { count: hidden }));

  return visible.join(' · ');
}

/** Texto de la columna "Detalle" según la acción. */
export function formatActivityDetail(row: ActivityRow, context: DetailContext): string {
  const { activity, groupedFiles } = row;
  const detail = activity.detail ?? {};
  const categoryLabel = detail.category ? DOCUMENT_CATEGORY_LABELS[detail.category] : null;

  switch (activity.action) {
    case PatientActivityAction.PATIENT_UPDATED:
      return detail.changes?.length ? formatChanges(detail.changes, context) : '—';

    case PatientActivityAction.CONTACT_ADDED:
    case PatientActivityAction.CONTACT_REMOVED:
      return joinParts(detail.name, detail.phone);

    case PatientActivityAction.CONTACT_UPDATED: {
      const previous = typeof detail.before === 'object' ? detail.before : undefined;
      return joinParts(
        detail.name,
        previous && previous.phone !== detail.phone
          ? `${previous.phone} → ${detail.phone}`
          : detail.phone,
      );
    }

    case PatientActivityAction.NOTE_ADDED:
      return joinParts(categoryLabel, detail.excerpt ? `“${detail.excerpt}”` : null);

    case PatientActivityAction.DOCUMENT_UPLOADED:
      if (groupedFiles.length > 1) {
        return joinParts(
          context.t(TEXT.ACTIVITY.DETAIL.FILES_UPLOADED, { count: groupedFiles.length }),
          groupedFiles.map((file) => repairFileName(file.detail?.originalName ?? '')).join(', '),
        );
      }
      return joinParts(categoryLabel, repairFileName(detail.originalName ?? ''));

    case PatientActivityAction.DOCUMENT_DELETED:
      return joinParts(categoryLabel, repairFileName(detail.originalName ?? ''));

    case PatientActivityAction.DOCUMENT_RENAMED: {
      if (typeof detail.before !== 'string') return '—';
      const before = repairFileName(detail.before);
      const after = repairFileName(detail.after ?? '');
      // El renombrado automático que corregía las tildes queda igual al reparar: solo el nombre.
      return before === after ? after : `${before} → ${after}`;
    }

    case PatientActivityAction.APPOINTMENT_TENTATIVE:
      return joinParts(
        formatMonthLabel(detail.month),
        detail.typeName,
        context.t(TEXT.ACTIVITY.DETAIL.BY_TENTATIVE),
      );

    case PatientActivityAction.APPOINTMENT_CONFIRMED:
    case PatientActivityAction.APPOINTMENT_ARRIVED:
    case PatientActivityAction.APPOINTMENT_COMPLETED:
      return joinParts(formatDayKey(detail.date), detail.typeName);

    case PatientActivityAction.STATUS_CHANGED: {
      const statusLabel = (status?: string | { name: string; phone: string }) =>
        typeof status === 'string'
          ? context.t(`${TEXT.ACTIVITY.DETAIL.STATUS_PREFIX}.${status}`)
          : '—';
      return joinParts(
        `${statusLabel(detail.before)} → ${statusLabel(detail.after)}`,
        formatDayKey(detail.date ?? undefined) === '—' ? null : formatDayKey(detail.date),
        detail.reason,
      );
    }

    case PatientActivityAction.HEARING_AIDS_LAB_CHANGED:
    case PatientActivityAction.WARRANTY_CHANGED:
    case PatientActivityAction.VIDEO_CANDIDATE_CHANGED:
      return context.t(
        `${detail.isOn ? TEXT.ACTIVITY.DETAIL.FLAG_ON_PREFIX : TEXT.ACTIVITY.DETAIL.FLAG_OFF_PREFIX}.${activity.action}`,
      );

    case PatientActivityAction.PATIENT_CREATED:
    default:
      return '—';
  }
}

/** Hora local "16:42". */
export function formatTime(isoDate: string): string {
  return new Date(isoDate).toLocaleTimeString('es-CR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Separador de día: "Hoy · lunes 29 de septiembre", "Ayer · …" o solo la fecha. */
export function formatDayGroup(t: TFunction, isoDate: string, now: Date): string {
  const day = startOfDay(new Date(isoDate));
  const today = startOfDay(now);
  const diffDays = Math.round((today.getTime() - day.getTime()) / 86_400_000);

  const label = day.toLocaleDateString('es-CR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    ...(day.getFullYear() !== today.getFullYear() && { year: 'numeric' }),
  });

  if (diffDays === 0) return t(TEXT.ACTIVITY.GROUP.TODAY, { date: label });
  if (diffDays === 1) return t(TEXT.ACTIVITY.GROUP.YESTERDAY, { date: label });
  return `${label.charAt(0).toUpperCase()}${label.slice(1)}`;
}
