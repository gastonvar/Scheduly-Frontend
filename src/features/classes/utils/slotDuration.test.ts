import { describe, expect, it } from 'vitest';
import {
  durationHoursToMinutes,
  getDurationHoursFromRange,
  getDurationMinutesFromRange,
  snapDurationHours,
} from '@/features/classes/utils/slotDuration';

describe('snapDurationHours', () => {
  it('snaps to 15-minute increments and never below 15 minutes', () => {
    expect(snapDurationHours(0.2)).toBe(0.25);
    expect(snapDurationHours(0.4)).toBe(0.5);
    expect(snapDurationHours(1.24)).toBe(1.25);
    expect(snapDurationHours(0)).toBe(0.25);
    expect(snapDurationHours(Number.NaN)).toBe(0.25);
  });
});

describe('getDurationHoursFromRange', () => {
  it('uses 15-minute calendar blocks instead of rounding up to a full hour', () => {
    const start = new Date('2026-07-01T10:00:00.000Z');

    expect(getDurationHoursFromRange(start, new Date('2026-07-01T10:15:00.000Z'))).toBe(0.25);
    expect(getDurationHoursFromRange(start, new Date('2026-07-01T10:30:00.000Z'))).toBe(0.5);
    expect(getDurationHoursFromRange(start, new Date('2026-07-01T10:45:00.000Z'))).toBe(0.75);
    expect(getDurationHoursFromRange(start, new Date('2026-07-01T11:00:00.000Z'))).toBe(1);
    expect(getDurationHoursFromRange(start, new Date('2026-07-01T11:30:00.000Z'))).toBe(1.5);
  });

  it('falls back to 15 minutes for empty ranges and 1 hour for a full-day month selection', () => {
    const start = new Date('2026-07-01T00:00:00.000Z');

    expect(getDurationHoursFromRange(start, start)).toBe(0.25);
    expect(getDurationHoursFromRange(start, new Date('2026-07-02T00:00:00.000Z'))).toBe(1);
  });
});

describe('duration minutes', () => {
  it('converts hour ranges to total minutes', () => {
    const start = new Date('2026-07-01T10:00:00.000Z');

    expect(getDurationMinutesFromRange(start, new Date('2026-07-01T10:15:00.000Z'))).toBe(15);
    expect(getDurationMinutesFromRange(start, new Date('2026-07-01T11:30:00.000Z'))).toBe(90);
    expect(durationHoursToMinutes(0.25)).toBe(15);
    expect(durationHoursToMinutes(1.5)).toBe(90);
  });
});
