import { useMutation, useQuery } from '@tanstack/react-query';
import {
  createStudent,
  deleteStudent,
  getStudents,
  updateStudent,
  type StudentInput,
} from '@/features/students/api/students-api';
import { queryClient } from '@/lib/query-client';
import { queryKeys } from '@/lib/query-keys';
import type { Student } from '@/types';

export function useStudents() {
  return useQuery({
    queryKey: queryKeys.students.list,
    queryFn: getStudents,
  });
}

function invalidateStudentQueries() {
  void queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.classes.all });
}

export function useCreateStudent() {
  return useMutation({
    mutationFn: (input: StudentInput) => createStudent(input),
    onSuccess: () => {
      invalidateStudentQueries();
    },
  });
}

export function useUpdateStudent() {
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<Student> }) => updateStudent(id, input),
    onSuccess: () => {
      invalidateStudentQueries();
    },
  });
}

export function useDeleteStudent() {
  return useMutation({
    mutationFn: (id: string) => deleteStudent(id),
    onSuccess: () => {
      invalidateStudentQueries();
    },
  });
}
