/** Display/preview helpers. The backend owns persisted `discountPercent` and cascades. */
import { DISCOUNT_PER_REFERRAL, MAX_DISCOUNT } from '@/config/constants';
import type { Class, Student } from '@/types';
import { isClassPaid } from '@/utils/classPayment';

export function computeStudentDiscount(student: Student, allClasses: Class[]): number {
  const qualifyingReferrals = student.referrals.filter((studentId) =>
    allClasses.some((classItem) => isClassPaid(classItem) && classItem.attendees.includes(studentId)),
  );

  return Math.min(qualifyingReferrals.length * DISCOUNT_PER_REFERRAL, MAX_DISCOUNT);
}

export function applyDiscount(price: number, discountPercent: number): number {
  return price * (1 - discountPercent / 100);
}
