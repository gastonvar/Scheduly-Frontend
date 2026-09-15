import { useMemo, useRef } from 'react';
import { format, getDay, parse, startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { dateFnsLocalizer, Views } from 'react-big-calendar';
import type { Components, View } from 'react-big-calendar';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CALENDAR_SLOT_MINUTES, CALENDAR_TIMESLOTS_PER_HOUR } from '@/config/constants';
import { CalendarClassEvent, CalendarPaymentStatusSelect } from '@/features/classes/components/CalendarClassEvent';
import { DnDCalendar } from '@/features/classes/components/dndCalendar';
import { formatCalendarSelectDuration, formatCalendarSelectRange } from '@/features/classes/utils/calendarFormats';
import { useCalendarView } from '@/features/classes/hooks/useCalendarView';
import type { ClassCalendarEvent, ClassRescheduleInput } from '@/features/classes/hooks/useCalendarView';
import type { Class, ClassPaymentStatus, Student, Subject } from '@/types';

type CalendarViewProps = {
  classes: Class[];
  error?: string | null;
  loading?: boolean;
  onCreateForSlot: (slot: { date: string; durationHours: number }) => void;
  onEditClass: (classItem: Class) => void;
  onPaymentStatusChange: (classItem: Class, status: ClassPaymentStatus) => Promise<void>;
  onRescheduleClass: (input: ClassRescheduleInput) => Promise<void>;
  students: Student[];
  subjects: Subject[];
};

const locales = {
  'es-UY': es,
};

const localizer = dateFnsLocalizer({
  format,
  getDay,
  locales,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { locale: es, weekStartsOn: 1 }),
});

const calendarMessages = {
  agenda: 'Agenda',
  allDay: 'Todo el día',
  date: 'Fecha',
  day: 'Día',
  event: 'Clase',
  month: 'Mes',
  next: 'Siguiente',
  noEventsInRange: 'No hay clases en este rango.',
  previous: 'Anterior',
  showMore: (total: number) => `+${total} más`,
  time: 'Hora',
  today: 'Hoy',
  tomorrow: 'Mañana',
  week: 'Semana',
  work_week: 'Semana laboral',
  yesterday: 'Ayer',
};

const calendarFormats = {
  agendaDateFormat: 'dd/MM/yyyy',
  agendaHeaderFormat: (range: { start: Date; end: Date }) =>
    `${format(range.start, 'dd/MM/yyyy', { locale: es })} – ${format(range.end, 'dd/MM/yyyy', { locale: es })}`,
  dayFormat: 'dd/MM',
  dayHeaderFormat: 'EEEE dd/MM/yyyy',
  dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
    `${format(start, 'dd/MM/yyyy', { locale: es })} – ${format(end, 'dd/MM/yyyy', { locale: es })}`,
  selectRangeFormat: formatCalendarSelectRange,
};

const calendarViews: View[] = [Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA];
const minCalendarTime = new Date(1970, 0, 1, 7, 0, 0);
const maxCalendarTime = new Date(1970, 0, 1, 23, 59, 59);
const scrollToCalendarTime = minCalendarTime;

export function CalendarView({
  classes,
  error = null,
  loading = false,
  onCreateForSlot,
  onEditClass,
  onPaymentStatusChange,
  onRescheduleClass,
  students,
  subjects,
}: CalendarViewProps) {
  const {
    date,
    eventPropGetter,
    events,
    handleEventDrop,
    handleEventResize,
    handleNavigate,
    handlePaymentStatusChange,
    handleSelecting,
    handleSelectSlot,
    handleView,
    isEventDraggable,
    isEventResizable,
    slotError,
    slotPropGetter,
    view,
  } = useCalendarView({
    classes,
    onCreateForSlot,
    onPaymentStatusChange,
    onRescheduleClass,
    students,
    subjects,
  });

  const calendarRootRef = useRef<HTMLDivElement>(null);

  function handleSelectingWithDuration(range: { start: Date; end: Date }) {
    calendarRootRef.current?.style.setProperty(
      '--scheduly-select-minutes',
      `"${formatCalendarSelectDuration(range)}"`,
    );
    return handleSelecting(range);
  }

  const calendarComponents = useMemo<Components<ClassCalendarEvent>>(() => {
    const changePaymentStatus = (classItem: Class, status: ClassPaymentStatus) => {
      void handlePaymentStatusChange(classItem, status);
    };

    return {
      month: {
        event: (props) => (
          <CalendarClassEvent
            {...props}
            onPaymentStatusChange={changePaymentStatus}
            showTimeRange
          />
        ),
      },
      week: {
        event: (props) => (
          <CalendarClassEvent
            {...props}
            onPaymentStatusChange={changePaymentStatus}
            showTimeRange
            timeView
          />
        ),
      },
      day: {
        event: (props) => (
          <CalendarClassEvent
            {...props}
            onPaymentStatusChange={changePaymentStatus}
            showTimeRange
            timeView
          />
        ),
      },
      agenda: {
        event: (props) => (
          <div className="scheduly-calendar-agenda-event">
            <CalendarClassEvent {...props} hideStatus onPaymentStatusChange={changePaymentStatus} />
            <CalendarPaymentStatusSelect
              classItem={props.event.resource}
              onPaymentStatusChange={changePaymentStatus}
            />
          </div>
        ),
      },
    };
  }, [handlePaymentStatusChange]);

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Calendario</h1>
          <p className="text-sm text-muted-foreground">
            Arrastrá las clases para cambiar día u hora. Cambiá el estado de pago desde el bloque de
            cada clase.
          </p>
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full" style={{ background: 'var(--class-status-paid)' }} />
              Pago
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full" style={{ background: 'var(--class-status-unpaid)' }} />
              Pendiente
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full" style={{ background: 'var(--class-status-free)' }} />
              Gratis
            </span>
          </div>
        </div>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {slotError ? (
        <Alert variant="destructive">
          <AlertDescription>{slotError}</AlertDescription>
        </Alert>
      ) : null}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Cargando clases...
        </div>
      ) : null}

      <div
        ref={calendarRootRef}
        className="flex min-h-[20rem] flex-1 overflow-hidden rounded-xl border border-border bg-card"
      >
        <DnDCalendar
          allDayMaxRows={0}
          className="scheduly-calendar h-full min-h-[20rem] w-full border-0"
          components={calendarComponents}
          culture="es-UY"
          date={date}
          draggableAccessor={isEventDraggable}
          endAccessor="end"
          eventPropGetter={eventPropGetter}
          events={events}
          formats={calendarFormats}
          localizer={localizer}
          max={maxCalendarTime}
          messages={calendarMessages}
          min={minCalendarTime}
          onEventDrop={handleEventDrop}
          onEventResize={handleEventResize}
          onNavigate={handleNavigate}
          scrollToTime={scrollToCalendarTime}
          onSelectEvent={(event) => onEditClass(event.resource)}
          onSelectSlot={handleSelectSlot}
          onSelecting={handleSelectingWithDuration}
          onView={handleView}
          resizable={isEventResizable()}
          selectable
          slotPropGetter={slotPropGetter}
          startAccessor="start"
          step={CALENDAR_SLOT_MINUTES}
          timeslots={CALENDAR_TIMESLOTS_PER_HOUR}
          view={view}
          views={calendarViews}
        />
      </div>
    </section>
  );
}
