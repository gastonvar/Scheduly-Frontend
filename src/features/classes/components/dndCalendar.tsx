import type { ComponentType } from 'react';
import { Calendar } from 'react-big-calendar';
import type { CalendarProps } from 'react-big-calendar';
import dragAndDropModule from 'react-big-calendar/lib/addons/dragAndDrop/index.js';
import type { ClassCalendarEvent } from '@/features/classes/hooks/useCalendarView';

export type DnDCalendarProps = CalendarProps<ClassCalendarEvent> & {
  draggableAccessor?: () => boolean;
  onEventDrop?: (args: { event: ClassCalendarEvent; start: Date; end: Date }) => void;
  onEventResize?: (args: { event: ClassCalendarEvent; start: Date; end: Date }) => void;
  resizable?: boolean;
};

function resolveWithDragAndDrop(module: unknown) {
  const unwrap = (value: unknown): ((calendar: typeof Calendar) => ComponentType<unknown>) | null => {
    if (typeof value === 'function') {
      return value as (calendar: typeof Calendar) => ComponentType<unknown>;
    }

    if (value && typeof value === 'object' && 'default' in value) {
      return unwrap((value as { default: unknown }).default);
    }

    return null;
  };

  const resolved = unwrap(module);

  if (!resolved) {
    throw new Error('No se pudo cargar el addon de arrastre del calendario.');
  }

  return resolved;
}

const withDragAndDrop = resolveWithDragAndDrop(dragAndDropModule);

export const DnDCalendar = withDragAndDrop(Calendar) as ComponentType<DnDCalendarProps>;
