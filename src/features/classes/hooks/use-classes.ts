import { useMutation, useQuery } from '@tanstack/react-query';
import {
  createClass,
  deleteClass,
  getClasses,
  togglePaid,
  updateClass,
  updateClassPaymentStatus,
  type ClassInput,
} from '@/features/classes/api/classes-api';
import { queryClient } from '@/lib/query-client';
import { queryKeys } from '@/lib/query-keys';
import type { Class, ClassPaymentStatus } from '@/types';

export function useClasses() {
  return useQuery({
    queryKey: queryKeys.classes.list,
    queryFn: getClasses,
  });
}

function invalidateClassQueries() {
  void queryClient.invalidateQueries({ queryKey: queryKeys.classes.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
}

export function useCreateClass() {
  return useMutation({
    mutationFn: (input: ClassInput) => createClass(input),
    onSuccess: () => {
      invalidateClassQueries();
    },
  });
}

export function useUpdateClass() {
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<Class> }) => updateClass(id, input),
    onSuccess: () => {
      invalidateClassQueries();
    },
  });
}

export function useDeleteClass() {
  return useMutation({
    mutationFn: (id: string) => deleteClass(id),
    onSuccess: () => {
      invalidateClassQueries();
    },
  });
}

export function useUpdateClassPaymentStatus() {
  return useMutation({
    mutationFn: ({ id, paymentStatus }: { id: string; paymentStatus: ClassPaymentStatus }) =>
      updateClassPaymentStatus(id, paymentStatus),
    onSuccess: () => {
      invalidateClassQueries();
    },
  });
}

export function useToggleClassPaid() {
  return useMutation({
    mutationFn: ({ id, currentStatus }: { id: string; currentStatus: ClassPaymentStatus }) =>
      togglePaid(id, currentStatus),
    onSuccess: () => {
      invalidateClassQueries();
    },
  });
}
