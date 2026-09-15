import { useState } from 'react';
import { toast } from 'sonner';
import { EntityDeleteDialog } from '@/components/common/entity-delete-dialog';
import type { ClassInput } from '@/features/classes/api/classes-api';
import { CalendarView } from '@/features/classes/components/CalendarView';
import { ClassForm } from '@/features/classes/components/ClassForm';
import type { ClassRescheduleInput } from '@/features/classes/hooks/useCalendarView';
import {
  useCreateClass,
  useDeleteClass,
  useClasses,
  useUpdateClass,
  useUpdateClassPaymentStatus,
} from '@/features/classes/hooks/use-classes';
import { useStudents } from '@/features/students/hooks/use-students';
import { useSubjects } from '@/features/subjects/hooks/use-subjects';
import { getErrorMessage } from '@/lib/api-error';
import { queryErrorMessage } from '@/lib/query-result';
import type { Class, ClassPaymentStatus } from '@/types';

export function CalendarRoute() {
  const classesQuery = useClasses();
  const studentsQuery = useStudents();
  const subjectsQuery = useSubjects();
  const createClass = useCreateClass();
  const updateClass = useUpdateClass();
  const deleteClass = useDeleteClass();
  const updatePaymentStatus = useUpdateClassPaymentStatus();
  const classes = classesQuery.data ?? [];
  const students = studentsQuery.data ?? [];
  const subjects = subjectsQuery.data ?? [];
  const [formOpen, setFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [defaultDate, setDefaultDate] = useState<string | null>(null);
  const [defaultDuration, setDefaultDuration] = useState<number | null>(null);
  const [deletingClass, setDeletingClass] = useState<Class | null>(null);

  function openForm(classItem: Class | null = null, date: string | null = null, durationHours: number | null = null) {
    setEditingClass(classItem);
    setDefaultDate(date);
    setDefaultDuration(durationHours);
    setFormOpen(true);
  }

  async function saveClass(input: ClassInput | Partial<Class>) {
    try {
      if (editingClass) {
        await updateClass.mutateAsync({ id: editingClass.id, input });
        toast.success('Clase actualizada.');
      } else {
        await createClass.mutateAsync(input as ClassInput);
        toast.success('Clase creada.');
      }
    } catch (error) {
      toast.error('No se pudo guardar la clase.', { description: getErrorMessage(error) });
      throw error;
    }
  }

  async function confirmDelete() {
    if (!deletingClass) {
      return;
    }

    try {
      await deleteClass.mutateAsync(deletingClass.id);
      toast.success('Se eliminó esta clase.');
      setDeletingClass(null);
    } catch (error) {
      toast.error('No se pudo eliminar esta clase.', { description: getErrorMessage(error) });
    }
  }

  async function handlePaymentStatus(classItem: Class, status: ClassPaymentStatus) {
    if (classItem.paymentStatus === status) {
      return;
    }

    try {
      await updatePaymentStatus.mutateAsync({ id: classItem.id, paymentStatus: status });
      toast.success(
        status === 'free'
          ? 'Clase marcada como gratis.'
          : status === 'paid'
            ? 'Clase marcada como paga.'
            : 'Clase marcada como pendiente de pago.',
      );
    } catch (error) {
      toast.error('No se pudo actualizar el estado de pago.', { description: getErrorMessage(error) });
      throw error;
    }
  }

  async function handleReschedule(input: ClassRescheduleInput) {
    try {
      await updateClass.mutateAsync({
        id: input.id,
        input: { date: input.date, durationHours: input.durationHours },
      });
      toast.success('Clase reprogramada.');
    } catch (error) {
      toast.error('No se pudo reprogramar la clase.', { description: getErrorMessage(error) });
      throw error;
    }
  }

  return (
    <>
      <CalendarView
        classes={classes}
        error={queryErrorMessage(classesQuery.error)}
        loading={classesQuery.isLoading}
        onCreateForSlot={({ date, durationHours }) => openForm(null, date, durationHours)}
        onEditClass={(classItem) => openForm(classItem)}
        onPaymentStatusChange={handlePaymentStatus}
        onRescheduleClass={handleReschedule}
        students={students}
        subjects={subjects}
      />

      <ClassForm
        classItem={editingClass}
        classes={classes}
        defaultDate={defaultDate}
        defaultDurationHours={defaultDuration}
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onDelete={(classItem) => {
          setFormOpen(false);
          setDeletingClass(classItem);
        }}
        onSave={saveClass}
        students={students}
        subjects={subjects}
      />

      <EntityDeleteDialog
        description="Vas a eliminar esta clase. Esta acción no se puede deshacer."
        onConfirm={() => void confirmDelete()}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingClass(null);
          }
        }}
        open={deletingClass !== null}
      />
    </>
  );
}
