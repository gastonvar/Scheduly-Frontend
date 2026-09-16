import type { Class, ClassPaymentStatus } from '@/types';
import { toLocalDateInput } from '@/utils/dateLocal';

export type DayClassHighlight = ClassPaymentStatus;

type ClassDayInput = Pick<Class, 'date' | 'paymentStatus'>;

export function getDayPaymentHighlight(classes: ClassDayInput[]): DayClassHighlight | null {
  if (classes.length === 0) {
    return null;
  }

  if (classes.some((classItem) => classItem.paymentStatus === 'unpaid')) {
    return 'unpaid';
  }

  if (classes.some((classItem) => classItem.paymentStatus === 'paid')) {
    return 'paid';
  }

  return 'free';
}

export function buildClassesByDayMap(classes: ClassDayInput[]): Map<string, ClassDayInput[]> {
  const map = new Map<string, ClassDayInput[]>();

  for (const classItem of classes) {
    const key = toLocalDateInput(new Date(classItem.date));
    const dayClasses = map.get(key) ?? [];
    dayClasses.push(classItem);
    map.set(key, dayClasses);
  }

  return map;
}

export function getDayHighlightForDate(
  classesByDay: Map<string, ClassDayInput[]>,
  date: Date,
): DayClassHighlight | null {
  const key = toLocalDateInput(date);
  return getDayPaymentHighlight(classesByDay.get(key) ?? []);
}

export function dayHighlightClassName(highlight: DayClassHighlight | null): string {
  if (highlight === 'unpaid') {
    return 'scheduly-calendar-overview-day--unpaid';
  }

  if (highlight === 'paid') {
    return 'scheduly-calendar-overview-day--paid';
  }

  if (highlight === 'free') {
    return 'scheduly-calendar-overview-day--free';
  }

  return '';
}
