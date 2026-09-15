import { describe, expect, it } from 'vitest';
import {
  computeDashboardMetrics,
  filterClassesInRange,
  getDefaultDateRange,
} from '@/features/dashboard/utils/dashboardMetrics';
import type { Class, Student, Subject } from '@/types';

function makeClass(overrides: Partial<Class> = {}): Class {
  return {
    id: 'class-1',
    date: '2026-07-05T15:00:00.000Z',
    durationHours: 2,
    subjectId: 'subject-1',
    attendees: ['student-1'],
    paymentStatus: 'paid',
    basePrice: 700,
    surchargePercent: 0,
    finalPrice: 700,
    ...overrides,
  };
}

const subjects: Subject[] = [
  { id: 'subject-1', name: 'Prog 1', pricePerHour: 350, color: 'oklch(0.5 0.1 200)' },
];

const students: Student[] = [
  {
    id: 'student-1',
    name: 'Ana',
    contacts: [],
    referredBy: null,
    referrals: [],
    discountPercent: 10,
  },
];

describe('dashboardMetrics', () => {
  it('filters classes by local date range', () => {
    const classes = [
      makeClass({ id: 'in', date: '2026-07-05T15:00:00.000Z' }),
      makeClass({ id: 'out', date: '2026-08-05T15:00:00.000Z' }),
    ];

    const filtered = filterClassesInRange(classes, { from: '2026-07-01', to: '2026-07-31' });
    expect(filtered.map((item) => item.id)).toEqual(['in']);
  });

  it('computes paid and pending revenue and ignores free classes in collection rate', () => {
    const classes = [
      makeClass({ id: 'paid', paymentStatus: 'paid', finalPrice: 700 }),
      makeClass({ id: 'unpaid', paymentStatus: 'unpaid', finalPrice: 350 }),
      makeClass({ id: 'free', paymentStatus: 'free', finalPrice: 0, basePrice: 0 }),
    ];

    const metrics = computeDashboardMetrics(classes, students, subjects, {
      from: '2026-07-01',
      to: '2026-07-31',
    });

    expect(metrics.paidRevenue).toBe(700);
    expect(metrics.pendingRevenue).toBe(350);
    expect(metrics.freeClasses).toBe(1);
    expect(metrics.collectionRate).toBe(50);
  });

  it('returns a default range even with empty classes', () => {
    const range = getDefaultDateRange([], new Date('2026-07-15T12:00:00'));
    expect(range.from).toMatch(/^2026-07-/);
    expect(range.to).toMatch(/^2026-07-/);
  });
});
