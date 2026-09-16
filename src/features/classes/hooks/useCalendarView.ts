import { useCallback, useEffect, useMemo, useState } from 'react';
import { Views } from 'react-big-calendar';
import type { EventPropGetter, SlotInfo, SlotPropGetter, View } from 'react-big-calendar';
import {
  findOverlappingClass,
  findOverlappingClassInRange,
  formatOverlapError,
} from '@/features/classes/utils/overlap';
import { getDurationHoursFromRange, getDurationHoursFromSlot } from '@/features/classes/utils/slotDuration';
import type { Class, ClassPaymentStatus, Student, Subject } from '@/types';
import { calendarEventClassName } from '@/utils/classStatus';
import { FALLBACK_SUBJECT_NAME, resolveStudentNames } from '@/utils/entityLabels';
import { getSubjectColor } from '@/utils/subjectColor';

export type ClassRescheduleInput = {
  id: string;
  date: string;
  durationHours: number;
};

type ClassOptimisticMove = {
  date: string;
  durationHours: number;
};

type ClassOptimisticPaymentStatus = Record<string, ClassPaymentStatus>;

export type ClassCalendarEvent = {
  id: string;
  title: string;
  subjectName: string;
  attendeeNames: string;
  start: Date;
  end: Date;
  paymentStatus: ClassPaymentStatus;
  subjectColor: string;
  resource: Class;
};

type UseCalendarViewParams = {
  classes: Class[];
  onCreateForSlot: (slot: { date: string; durationHours: number }) => void;
  onPaymentStatusChange: (classItem: Class, status: ClassPaymentStatus) => Promise<void>;
  onRescheduleClass: (input: ClassRescheduleInput) => Promise<void>;
  students: Student[];
  subjects: Subject[];
};

function applyOptimisticMoves(classes: Class[], moves: Record<string, ClassOptimisticMove>): Class[] {
  if (Object.keys(moves).length === 0) {
    return classes;
  }

  return classes.map((classItem) => {
    const move = moves[classItem.id];
    return move ? { ...classItem, date: move.date, durationHours: move.durationHours } : classItem;
  });
}

function applyOptimisticPaymentStatus(
  classes: Class[],
  statusOverrides: ClassOptimisticPaymentStatus,
): Class[] {
  if (Object.keys(statusOverrides).length === 0) {
    return classes;
  }

  return classes.map((classItem) => {
    const paymentStatus = statusOverrides[classItem.id];
    return paymentStatus === undefined ? classItem : { ...classItem, paymentStatus };
  });
}

function classesToEvents(classes: Class[], subjects: Subject[], students: Student[]): ClassCalendarEvent[] {
  return classes.map((classItem) => {
    const startDate = new Date(classItem.date);
    const endDate = new Date(startDate.getTime() + classItem.durationHours * 60 * 60 * 1000);
    const subject = subjects.find((item) => item.id === classItem.subjectId);
    const attendeeNames = resolveStudentNames(classItem.attendees, students);
    const subjectName = subject?.name ?? FALLBACK_SUBJECT_NAME;
    const title = [subjectName, attendeeNames].filter(Boolean).join(' — ');

    return {
      id: classItem.id,
      title,
      subjectName,
      attendeeNames,
      end: endDate,
      paymentStatus: classItem.paymentStatus,
      resource: classItem,
      start: startDate,
      subjectColor: getSubjectColor(subject),
    };
  });
}

function defaultCalendarView(): View {
  if (typeof window === 'undefined') {
    return Views.WEEK;
  }

  return window.matchMedia('(min-width: 1024px)').matches ? Views.WEEK : Views.DAY;
}

function defaultDesktopState(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches;
}

