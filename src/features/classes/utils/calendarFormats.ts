import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatTimeFromDate } from '@/utils/format';

export function formatCalendarSelectRange({ start, end }: { start: Date; end: Date }): string {
  const rangeStart = start <= end ? start : end;
  const rangeEnd = start <= end ? end : start;
  const sameDay = rangeStart.toDateString() === rangeEnd.toDateString();
  const hasTimeSelection =
    rangeStart.getHours() !== 0 ||
    rangeStart.getMinutes() !== 0 ||
    rangeEnd.getHours() !== 0 ||
    rangeEnd.getMinutes() !== 0;

  if (sameDay && hasTimeSelection) {
    return `${format(rangeStart, 'dd/MM/yyyy', { locale: es })} ${formatTimeFromDate(rangeStart)} – ${formatTimeFromDate(rangeEnd)}`;
  }

  if (sameDay) {
    return format(rangeStart, 'dd/MM/yyyy', { locale: es });
  }

  return `${format(rangeStart, 'dd/MM/yyyy', { locale: es })} – ${format(rangeEnd, 'dd/MM/yyyy', { locale: es })}`;
}
