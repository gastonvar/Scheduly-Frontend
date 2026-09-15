import { apiClient, unwrapData, type ApiEnvelope } from '@/lib/api-client';
import type { Class, ClassPaymentStatus } from '@/types';
import { parseClass, parseClasses } from '@/types/schemas';
import { toggleBillablePaymentStatus } from '@/utils/classPayment';

export type ClassInput = Omit<Class, 'id'>;

export async function getClasses(): Promise<Class[]> {
  const response = await apiClient.get<ApiEnvelope<unknown>>('/api/classes');
  return parseClasses(unwrapData(response));
}

export async function createClass(input: ClassInput): Promise<Class> {
  const response = await apiClient.post<ApiEnvelope<unknown>>('/api/classes', input);
  return parseClass(unwrapData(response));
}

export async function updateClass(id: string, input: Partial<Class>): Promise<Class> {
  const response = await apiClient.patch<ApiEnvelope<unknown>>(`/api/classes/${id}`, input);
  return parseClass(unwrapData(response));
}

export async function deleteClass(id: string): Promise<void> {
  await apiClient.delete(`/api/classes/${id}`);
}

export async function updateClassPaymentStatus(
  id: string,
  paymentStatus: ClassPaymentStatus,
): Promise<Class> {
  const response = await apiClient.patch<ApiEnvelope<unknown>>(`/api/classes/${id}/payment-status`, {
    paymentStatus,
  });
  return parseClass(unwrapData(response));
}

export async function togglePaid(id: string, currentStatus: ClassPaymentStatus): Promise<Class> {
  return updateClassPaymentStatus(id, toggleBillablePaymentStatus(currentStatus));
}
