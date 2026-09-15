export type ContactType = 'Email' | 'Phone' | 'WhatsApp' | 'Discord';

export type Contact = {
  id: string;
  type: ContactType;
  value: string;
};

export type Student = {
  id: string;
  name: string;
  contacts: Contact[];
  referredBy: string | null;
  referrals: string[];
  discountPercent: number;
};

export type Subject = {
  id: string;
  name: string;
  pricePerHour: number;
  color: string;
};

/** Mutually exclusive payment state for a class session. */
export type ClassPaymentStatus = 'paid' | 'unpaid' | 'free';

export type Class = {
  id: string;
  date: string;
  durationHours: number;
  subjectId: string;
  attendees: string[];
  paymentStatus: ClassPaymentStatus;
  basePrice: number;
  surchargePercent: number;
  finalPrice: number;
};

export const CSRF_COOKIE_NAME = 'scheduly.csrf';
export const CSRF_HEADER_NAME = 'x-csrf-token';

export type User = {
  id: string;
  email: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};
