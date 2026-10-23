import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import {
  formatMinuteOfDay,
  formatShortHour,
  MINUTES_IN_HOUR,
  toMinuteOfDay,
} from '@/shared/utils/dates';
import { tailwind } from '@/utils/tailwind-utils';
import { TEXT } from '@/static/texts/i18n';
import {
  DayTiming,
  resolveSection,
  snapToTimelineStep,
  TIMELINE_END_MINUTE,
  TIMELINE_START_MINUTE,
  TIMELINE_STEP_MINUTES,
} from '../agenda-presenter';
import {
  TIMELINE_BLOCK_GAP_PX,
  TIMELINE_MIN_BLOCK_PX,
  TIMELINE_PIXELS_PER_MINUTE,
} from '../agenda-styles';
import { AgendaState } from '../use-agenda';
import { TimelineBlock } from './timeline-block';
import { AgendaBoardState } from './use-agenda-board';

/** Cada cuánto se mueve la línea de "ahora". */
const NOW_REFRESH_MS = 60_000;

const STEP_MINUTES = Array.from(
  { length: (TIMELINE_END_MINUTE - TIMELINE_START_MINUTE) / TIMELINE_STEP_MINUTES },
  (_, index) => TIMELINE_START_MINUTE + index * TIMELINE_STEP_MINUTES,
);

const toTop = (minute: number) => (minute - TIMELINE_START_MINUTE) * TIMELINE_PIXELS_PER_MINUTE;
const toHeight = (minutes: number) =>
  Math.max(TIMELINE_MIN_BLOCK_PX, minutes * TIMELINE_PIXELS_PER_MINUTE - TIMELINE_BLOCK_GAP_PX);
const TIMELINE_HEIGHT_PX = toTop(TIMELINE_END_MINUTE);

/** Ubicación de un bloque: su fila por la hora y su columna si se cruza con otros. */
const blockStyle = (
  startMinute: number,
  endMinute: number,
  lane = 0,
  laneCount = 1,
): React.CSSProperties => ({
  top: toTop(startMinute) + TIMELINE_BLOCK_GAP_PX / 2,
  height: toHeight(endMinute - startMinute),
  left: `calc(${(lane / laneCount) * 100}% + ${TIMELINE_BLOCK_GAP_PX}px)`,
  width: `calc(${100 / laneCount}% - ${TIMELINE_BLOCK_GAP_PX * 2}px)`,
});

function useNowMinute(isToday: boolean): number | null {
  const [now, setNow] = useState(() => toMinuteOfDay(new Date().toISOString()));
  useEffect(() => {
    if (!isToday) return undefined;
    const timer = window.setInterval(
      () => setNow(toMinuteOfDay(new Date().toISOString())),
      NOW_REFRESH_MS,
    );
    return () => window.clearInterval(timer);
  }, [isToday]);
  return isToday && now >= TIMELINE_START_MINUTE && now <= TIMELINE_END_MINUTE ? now : null;
}

interface DayTimelineProps {
  agenda: AgendaState;
  board: AgendaBoardState;
}

/**
 * El día como en Teams: una línea por media hora y cada cita con el alto de su
 * duración; las que se cruzan van lado a lado. Soltar o tocar cae en la media
 * hora bajo el puntero, y mientras tanto se ve la sombra de dónde quedaría.
 */
