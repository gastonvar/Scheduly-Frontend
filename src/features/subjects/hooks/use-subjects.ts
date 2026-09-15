import { useMutation, useQuery } from '@tanstack/react-query';
import {
  createSubject,
  deleteSubject,
  getSubjects,
  updateSubject,
  type SubjectInput,
} from '@/features/subjects/api/subjects-api';
import { queryClient } from '@/lib/query-client';
import { queryKeys } from '@/lib/query-keys';
import type { Subject } from '@/types';

export function useSubjects() {
  return useQuery({
    queryKey: queryKeys.subjects.list,
    queryFn: getSubjects,
  });
}

function invalidateSubjectQueries() {
  void queryClient.invalidateQueries({ queryKey: queryKeys.subjects.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.classes.all });
}

export function useCreateSubject() {
  return useMutation({
    mutationFn: (input: SubjectInput) => createSubject(input),
    onSuccess: () => {
      invalidateSubjectQueries();
    },
  });
}

export function useUpdateSubject() {
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<Subject> }) => updateSubject(id, input),
    onSuccess: () => {
      invalidateSubjectQueries();
    },
  });
}

export function useDeleteSubject() {
  return useMutation({
    mutationFn: (id: string) => deleteSubject(id),
    onSuccess: () => {
      invalidateSubjectQueries();
    },
  });
}
