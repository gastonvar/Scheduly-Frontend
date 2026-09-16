import { describe, expect, it } from 'vitest';
import {
  buildClassesByDayMap,
  getDayHighlightForDate,
  getDayPaymentHighlight,
} from '@/features/classes/utils/calendarDayStatus';
import { fromLocalDateInput } from '@/utils/dateLocal';

describe('getDayPaymentHighlight', () => {
  it('returns null when there are no classes', () => {
    expect(getDayPaymentHighlight([])).toBeNull();
  });

  it('prioritizes pending over paid and free', () => {
    expect(
      getDayPaymentHighlight([
        { date: '2026-09-16T10:00:00.000Z', paymentStatus: 'paid' },
        { date: '2026-09-16T12:00:00.000Z', paymentStatus: 'unpaid' },
        { date: '2026-09-16T14:00:00.000Z', paymentStatus: 'free' },
      ]),
    ).toBe('unpaid');
  });

  it('returns paid when there is no pending class', () => {
    expect(
      getDayPaymentHighlight([
        { date: '2026-09-16T10:00:00.000Z', paymentStatus: 'paid' },
        { date: '2026-09-16T12:00:00.000Z', paymentStatus: 'free' },
      ]),
    ).toBe('paid');
  });

  it('returns free when every class is free', () => {
    expect(
      getDayPaymentHighlight([{ date: '2026-09-16T10:00:00.000Z', paymentStatus: 'free' }]),
    ).toBe('free');
  });
});

describe('buildClassesByDayMap', () => {
  it('groups classes by local day and resolves highlights', () => {
    const map = buildClassesByDayMap([
      { date: '2026-09-16T10:00:00.000Z', paymentStatus: 'paid' },
      { date: '2026-09-17T10:00:00.000Z', paymentStatus: 'unpaid' },
    ]);

    expect(getDayHighlightForDate(map, fromLocalDateInput('2026-09-16'))).toBe('paid');
    expect(getDayHighlightForDate(map, fromLocalDateInput('2026-09-17'))).toBe('unpaid');
    expect(getDayHighlightForDate(map, fromLocalDateInput('2026-09-18'))).toBeNull();
  });
});
