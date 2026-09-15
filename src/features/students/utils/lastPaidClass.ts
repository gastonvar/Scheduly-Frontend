import type { Class } from '@/types';
import { isClassPaid } from '@/utils/classPayment';

export function getLastPaidClassForStudent(studentId: string, classes: Class[]): Class | null {
  return (
    classes
      .filter((classItem) => isClassPaid(classItem) && classItem.attendees.includes(studentId))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] ?? null
  );
}
