/** Default hourly price suggested when creating a new subject. */
export const PRICE_BASE = 350;
export const PRICE_STEP = 50;
export const DISCOUNT_PER_REFERRAL = 10;
export const MAX_DISCOUNT = 50;
export const CLASS_DURATION_STEP_HOURS = 0.25;
export const MIN_CLASS_DURATION_HOURS = 0.25;
export const CALENDAR_SLOT_MINUTES = 15;
export const CALENDAR_TIMESLOTS_PER_HOUR = 60 / CALENDAR_SLOT_MINUTES;
export const CALENDAR_TIME_INPUT_STEP_SECONDS = CALENDAR_SLOT_MINUTES * 60;

/** Example subject hourly prices shown in the subject form. */
export const SUBJECT_PRICE_REFERENCES = [
  { name: 'Programación 1', pricePerHour: 350 },
  { name: 'Programación 2', pricePerHour: 500 },
  { name: 'Programación 3', pricePerHour: 650 },
] as const;
