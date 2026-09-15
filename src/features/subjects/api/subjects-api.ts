import { apiClient, unwrapData, type ApiEnvelope } from '@/lib/api-client';
import type { Subject } from '@/types';
import { parseSubject, parseSubjects } from '@/types/schemas';
import { snapToValidPrice } from '@/utils/pricing';
import { generateRandomSubjectColor } from '@/utils/subjectColor';

export type SubjectInput = Omit<Subject, 'id' | 'color'>;

export async function getSubjects(): Promise<Subject[]> {
  const response = await apiClient.get<ApiEnvelope<unknown>>('/api/subjects');
  return parseSubjects(unwrapData(response));
}

export async function createSubject(input: SubjectInput): Promise<Subject> {
  const existingSubjects = await getSubjects();

  const response = await apiClient.post<ApiEnvelope<unknown>>('/api/subjects', {
    ...input,
    color: generateRandomSubjectColor(existingSubjects.map((subject) => subject.color)),
    pricePerHour: snapToValidPrice(input.pricePerHour),
  });
  return parseSubject(unwrapData(response));
}

export async function updateSubject(id: string, input: Partial<Subject>): Promise<Subject> {
  const response = await apiClient.patch<ApiEnvelope<unknown>>(`/api/subjects/${id}`, {
    ...input,
    pricePerHour: input.pricePerHour === undefined ? undefined : snapToValidPrice(input.pricePerHour),
  });
  return parseSubject(unwrapData(response));
}

export async function deleteSubject(id: string): Promise<void> {
  await apiClient.delete(`/api/subjects/${id}`);
}
