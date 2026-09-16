import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { EntityDeleteDialog } from '@/components/common/entity-delete-dialog';
import { useClasses } from '@/features/classes/hooks/use-classes';
import { SubjectForm } from '@/features/subjects/components/SubjectForm';
import { SubjectList } from '@/features/subjects/components/SubjectList';
import type { SubjectInput } from '@/features/subjects/api/subjects-api';
import {
  useCreateSubject,
  useDeleteSubject,
  useSubjects,
  useUpdateSubject,
} from '@/features/subjects/hooks/use-subjects';
import { getErrorMessage } from '@/lib/api-error';
import { queryErrorMessage } from '@/lib/query-result';
import type { Subject } from '@/types';
import { resolveSubjectName } from '@/utils/entityLabels';

export function SubjectsRoute() {
  const subjectsQuery = useSubjects();
  const classesQuery = useClasses();
  const createSubject = useCreateSubject();
  const updateSubject = useUpdateSubject();
  const deleteSubject = useDeleteSubject();
  const subjects = subjectsQuery.data ?? [];
  const classes = classesQuery.data ?? [];
  const [searchParams, setSearchParams] = useSearchParams();
  const [formOpen, setFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);

  useEffect(() => {
    if (searchParams.get('new') !== '1') {
      return;
    }

    setEditingSubject(null);
    setFormOpen(true);
  }, [searchParams]);

  function openForm(subject: Subject | null = null) {
    setEditingSubject(subject);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingSubject(null);
    if (searchParams.get('new') === '1') {
      const next = new URLSearchParams(searchParams);
      next.delete('new');
      setSearchParams(next, { replace: true });
    }
  }

  async function saveSubject(input: SubjectInput | Partial<Subject>) {
    try {
      if (editingSubject) {
        await updateSubject.mutateAsync({ id: editingSubject.id, input });
        toast.success('Materia actualizada.');
      } else {
        await createSubject.mutateAsync(input as SubjectInput);
        toast.success('Materia creada.');
      }
    } catch (error) {
      toast.error('No se pudo guardar la materia.', { description: getErrorMessage(error) });
      throw error;
    }
  }

  async function confirmDelete() {
    if (!deletingSubject) {
      return;
    }

    try {
      await deleteSubject.mutateAsync(deletingSubject.id);
      toast.success(`Se eliminó la materia ${deletingSubject.name}.`);
      setDeletingSubject(null);
    } catch (error) {
      toast.error(`No se pudo eliminar la materia ${deletingSubject.name}.`, {
        description: getErrorMessage(error),
      });
    }
  }

  const affectedClasses = deletingSubject
    ? classes.filter((classItem) => classItem.subjectId === deletingSubject.id)
    : [];

  return (
    <>
      <SubjectList
        error={queryErrorMessage(subjectsQuery.error)}
        loading={subjectsQuery.isLoading}
        onCreate={() => openForm()}
        onDelete={setDeletingSubject}
        onEdit={openForm}
        subjects={subjects}
      />

      <SubjectForm
        isOpen={formOpen}
        onClose={closeForm}
        onSave={saveSubject}
        subject={editingSubject}
      />

      <EntityDeleteDialog
        affectedClasses={affectedClasses}
        affectedHeading="También se eliminarán estas clases asociadas:"
        description={
          deletingSubject
            ? `Vas a eliminar la materia ${deletingSubject.name}. Esta acción no se puede deshacer.`
            : 'Esta acción no se puede deshacer.'
        }
        onConfirm={() => void confirmDelete()}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingSubject(null);
          }
        }}
        open={deletingSubject !== null}
        subjectName={(subjectId) => resolveSubjectName(subjectId, subjects)}
      />
    </>
  );
}
