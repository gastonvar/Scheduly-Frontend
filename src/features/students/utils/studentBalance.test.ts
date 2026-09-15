import { describe, expect, it } from 'vitest';
import { computeStudentBalance } from '@/features/students/utils/studentBalance';
import type { Class, Student, Subject } from '@/types';

const student: Student = {
  id: 'student-1',
  name: 'Ana',
  contacts: [],
  referredBy: null,
  referrals: [],
  discountPercent: 0,
};

const subjects: Subject[] = [
  { id: 'subject-1', name: 'Prog 1', pricePerHour: 350, color: 'oklch(0.5 0.1 200)' },
];

function makeClass(overrides: Partial<Class> = {}): Class {
  return {
    id: 'class-1',
    date: '2026-07-05T15:00:00.000Z',
    durationHours: 1,
    subjectId: 'subject-1',
    attendees: ['student-1', 'student-2'],
    paymentStatus: 'unpaid',
    basePrice: 700,
    surchargePercent: 0,
    finalPrice: 700,
    ...overrides,
  };
}

describe('computeStudentBalance', () => {
  it('splits unpaid class price across attendees', () => {
    const balance = computeStudentBalance(student, [makeClass()], subjects);
    expect(balance.unpaidClasses).toHaveLength(1);
    expect(balance.unpaidClasses[0].shareAmount).toBe(350);
    expect(balance.unpaidTotal).toBe(350);
  });

  it('ignores free classes and tracks last paid date', () => {
    const classes = [
      makeClass({ id: 'free', paymentStatus: 'free', finalPrice: 0 }),
      makeClass({
        id: 'paid-old',
        paymentStatus: 'paid',
        date: '2026-06-01T15:00:00.000Z',
        attendees: ['student-1'],
      }),
      makeClass({
        id: 'paid-new',
        paymentStatus: 'paid',
        date: '2026-07-01T15:00:00.000Z',
        attendees: ['student-1'],
      }),
    ];

    const balance = computeStudentBalance(student, classes, subjects);
    expect(balance.unpaidTotal).toBe(0);
    expect(balance.paidClassesCount).toBe(2);
    expect(balance.lastPaidDate).toBe('2026-07-01T15:00:00.000Z');
  });
});
