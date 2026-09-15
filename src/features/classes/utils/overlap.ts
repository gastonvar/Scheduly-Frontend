import type { Class } from '@/types';
import { formatDate, formatTime } from '@/utils/format';

const HOUR_MS = 60 * 60 * 1000;

export function getClassEndDate(date: string, durationHours: number): Date {
  return new Date(new Date(date).getTime() + durationHours * HOUR_MS);
}

export function timeRangesOverlap(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
  return startA < endB && startB < endA;
}

export function findOverlappingClassInRange(
  classes: Class[],
  start: Date,
  end: Date,
  excludeClassId?: string,
): Class | undefined {
  return classes.find((classItem) => {
    if (excludeClassId && classItem.id === excludeClassId) {
      return false;
    }

    const existingStart = new Date(classItem.date);
    const existingEnd = getClassEndDate(classItem.date, classItem.durationHours);
    return timeRangesOverlap(start, end, existingStart, existingEnd);
  });
}

export function findOverlappingClass(
  classes: Class[],
  date: string,
  durationHours: number,
  excludeClassId?: string,
): Class | undefined {
  const start = new Date(date);
  const end = getClassEndDate(date, durationHours);
  return findOverlappingClassInRange(classes, start, end, excludeClassId);
}

export function formatOverlapError(classItem: Class): string {
  const end = getClassEndDate(classItem.date, classItem.durationHours);
  return `Ya hay una clase programada de ${formatTime(classItem.date)} a ${formatTime(end.toISOString())} (${formatDate(classItem.date)}).`;
}
