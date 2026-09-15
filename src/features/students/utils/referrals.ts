import type { Class, Student } from '@/types';
import { isClassPaid } from '@/utils/classPayment';
import { resolveReferrerName } from '@/utils/entityLabels';

export function getPaidReferralCount(student: Student, classes: Class[]): number {
  return student.referrals.filter((studentId) =>
    classes.some((classItem) => isClassPaid(classItem) && classItem.attendees.includes(studentId)),
  ).length;
}

export function getStudentName(studentId: string | null, students: Student[]): string {
  return resolveReferrerName(studentId, students);
}
