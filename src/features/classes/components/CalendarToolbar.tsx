import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Navigate, Views } from 'react-big-calendar';
import type { ToolbarProps, View } from 'react-big-calendar';
import { Button } from '@/components/ui/button';
import type { ClassCalendarEvent } from '@/features/classes/hooks/useCalendarView';
import { cn } from '@/lib/utils';

const viewOptions: Array<{ label: string; value: View; desktopOnly?: boolean }> = [
  { label: 'Mes', value: Views.MONTH, desktopOnly: true },
  { label: 'Semana', value: Views.WEEK, desktopOnly: true },
  { label: 'Día', value: Views.DAY },
  { label: 'Agenda', value: Views.AGENDA },
];

export function CalendarToolbar({
  label,
  onNavigate,
  onView,
  view,
}: ToolbarProps<ClassCalendarEvent>) {
  return (
    <nav aria-label="Controles del calendario" className="scheduly-calendar-toolbar">
      <div
        aria-label="Vista del calendario"
        className="scheduly-calendar-view-switch"
        role="group"
      >
        {viewOptions.map((option) => (
          <Button
            aria-pressed={view === option.value}
            className={cn(
              'min-w-0 flex-1 px-2 lg:min-h-9 lg:flex-none',
              option.desktopOnly && 'hidden lg:inline-flex',
            )}
            key={option.value}
            onClick={() => onView(option.value)}
            size="sm"
            type="button"
            variant={view === option.value ? 'default' : 'ghost'}
          >
            {option.label}
          </Button>
        ))}
      </div>

      <div className="scheduly-calendar-period-controls">
        <Button
          className="shrink-0 px-3 lg:min-h-9"
          onClick={() => onNavigate(Navigate.TODAY)}
          size="sm"
          type="button"
          variant="outline"
        >
          Hoy
        </Button>
        <Button
          aria-label="Período anterior"
          className="shrink-0 lg:size-9"
          onClick={() => onNavigate(Navigate.PREVIOUS)}
          size="icon"
          type="button"
          variant="ghost"
        >
          <ChevronLeft className="size-5" />
        </Button>
        <p aria-live="polite" className="scheduly-calendar-period-label">
          {label}
        </p>
        <Button
          aria-label="Período siguiente"
          className="shrink-0 lg:size-9"
          onClick={() => onNavigate(Navigate.NEXT)}
          size="icon"
          type="button"
          variant="ghost"
        >
          <ChevronRight className="size-5" />
        </Button>
      </div>
    </nav>
  );
}
