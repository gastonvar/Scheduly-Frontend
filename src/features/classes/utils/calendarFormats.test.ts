import { describe, expect, it } from 'vitest';
import {
  formatCalendarSelectDuration,
  formatCalendarSelectRange,
  formatDurationMinutes,
} from '@/features/classes/utils/calendarFormats';

describe('formatDurationMinutes', () => {
  it('formats a compact Spanish minutes label', () => {
    expect(formatDurationMinutes(15)).toBe('15 min');
    expect(formatDurationMinutes(90)).toBe('90 min');
  });
});

describe('formatCalendarSelectRange', () => {
  it('keeps the date and time range while dragging a same-day slot', () => {
    expect(
      formatCalendarSelectRange({
        start: new Date(2026, 6, 1, 10, 0, 0),
        end: new Date(2026, 6, 1, 11, 15, 0),
      }),
    ).toBe('01/07/2026 10:00 – 11:15');
  });

  it('keeps date labels for full-day month selections', () => {
    expect(
      formatCalendarSelectRange({
        start: new Date(2026, 6, 1),
        end: new Date(2026, 6, 1),
      }),
    ).toBe('01/07/2026');
  });
});

describe('formatCalendarSelectDuration', () => {
  it('returns total minutes for a dragged time range', () => {
    expect(
      formatCalendarSelectDuration({
        start: new Date(2026, 6, 1, 10, 0, 0),
        end: new Date(2026, 6, 1, 11, 15, 0),
      }),
    ).toBe('75 min');
  });
});