export function useCalendarView({
  classes,
  onCreateForSlot,
  onPaymentStatusChange,
  onRescheduleClass,
  students,
  subjects,
}: UseCalendarViewParams) {
  const [date, setDate] = useState(() => new Date());
  const [view, setView] = useState<View>(defaultCalendarView);
  const [isDesktop, setIsDesktop] = useState(defaultDesktopState);
  const [slotError, setSlotError] = useState<string | null>(null);
  const [optimisticMoves, setOptimisticMoves] = useState<Record<string, ClassOptimisticMove>>({});
  const [optimisticPaymentStatus, setOptimisticPaymentStatus] = useState<ClassOptimisticPaymentStatus>(
    {},
  );

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');

    function syncCalendarForViewport() {
      setIsDesktop(media.matches);
      if (!media.matches) {
        setView((current) =>
          current === Views.MONTH || current === Views.WEEK ? Views.DAY : current,
        );
      }
    }

    syncCalendarForViewport();
    media.addEventListener('change', syncCalendarForViewport);
    return () => media.removeEventListener('change', syncCalendarForViewport);
  }, []);

  const displayClasses = useMemo(() => {
    const movedClasses = applyOptimisticMoves(classes, optimisticMoves);
    return applyOptimisticPaymentStatus(movedClasses, optimisticPaymentStatus);
  }, [classes, optimisticMoves, optimisticPaymentStatus]);

  const events = useMemo(
    () => classesToEvents(displayClasses, subjects, students),
    [displayClasses, subjects, students],
  );

  const eventPropGetter: EventPropGetter<ClassCalendarEvent> = (event) => ({
    className: calendarEventClassName(event.resource),
  });

  const slotPropGetter: SlotPropGetter = (date) => {
    const hourParity = date.getHours() % 2 === 0 ? 'even' : 'odd';
    const minutes = date.getMinutes();
    const isHourStart = minutes === 0;
    const isHalfHour = minutes === 30;

    return {
      className: [
        'scheduly-hour-slot',
        `scheduly-hour-${hourParity}`,
        isHourStart ? 'scheduly-hour-boundary' : '',
        isHalfHour ? 'scheduly-half-hour-boundary' : '',
      ]
        .filter(Boolean)
        .join(' '),
    };
  };

  function handleNavigate(nextDate: Date) {
    setDate(nextDate);
    setSlotError(null);
  }

  async function rescheduleClassFromRange(classItem: Class, start: Date, end: Date) {
    const nextDate = start.toISOString();
    const nextDurationHours = getDurationHoursFromRange(start, end);
    const currentStart = new Date(classItem.date).getTime();
    const currentDuration = classItem.durationHours;

    if (currentStart === start.getTime() && currentDuration === nextDurationHours) {
      return;
    }

    const overlapping = findOverlappingClass(displayClasses, nextDate, nextDurationHours, classItem.id);

    if (overlapping) {
      setSlotError(formatOverlapError(overlapping));
      return;
    }

    setSlotError(null);
    setOptimisticMoves((current) => ({
      ...current,
      [classItem.id]: { date: nextDate, durationHours: nextDurationHours },
    }));

    try {
      await onRescheduleClass({
        id: classItem.id,
        date: nextDate,
        durationHours: nextDurationHours,
      });
      setOptimisticMoves((current) => {
        const next = { ...current };
        delete next[classItem.id];
        return next;
      });
    } catch {
      setOptimisticMoves((current) => {
        const next = { ...current };
        delete next[classItem.id];
        return next;
      });
      setSlotError('No se pudo reprogramar la clase.');
    }
  }

  function handleEventDrop({ event, start, end }: { event: ClassCalendarEvent; start: Date; end: Date }) {
    void rescheduleClassFromRange(event.resource, start, end);
  }

  function handleEventResize({ event, start, end }: { event: ClassCalendarEvent; start: Date; end: Date }) {
    void rescheduleClassFromRange(event.resource, start, end);
  }

  function handleSelectSlot(slot: SlotInfo) {
    const date = slot.start.toISOString();
    const durationHours = getDurationHoursFromSlot(slot);
    const overlapping = findOverlappingClass(displayClasses, date, durationHours);

    if (overlapping) {
      setSlotError(formatOverlapError(overlapping));
      return;
    }

    setSlotError(null);
    onCreateForSlot({ date, durationHours });
  }

  function handleSelecting(range: { start: Date; end: Date }) {
    return !findOverlappingClassInRange(displayClasses, range.start, range.end);
  }

  function isEventDraggable() {
    return isDesktop && view !== Views.AGENDA;
  }

  function isEventResizable() {
    return isDesktop && (view === Views.WEEK || view === Views.DAY);
  }

  function handleView(nextView: View) {
    setView(nextView);
    setSlotError(null);
  }

  const handlePaymentStatusChange = useCallback(
    async (classItem: Class, status: ClassPaymentStatus) => {
      if (classItem.paymentStatus === status) {
        return;
      }

      setOptimisticPaymentStatus((current) => ({
        ...current,
        [classItem.id]: status,
      }));

      try {
        await onPaymentStatusChange(classItem, status);
        setOptimisticPaymentStatus((current) => {
          const next = { ...current };
          delete next[classItem.id];
          return next;
        });
      } catch {
        setOptimisticPaymentStatus((current) => {
          const next = { ...current };
          delete next[classItem.id];
          return next;
        });
        setSlotError('No se pudo actualizar el estado de pago.');
      }
    },
    [onPaymentStatusChange],
  );

  return {
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
    isDesktop,
    slotError,
    slotPropGetter,
    view,
  };
}
