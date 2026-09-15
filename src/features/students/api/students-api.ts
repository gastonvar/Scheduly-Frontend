import { apiClient, unwrapData, type ApiEnvelope } from '@/lib/api-client';
import type { Student } from '@/types';
import { parseStudent, parseStudents } from '@/types/schemas';

export type StudentInput = Omit<Student, 'id'>;

export async function getStudents(): Promise<Student[]> {
  const response = await apiClient.get<ApiEnvelope<unknown>>('/api/students');
  return parseStudents(unwrapData(response));
}

export async function createStudent(input: StudentInput): Promise<Student> {
  const response = await apiClient.post<ApiEnvelope<unknown>>('/api/students', input);
  return parseStudent(unwrapData(response));
}

export async function updateStudent(id: string, input: Partial<Student>): Promise<Student> {
  const response = await apiClient.patch<ApiEnvelope<unknown>>(`/api/students/${id}`, input);
  return parseStudent(unwrapData(response));
}

export async function deleteStudent(id: string): Promise<void> {
  await apiClient.delete(`/api/students/${id}`);
}
