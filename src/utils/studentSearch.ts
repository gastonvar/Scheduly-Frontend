import type { Student } from '@/types';

export function filterStudentsBySearch(students: Student[], query: string): Student[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return students;

  return students.filter((student) => {
    if (student.name.toLowerCase().includes(normalized)) return true;
    return student.contacts.some((contact) => contact.value.toLowerCase().includes(normalized));
  });
}
