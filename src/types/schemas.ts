import { z } from 'zod';
import type { Class, Contact, Student, Subject } from '@/types';

export const contactTypeSchema = z.enum(['Email', 'Phone', 'WhatsApp', 'Discord']);

export const contactSchema = z.object({
  id: z.string().min(1),
  type: contactTypeSchema,
  value: z.string(),
});

export const studentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  contacts: z.array(contactSchema),
  referredBy: z.string().nullable(),
  referrals: z.array(z.string()),
  discountPercent: z.number(),
});

export const subjectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  pricePerHour: z.number().nonnegative(),
  color: z.string().min(1),
});

export const classPaymentStatusSchema = z.enum(['paid', 'unpaid', 'free']);

export const classSchema = z.object({
  id: z.string().min(1),
  date: z.string().min(1),
  durationHours: z.number().positive(),
  subjectId: z.string().min(1),
  attendees: z.array(z.string()),
  paymentStatus: classPaymentStatusSchema,
  basePrice: z.number().nonnegative(),
  surchargePercent: z.number().nonnegative(),
  finalPrice: z.number().nonnegative(),
});

export function parseStudents(data: unknown): Student[] {
  return z.array(studentSchema).parse(data);
}

export function parseStudent(data: unknown): Student {
  return studentSchema.parse(data);
}

export function parseSubjects(data: unknown): Subject[] {
  return z.array(subjectSchema).parse(data);
}

export function parseSubject(data: unknown): Subject {
  return subjectSchema.parse(data);
}

export function parseClasses(data: unknown): Class[] {
  return z.array(classSchema).parse(data);
}

export function parseClass(data: unknown): Class {
  return classSchema.parse(data);
}

export function parseContact(data: unknown): Contact {
  return contactSchema.parse(data);
}
