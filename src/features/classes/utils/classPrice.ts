import type { Student, Subject } from '@/types';
import { applyDiscount } from '@/utils/discounts';
import { computeClassPrice } from '@/utils/pricing';

export type ClassUnitPrice = {
  basePrice: number;
  surchargePercent: number;
  finalPrice: number;
};

export function computeClassPriceFromSubject(
  subject: Subject | undefined,
  durationHours: number,
  surchargePercent: number,
): ClassUnitPrice {
  if (!subject) {
    return { basePrice: 0, surchargePercent: 0, finalPrice: 0 };
  }

  return computeClassPrice(subject, durationHours, surchargePercent);
}

export function computeClassTotals(unitPrice: ClassUnitPrice, attendees: Student[]): ClassUnitPrice {
  if (attendees.length === 0) {
    return { basePrice: 0, finalPrice: 0, surchargePercent: unitPrice.surchargePercent };
  }

  return {
    basePrice: attendees.length * unitPrice.basePrice,
    finalPrice: attendees.reduce(
      (total, student) => total + applyDiscount(unitPrice.finalPrice, student.discountPercent),
      0,
    ),
    surchargePercent: unitPrice.surchargePercent,
  };
}
