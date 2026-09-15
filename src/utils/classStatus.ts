import type { Class, ClassPaymentStatus } from '@/types';
import {
  isClassBillable,
  isClassFree,
  isClassPaid,
  isClassUnpaid,
  toggleBillablePaymentStatus,
} from '@/utils/classPayment';

export type ClassStatus = ClassPaymentStatus;

export const CLASS_PAYMENT_STATUS_OPTIONS: Array<{ value: ClassPaymentStatus; label: string }> = [
  { value: 'unpaid', label: 'Pendiente' },
  { value: 'paid', label: 'Pago' },
  { value: 'free', label: 'Gratis' },
];

export {
  isClassBillable,
  isClassFree,
  isClassPaid,
  isClassUnpaid,
  toggleBillablePaymentStatus,
};

export function getClassStatus(classItem: Pick<Class, 'paymentStatus'>): ClassStatus {
  return classItem.paymentStatus;
}

export function classStatusClassName(classItem: Pick<Class, 'paymentStatus'>) {
  const status = getClassStatus(classItem);
  if (status === 'free') return 'scheduly-class-status-free';
  if (status === 'paid') return 'scheduly-class-status-paid';
  return 'scheduly-class-status-unpaid';
}

export function classStatusLabel(classItem: Pick<Class, 'paymentStatus'>) {
  const status = getClassStatus(classItem);
  if (status === 'free') return 'Gratis';
  if (status === 'paid') return 'Pago';
  return 'Pendiente';
}

export function classStatusBorderColor(classItem: Pick<Class, 'paymentStatus'>) {
  const status = getClassStatus(classItem);
  if (status === 'free') return 'var(--class-status-free)';
  if (status === 'paid') return 'var(--class-status-paid)';
  return 'var(--class-status-unpaid)';
}

export function calendarEventClassName(classItem: Pick<Class, 'paymentStatus'>) {
  const status = getClassStatus(classItem);
  if (status === 'free') return 'scheduly-calendar-event-free';
  if (status === 'paid') return 'scheduly-calendar-event-paid';
  return 'scheduly-calendar-event-unpaid';
}
