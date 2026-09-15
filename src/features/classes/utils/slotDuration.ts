import type { SlotInfo } from 'react-big-calendar';
import { CLASS_DURATION_STEP_HOURS, MIN_CLASS_DURATION_HOURS } from '@/config/constants';

const SLOT_MS = CLASS_DURATION_STEP_HOURS * 60 * 60 * 1000;

export function snapDurationHours(value: number): number {
  if (!Number.isFinite(value)) {
    return MIN_CLASS_DURATION_HOURS;
  }

  const snapped = Math.round(value / CLASS_DURATION_STEP_HOURS) * CLASS_DURATION_STEP_HOURS;
  return Math.max(MIN_CLASS_DURATION_HOURS, Number(snapped.toFixed(2)));
}

export function getDurationHoursFromRange(start: Date, end: Date): number {
  const diffMs = end.getTime() - start.getTime();

  if (diffMs <= 0) {
    return MIN_CLASS_DURATION_HOURS;
  }

  const hours = diffMs / (60 * 60 * 1000);

  if (hours >= 24) {
    return 1;
  }

  const slots = Math.max(1, Math.ceil(diffMs / SLOT_MS - 1e-10));
  return snapDurationHours(slots * CLASS_DURATION_STEP_HOURS);
}

export function getDurationMinutesFromRange(start: Date, end: Date): number {
  return Math.round(getDurationHoursFromRange(start, end) * 60);
}

export function durationHoursToMinutes(durationHours: number): number {
  return Math.round(snapDurationHours(durationHours) * 60);
}

export function getDurationHoursFromSlot(slot: SlotInfo): number {
  return getDurationHoursFromRange(slot.start, slot.end);
}
