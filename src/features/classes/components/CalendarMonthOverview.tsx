import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  buildClassesByDayMap,
  dayHighlightClassName,
  getDayHighlightForDate,
} from '@/features/classes/utils/calendarDayStatus';
import type { Class } from '@/types';
import { cn } from '@/lib/utils';

const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

type CalendarMonthOverviewProps = {
  classes: Class[];
  className?: string;
  onSelectDate: (date: Date) => void;
  selectedDate: Date;
};

function monthGridDays(cursorMonth: Date): Date[] {
  const monthStart = startOfMonth(cursorMonth);
  const monthEnd = endOfMonth(cursorMonth);
  const gridStart = startOfWeek(monthStart, { locale: es, weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { locale: es, weekStartsOn: 1 });

  return eachDayOfInterval({ start: gridStart, end: gridEnd });
}

export function CalendarMonthOverview({
  classes,
  className,
  onSelectDate,
  selectedDate,
}: CalendarMonthOverviewProps) {
  const [cursorMonth, setCursorMonth] = useState(() => startOfMonth(selectedDate));
  const classesByDay = useMemo(() => buildClassesByDayMap(classes), [classes]);
  const days = useMemo(() => monthGridDays(cursorMonth), [cursorMonth]);
  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    setCursorMonth(startOfMonth(selectedDate));
  }, [selectedDate.getFullYear(), selectedDate.getMonth()]);

  return (
    <section
      aria-label="Resumen mensual de clases"
      className={cn(
        'scheduly-calendar-overview shrink-0 border-b border-border bg-card px-3 py-3 sm:px-4',
        className,
      )}
    >
      <div className="mb-2 flex items-center gap-1">
        <Button
          aria-label="Mes anterior"
          className="shrink-0"
          onClick={() => setCursorMonth((current) => addMonths(current, -1))}
          size="icon"
          type="button"
          variant="ghost"
        >
          <ChevronLeft className="size-5" />
        </Button>
        <p className="min-w-0 flex-1 truncate text-center text-sm font-semibold capitalize">
          {format(cursorMonth, 'MMMM yyyy', { locale: es })}
        </p>
        <Button
          aria-label="Mes siguiente"
          className="shrink-0"
          onClick={() => setCursorMonth((current) => addMonths(current, 1))}
          size="icon"
          type="button"
          variant="ghost"
        >
          <ChevronRight className="size-5" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => (
          <div
            className="py-1 text-center text-[0.6875rem] font-medium text-muted-foreground"
            key={day}
          >
            {day}
          </div>
        ))}

        {days.map((day) => {
          const highlight = getDayHighlightForDate(classesByDay, day);
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, today);
          const inMonth = isSameMonth(day, cursorMonth);
          const dayLabel = format(day, 'd');

          return (
            <button
              aria-current={isSelected ? 'date' : undefined}
              aria-label={format(day, "EEEE d 'de' MMMM yyyy", { locale: es })}
              className={cn(
                'scheduly-calendar-overview-day flex min-h-11 flex-col items-center justify-center rounded-lg border border-transparent text-sm font-medium transition',
                !inMonth && 'text-muted-foreground/70',
                isToday && 'ring-1 ring-primary/40',
                isSelected && 'ring-2 ring-primary',
                dayHighlightClassName(highlight),
              )}
              key={day.toISOString()}
              onClick={() => onSelectDate(day)}
              type="button"
            >
              <span>{dayLabel}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
