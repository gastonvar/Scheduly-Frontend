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
});
