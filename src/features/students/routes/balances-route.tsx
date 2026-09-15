import { toast } from 'sonner';
import { StudentBalancesView } from '@/features/students/components/StudentBalancesView';
import { useClasses, useToggleClassPaid } from '@/features/classes/hooks/use-classes';
import { useStudents } from '@/features/students/hooks/use-students';
import { useSubjects } from '@/features/subjects/hooks/use-subjects';
import { getErrorMessage } from '@/lib/api-error';
import { queryErrorMessage } from '@/lib/query-result';
import type { Class } from '@/types';

export function BalancesRoute() {
  const studentsQuery = useStudents();
  const subjectsQuery = useSubjects();
  const classesQuery = useClasses();
  const togglePaid = useToggleClassPaid();
  const students = studentsQuery.data ?? [];
  const subjects = subjectsQuery.data ?? [];
  const classes = classesQuery.data ?? [];

  async function handleTogglePaid(classItem: Class) {
    try {
      await togglePaid.mutateAsync({ id: classItem.id, currentStatus: classItem.paymentStatus });
      toast.success('Estado de pago actualizado.');
    } catch (error) {
      toast.error('No se pudo actualizar el pago.', { description: getErrorMessage(error) });
    }
  }

  return (
    <StudentBalancesView
      classes={classes}
      error={
        queryErrorMessage(studentsQuery.error) ||
        queryErrorMessage(subjectsQuery.error) ||
        queryErrorMessage(classesQuery.error)
      }
      loading={studentsQuery.isLoading || subjectsQuery.isLoading || classesQuery.isLoading}
      onTogglePaid={(classItem) => void handleTogglePaid(classItem)}
      students={students}
      subjects={subjects}
    />
  );
}
