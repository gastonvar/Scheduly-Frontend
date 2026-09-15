import type { Student, Subject } from '@/types';

export const FALLBACK_SUBJECT_NAME = 'Materia eliminada';
export const FALLBACK_STUDENT_NAME = 'Alumno eliminado';
export const FALLBACK_REFERRER_NAME = 'Alumno no encontrado';
export const NO_REFERRER_LABEL = 'Sin referido';

export function resolveSubjectName(
  subjectId: string,
  subjects: Array<Pick<Subject, 'id' | 'name'>>,
): string {
  return subjects.find((subject) => subject.id === subjectId)?.name ?? FALLBACK_SUBJECT_NAME;
}

export function resolveStudentName(
  studentId: string,
  students: Array<Pick<Student, 'id' | 'name'>>,
): string {
  return students.find((student) => student.id === studentId)?.name ?? FALLBACK_STUDENT_NAME;
}

export function resolveStudentNames(
  studentIds: string[],
  students: Array<Pick<Student, 'id' | 'name'>>,
): string {
  return studentIds
    .map((studentId) => students.find((student) => student.id === studentId)?.name)
    .filter(Boolean)
    .join(', ');
}

export function resolveReferrerName(
  studentId: string | null,
  students: Array<Pick<Student, 'id' | 'name'>>,
): string {
  if (!studentId) {
    return NO_REFERRER_LABEL;
  }

  return students.find((student) => student.id === studentId)?.name ?? FALLBACK_REFERRER_NAME;
}
