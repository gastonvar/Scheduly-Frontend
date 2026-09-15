import { describe, expect, it } from 'vitest';
import { DISCOUNT_PER_REFERRAL, MAX_DISCOUNT } from '@/config/constants';
import type { Class, Student } from '@/types';
import { applyDiscount, computeStudentDiscount } from '@/utils/discounts';

function makeStudent(overrides: Partial<Student> = {}): Student {
  return {
    id: 'student-1',
    name: 'Ana',
    contacts: [],
    referredBy: null,
    referrals: [],
    discountPercent: 0,
    ...overrides,
  };
}

function makeClass(overrides: Partial<Class> = {}): Class {
  return {
    id: 'class-1',
    date: '2026-01-01T10:00:00.000Z',
    durationHours: 1,
    subjectId: 'subject-1',
    attendees: [],
    paymentStatus: 'unpaid',
    basePrice: 350,
    surchargePercent: 0,
    finalPrice: 350,
    ...overrides,
  };
}

describe('computeStudentDiscount', () => {
  it('returns 0 when there are no paid referral classes', () => {
    const student = makeStudent({ referrals: ['ref-1'] });
    const classes = [makeClass({ attendees: ['ref-1'], paymentStatus: 'unpaid' })];
    expect(computeStudentDiscount(student, classes)).toBe(0);
  });

  it('counts each paid referral once', () => {
    const student = makeStudent({ referrals: ['ref-1', 'ref-2'] });
    const classes = [
      makeClass({ id: 'c1', attendees: ['ref-1'], paymentStatus: 'paid' }),
      makeClass({ id: 'c2', attendees: ['ref-1'], paymentStatus: 'paid' }),
      makeClass({ id: 'c3', attendees: ['ref-2'], paymentStatus: 'paid' }),
    ];
    expect(computeStudentDiscount(student, classes)).toBe(2 * DISCOUNT_PER_REFERRAL);
  });

  it('caps discount at MAX_DISCOUNT', () => {
    const referrals = Array.from({ length: 10 }, (_, index) => `ref-${index}`);
    const student = makeStudent({ referrals });
    const classes = referrals.map((studentId, index) =>
      makeClass({ id: `c-${index}`, attendees: [studentId], paymentStatus: 'paid' }),
    );
    expect(computeStudentDiscount(student, classes)).toBe(MAX_DISCOUNT);
  });
});

describe('applyDiscount', () => {
  it('applies percentage discount', () => {
    expect(applyDiscount(1000, 10)).toBe(900);
  });
});
