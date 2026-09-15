import { describe, expect, it } from 'vitest';
import { PRICE_BASE, PRICE_STEP } from '@/config/constants';
import type { Subject } from '@/types';
import { computeClassPrice, snapToValidPrice } from '@/utils/pricing';

describe('snapToValidPrice', () => {
  it('snaps to nearest PRICE_STEP and never below 0', () => {
    expect(snapToValidPrice(374)).toBe(350);
    expect(snapToValidPrice(376)).toBe(400);
    expect(snapToValidPrice(300)).toBe(300);
    expect(snapToValidPrice(100)).toBe(100);
    expect(snapToValidPrice(-20)).toBe(0);
    expect(snapToValidPrice(PRICE_BASE + PRICE_STEP / 2)).toBe(PRICE_BASE + PRICE_STEP);
  });
});

describe('computeClassPrice', () => {
  it('computes base and final price with surcharge', () => {
    const subject: Subject = {
      id: 's1',
      name: 'Prog',
      pricePerHour: 500,
      color: 'oklch(0.5 0.1 200)',
    };

    expect(computeClassPrice(subject, 2, 10)).toEqual({
      basePrice: 1000,
      surchargePercent: 10,
      finalPrice: 1100,
    });
  });

  it('prices quarter-hour durations without rounding up to a full hour', () => {
    const subject: Subject = {
      id: 's1',
      name: 'Prog',
      pricePerHour: 400,
      color: 'oklch(0.5 0.1 200)',
    };

    expect(computeClassPrice(subject, 0.25, 0)).toEqual({
      basePrice: 100,
      surchargePercent: 0,
      finalPrice: 100,
    });
    expect(computeClassPrice(subject, 1.5, 0)).toEqual({
      basePrice: 600,
      surchargePercent: 0,
      finalPrice: 600,
    });
  });
});
