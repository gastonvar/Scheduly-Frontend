import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { EntityDeleteDialog } from '@/components/common/entity-delete-dialog';
import type { ClassInput } from '@/features/classes/api/classes-api';
import { ClassForm } from '@/features/classes/components/ClassForm';
import { ClassList } from '@/features/classes/components/ClassList';
import {
  useCreateClass,
  useDeleteClass,
  useClasses,
  useToggleClassPaid,
  useUpdateClass,
  useUpdateClassPaymentStatus,
} from '@/features/classes/hooks/use-classes';
import { useStudents } from '@/features/students/hooks/use-students';
import { useSubjects } from '@/features/subjects/hooks/use-subjects';
import { getErrorMessage } from '@/lib/api-error';
import { queryErrorMessage } from '@/lib/query-result';
import type { Class } from '@/types';
import { isClassFree } from '@/utils/classPayment';
import { resolveSubjectName } from '@/utils/entityLabels';

export function ClassesRoute() {
  const classesQuery = useClasses();
  const studentsQuery = useStudents();
  const subjectsQuery = useSubjects();
  const createClass = useCreateClass();
  const updateClass = useUpdateClass();
  const deleteClass = useDeleteClass();
  const togglePaid = useToggleClassPaid();
  const updatePaymentStatus = useUpdateClassPaymentStatus();
  const classes = classesQuery.data ?? [];
  const students = studentsQuery.data ?? [];
  const subjects = subjectsQuery.data ?? [];
  const [searchParams, setSearchParams] = useSearchParams();
  const [formOpen, setFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [deletingClass, setDeletingClass] = useState<Class | null>(null);

  useEffect(() => {
    if (searchParams.get('new') !== '1') {
      return;
    }

    setEditingClass(null);
    setFormOpen(true);
  }, [searchParams]);

  function openForm(classItem: Class | null = null) {
    setEditingClass(classItem);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingClass(null);
    if (searchParams.get('new') === '1') {
      const next = new URLSearchParams(searchParams);
      next.delete('new');
      setSearchParams(next, { replace: true });
    }
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

  async function handleTogglePaid(classItem: Class) {
    try {
      await togglePaid.mutateAsync({ id: classItem.id, currentStatus: classItem.paymentStatus });
      toast.success('Estado de pago actualizado.');
    } catch (error) {
      toast.error('No se pudo actualizar el pago.', { description: getErrorMessage(error) });
    }
  }

  async function handleToggleFree(classItem: Class) {
    const nextStatus = isClassFree(classItem) ? 'unpaid' : 'free';
    try {
      await updatePaymentStatus.mutateAsync({ id: classItem.id, paymentStatus: nextStatus });
      toast.success(
        nextStatus === 'free' ? 'Clase marcada como gratis.' : 'Clase marcada como pendiente de pago.',
      );
    } catch (error) {
      toast.error('No se pudo actualizar el estado de pago.', { description: getErrorMessage(error) });
    }
  }

  return (
    <>
      <ClassList
        classes={classes}
        error={queryErrorMessage(classesQuery.error)}
        loading={classesQuery.isLoading}
        onCreate={() => openForm()}
        onDelete={setDeletingClass}
        onEdit={openForm}
        onToggleFree={(classItem) => void handleToggleFree(classItem)}
        onTogglePaid={(classItem) => void handleTogglePaid(classItem)}
        students={students}
        subjects={subjects}
      />

      <ClassForm
        classItem={editingClass}
        classes={classes}
        isOpen={formOpen}
        onClose={closeForm}
        onDelete={(classItem) => {
          closeForm();
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
        subjectName={(subjectId) => resolveSubjectName(subjectId, subjects)}
      />
    </>
  );
}
