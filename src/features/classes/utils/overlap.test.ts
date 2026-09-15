import { describe, expect, it } from 'vitest';
import {
  findOverlappingClass,
  findOverlappingClassInRange,
  getClassEndDate,
  timeRangesOverlap,
} from '@/features/classes/utils/overlap';
import type { Class } from '@/types';

function makeClass(overrides: Partial<Class> = {}): Class {
  return {
    id: 'class-1',
    date: '2026-07-01T10:00:00.000Z',
    durationHours: 1,
    subjectId: 'subject-1',
    attendees: ['student-1'],
    paymentStatus: 'unpaid',
    basePrice: 350,
    surchargePercent: 0,
    finalPrice: 350,
    ...overrides,
  };
}

describe('timeRangesOverlap', () => {
  it('detects overlapping ranges and ignores touching edges', () => {
    const startA = new Date('2026-07-01T10:00:00.000Z');
    const endA = new Date('2026-07-01T11:00:00.000Z');
    const startB = new Date('2026-07-01T10:30:00.000Z');
    const endB = new Date('2026-07-01T11:30:00.000Z');
    const startC = new Date('2026-07-01T11:00:00.000Z');
    const endC = new Date('2026-07-01T12:00:00.000Z');

    expect(timeRangesOverlap(startA, endA, startB, endB)).toBe(true);
    expect(timeRangesOverlap(startA, endA, startC, endC)).toBe(false);
  });
});

describe('findOverlappingClass', () => {
  it('finds overlaps and can exclude a class id', () => {
    const classes = [
      makeClass({ id: 'a', date: '2026-07-01T10:00:00.000Z', durationHours: 1 }),
      makeClass({ id: 'b', date: '2026-07-01T12:00:00.000Z', durationHours: 1 }),
    ];

    expect(findOverlappingClass(classes, '2026-07-01T10:30:00.000Z', 1)?.id).toBe('a');
    expect(findOverlappingClass(classes, '2026-07-01T10:30:00.000Z', 1, 'a')).toBeUndefined();
    expect(findOverlappingClass(classes, '2026-07-01T13:00:00.000Z', 1)).toBeUndefined();
  });

  it('detects overlaps for 15-minute classes', () => {
    const classes = [makeClass({ id: 'a', date: '2026-07-01T10:00:00.000Z', durationHours: 0.25 })];

    expect(findOverlappingClass(classes, '2026-07-01T10:00:00.000Z', 0.25)?.id).toBe('a');
    expect(findOverlappingClass(classes, '2026-07-01T10:15:00.000Z', 0.25)).toBeUndefined();
  });
});

describe('findOverlappingClassInRange', () => {
  it('uses exact range bounds without ceil rounding', () => {
    const classes = [makeClass({ id: 'a', date: '2026-07-01T11:00:00.000Z', durationHours: 1 })];
    const start = new Date('2026-07-01T10:30:00.000Z');
    const end = new Date('2026-07-01T11:00:00.000Z');

    expect(findOverlappingClassInRange(classes, start, end)).toBeUndefined();
    expect(getClassEndDate('2026-07-01T10:00:00.000Z', 1).toISOString()).toBe('2026-07-01T11:00:00.000Z');
  });
});
