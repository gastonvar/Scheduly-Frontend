import type { Class, ClassPaymentStatus } from '@/types';

export function isClassPaid(classItem: Pick<Class, 'paymentStatus'>): boolean {
  return classItem.paymentStatus === 'paid';
}

export function isClassFree(classItem: Pick<Class, 'paymentStatus'>): boolean {
  return classItem.paymentStatus === 'free';
}

export function isClassUnpaid(classItem: Pick<Class, 'paymentStatus'>): boolean {
  return classItem.paymentStatus === 'unpaid';
}

export function isClassBillable(classItem: Pick<Class, 'paymentStatus'>): boolean {
  return classItem.paymentStatus !== 'free';
}

export function toggleBillablePaymentStatus(status: ClassPaymentStatus): ClassPaymentStatus {
  if (status === 'free') {
    return 'free';
  }

  return status === 'paid' ? 'unpaid' : 'paid';
}
