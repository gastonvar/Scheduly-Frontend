import { useMemo, useState } from 'react';
import { getLastPaidClassForStudent } from '@/features/students/utils/lastPaidClass';
import { getPaidReferralCount, getStudentName } from '@/features/students/utils/referrals';
import type { Class, Student, Subject } from '@/types';
import { resolveSubjectName } from '@/utils/entityLabels';
import { filterStudentsBySearch } from '@/utils/studentSearch';

type UseStudentListParams = {
  classes: Class[];
  students: Student[];
  subjects: Subject[];
};

export function useStudentList({ classes, students, subjects }: UseStudentListParams) {
  const [search, setSearch] = useState('');
  const filteredStudents = useMemo(() => filterStudentsBySearch(students, search), [search, students]);

  const lastPaidClassForStudent = (studentId: string) => getLastPaidClassForStudent(studentId, classes);
  const paidReferralCountForStudent = (student: Student) => getPaidReferralCount(student, classes);
  const studentName = (studentId: string | null) => getStudentName(studentId, students);
  const subjectName = (subjectId: string) => resolveSubjectName(subjectId, subjects);

  return {
    filteredStudents,
    lastPaidClassForStudent,
    paidReferralCountForStudent,
    search,
    setSearch,
    studentName,
    subjectName,
  };
}
