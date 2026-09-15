import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getDurationMinutesFromRange } from '@/features/classes/utils/slotDuration';
import { formatTimeFromDate } from '@/utils/format';

export function formatDurationMinutes(minutes: number): string {
  return `${minutes} min`;
}

function orderedRange(start: Date, end: Date): { start: Date; end: Date } {
  return start <= end ? { start, end } : { start: end, end: start };
}

export function formatCalendarSelectDuration({ start, end }: { start: Date; end: Date }): string {
  const range = orderedRange(start, end);
  return formatDurationMinutes(getDurationMinutesFromRange(range.start, range.end));
}

export function formatCalendarSelectRange({ start, end }: { start: Date; end: Date }): string {
  const range = orderedRange(start, end);
  const sameDay = range.start.toDateString() === range.end.toDateString();
  const hasTimeSelection =
    range.start.getHours() !== 0 ||
    range.start.getMinutes() !== 0 ||
    range.end.getHours() !== 0 ||
    range.end.getMinutes() !== 0;

  if (sameDay && hasTimeSelection) {
    return `${format(range.start, 'dd/MM/yyyy', { locale: es })} ${formatTimeFromDate(range.start)} – ${formatTimeFromDate(range.end)}`;
  }

  if (sameDay) {
    return format(range.start, 'dd/MM/yyyy', { locale: es });
  }

  return `${format(range.start, 'dd/MM/yyyy', { locale: es })} – ${format(range.end, 'dd/MM/yyyy', { locale: es })}`;
}
