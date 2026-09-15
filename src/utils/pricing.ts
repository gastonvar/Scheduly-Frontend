import { PRICE_STEP, MIN_CLASS_DURATION_HOURS } from '@/config/constants';
import type { Subject } from '@/types';

export function snapToValidPrice(value: number): number {
  const snapped = Math.round(value / PRICE_STEP) * PRICE_STEP;
  return Math.max(0, snapped);
}

export function computeClassPrice(
  subject: Subject,
  durationHours: number,
  surchargePercent: number,
): { basePrice: number; surchargePercent: number; finalPrice: number } {
  const safeDuration = Math.max(MIN_CLASS_DURATION_HOURS, durationHours);
  const safeSurcharge = Math.max(0, surchargePercent);
  const basePrice = subject.pricePerHour * safeDuration;
  const finalPrice = basePrice * (1 + safeSurcharge / 100);

  return {
    basePrice,
    surchargePercent: safeSurcharge,
    finalPrice,
  };
}
