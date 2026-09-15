import type { SlotInfo } from 'react-big-calendar';

export function getDurationHoursFromRange(start: Date, end: Date): number {
  const diffMs = end.getTime() - start.getTime();

  if (diffMs <= 0) {
    return 1;
  }

  const hours = diffMs / (60 * 60 * 1000);

  if (hours >= 24) {
    return 1;
  }

  return Math.max(1, Math.ceil(hours));
}

export function getDurationHoursFromSlot(slot: SlotInfo): number {
  return getDurationHoursFromRange(slot.start, slot.end);
}
