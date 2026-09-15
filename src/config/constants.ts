/** Default hourly price suggested when creating a new subject. */
export const PRICE_BASE = 350;
export const PRICE_STEP = 50;
export const DISCOUNT_PER_REFERRAL = 10;
export const MAX_DISCOUNT = 50;

/** Example subject hourly prices shown in the subject form. */
export const SUBJECT_PRICE_REFERENCES = [
  { name: 'Programación 1', pricePerHour: 350 },
  { name: 'Programación 2', pricePerHour: 500 },
  { name: 'Programación 3', pricePerHour: 650 },
] as const;