export const DayTimeline: React.FC<DayTimelineProps> = ({ agenda, board }) => {
  const { t } = useTranslation();
  const surfaceRef = useRef<HTMLDivElement>(null);
  const [hoverMinute, setHoverMinute] = useState<number | null>(null);
  const nowMinute = useNowMinute(agenda.selectedTiming === DayTiming.TODAY);
  const canTapToSchedule = Boolean(board.selectedPending) && board.isDayOpen;

  const minuteAt = (clientY: number) => {
    const top = surfaceRef.current?.getBoundingClientRect().top ?? 0;
    return snapToTimelineStep((clientY - top) / TIMELINE_PIXELS_PER_MINUTE);
  };

  const accepts = (event: React.DragEvent) => board.acceptsOnTimeline(event);
  const previewDuration = board.draggingDuration ?? TIMELINE_STEP_MINUTES;

  return (
    <div className="flex">
      <div className="relative w-12 shrink-0" style={{ height: TIMELINE_HEIGHT_PX }} aria-hidden>
        {STEP_MINUTES.filter((minute) => minute % MINUTES_IN_HOUR === 0).map((minute) => (
          <div
            key={minute}
            className="absolute right-2 -translate-y-1/2 whitespace-nowrap first:translate-y-0"
            style={{ top: toTop(minute) }}
          >
            <Typography variant={TypographyVariant.HELPER} inline>
              {formatShortHour(minute / MINUTES_IN_HOUR)}
            </Typography>
          </div>
        ))}
      </div>

      <div
        ref={surfaceRef}
        role="group"
        aria-label={t(TEXT.AGENDA.BOARD.TIMELINE_ARIA)}
        style={{ height: TIMELINE_HEIGHT_PX }}
        className={tailwind(
          'relative min-w-0 flex-1 border-l border-ink-200',
          canTapToSchedule && 'cursor-pointer',
        )}
        onDragOver={(event) => {
          if (!accepts(event)) return;
          // Sin preventDefault el navegador no permite soltar aquí.
          event.preventDefault();
          event.dataTransfer.dropEffect = 'move';
          setHoverMinute(minuteAt(event.clientY));
        }}
        onDragLeave={(event) => {
          if (!surfaceRef.current?.contains(event.relatedTarget as Node | null)) {
            setHoverMinute(null);
          }
        }}
        onDrop={(event) => {
          if (!accepts(event)) return;
          event.preventDefault();
          setHoverMinute(null);
          board.handleDropAt(minuteAt(event.clientY));
        }}
        onMouseMove={(event) => canTapToSchedule && setHoverMinute(minuteAt(event.clientY))}
        onMouseLeave={() => canTapToSchedule && setHoverMinute(null)}
        onClick={(event) => canTapToSchedule && board.handleTapAt(minuteAt(event.clientY))}
      >
        {STEP_MINUTES.map((minute) => (
          <div
            key={minute}
            aria-hidden
            className={tailwind(
              'absolute inset-x-0 border-t',
              minute % MINUTES_IN_HOUR === 0 ? 'border-ink-200' : 'border-dashed border-ink-100',
            )}
            style={{ top: toTop(minute) }}
          />
        ))}

        {nowMinute !== null && (
          <div
            aria-hidden
            className="absolute inset-x-0 z-20 border-t-2 border-danger"
            style={{ top: toTop(nowMinute) }}
          >
            <span className="absolute -left-1.5 -top-[5px] h-2 w-2 rounded-full bg-danger" />
          </div>
        )}

        {board.blocks.map((block) => (
          <TimelineBlock
            key={block.appointment.id}
            block={block}
            section={resolveSection(block.appointment, agenda.selectedTiming)}
            typeColor={agenda.resolveTypeColor(block.appointment.typeUUID)}
            branchName={agenda.resolveBranchName(block.appointment.branchUUID)}
            style={blockStyle(block.startMinute, block.endMinute, block.lane, block.laneCount)}
            heightPx={toHeight(block.endMinute - block.startMinute)}
            drag={board.dragAppointment(block.appointment)}
            isDragSource={board.isDragSource(block.appointment.id)}
            isPassThrough={board.isDragging || canTapToSchedule}
            onClick={() => agenda.handleOpenAppointment(block.appointment.id)}
          />
        ))}

        {board.savingOnDay.map((item) => (
          <div
            key={item.id}
            className="absolute z-10 flex items-center gap-1.5 overflow-hidden rounded-md border border-dashed border-brand/50 bg-brand-50 px-2"
            style={blockStyle(item.startMinute, item.startMinute + TIMELINE_STEP_MINUTES)}
          >
            <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-brand" aria-hidden />
            <Typography
              variant={TypographyVariant.HELPER}
              inline
              className="truncate font-semibold"
            >
              {item.title}
            </Typography>
          </div>
        ))}

        {hoverMinute !== null && (
          <div
            aria-hidden
            className="pointer-events-none absolute z-30 flex flex-col justify-start overflow-hidden rounded-md border-2 border-dashed border-brand bg-brand-50/90 px-2 py-0.5"
            style={blockStyle(
              hoverMinute,
              Math.min(TIMELINE_END_MINUTE, hoverMinute + previewDuration),
            )}
          >
            <Typography
              variant={TypographyVariant.HELPER}
              className="truncate font-semibold text-brand-700"
            >
              {t(TEXT.AGENDA.BOARD.TIME_RANGE, {
                start: formatMinuteOfDay(hoverMinute),
                end: formatMinuteOfDay(hoverMinute + previewDuration),
              })}
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
};
