import { createContext, useContext, useMemo, useState } from 'react';
import { filterStudentsBySearch } from '@/utils/studentSearch';
import type { Student, Subject } from '@/types';

export type PaymentStatusFilter = 'all' | 'paid' | 'unpaid' | 'free';

export type ClassFilterState = {
  paymentStatus: PaymentStatusFilter;
  subjectId: string;
  studentId: string;
};

type UseClassFiltersRootParams = {
  filters: ClassFilterState;
  onChange: (filters: ClassFilterState) => void;
  students: Student[];
  subjects: Subject[];
};

type ClassFiltersContextValue = {
  filteredStudents: Student[];
  filters: ClassFilterState;
  setStudentSearch: (search: string) => void;
  studentSearch: string;
  subjects: Subject[];
  updateFilters: (filters: Partial<ClassFilterState>) => void;
};

export const ClassFiltersContext = createContext<ClassFiltersContextValue | null>(null);

export function useClassFilters() {
  const context = useContext(ClassFiltersContext);

  if (!context) {
    throw new Error('ClassFilters compound components must be rendered inside <ClassFilters>.');
  }

  return context;
}

export function useClassFiltersRoot({ filters, onChange, students, subjects }: UseClassFiltersRootParams) {
  const [studentSearch, setStudentSearch] = useState('');
  const filteredStudents = useMemo(() => {
    const matches = filterStudentsBySearch(students, studentSearch);
    if (!filters.studentId || matches.some((student) => student.id === filters.studentId)) {
      return matches;
    }
    const selected = students.find((student) => student.id === filters.studentId);
    return selected ? [selected, ...matches] : matches;
  }, [filters.studentId, studentSearch, students]);

  const contextValue = useMemo<ClassFiltersContextValue>(
    () => ({
      filteredStudents,
      filters,
      setStudentSearch,
      studentSearch,
      subjects,
      updateFilters: (nextFilters) => onChange({ ...filters, ...nextFilters }),
    }),
    [filteredStudents, filters, onChange, studentSearch, subjects],
  );

  return { contextValue };
}
