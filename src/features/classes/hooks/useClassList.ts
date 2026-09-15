import { useMemo, useState } from 'react';
import type { ClassFilterState } from '@/features/classes/hooks/useClassFilters';
import type { Class, Student, Subject } from '@/types';
import { resolveStudentNames, resolveSubjectName } from '@/utils/entityLabels';

const emptyFilters: ClassFilterState = {
  paymentStatus: 'all',
  subjectId: '',
  studentId: '',
};

type UseClassListParams = {
  classes: Class[];
  students: Student[];
  subjects: Subject[];
};

export function useClassList({ classes, students, subjects }: UseClassListParams) {
  const [filters, setFilters] = useState(emptyFilters);

  const filteredClasses = useMemo(
    () =>
      classes.filter((classItem) => {
        const statusMatch =
          filters.paymentStatus === 'all' || classItem.paymentStatus === filters.paymentStatus;
        const subjectMatch = !filters.subjectId || classItem.subjectId === filters.subjectId;
        const studentMatch = !filters.studentId || classItem.attendees.includes(filters.studentId);
        return statusMatch && subjectMatch && studentMatch;
      }),
    [classes, filters],
  );

  const subjectName = (subjectId: string): string => resolveSubjectName(subjectId, subjects);
  const attendeeNames = (attendees: string[]): string => resolveStudentNames(attendees, students);

  return {
    attendeeNames,
    filteredClasses,
    filters,
    setFilters,
    subjectName,
  };
}
