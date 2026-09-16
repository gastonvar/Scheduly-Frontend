import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { EntityDeleteDialog } from '@/components/common/entity-delete-dialog';
import { useClasses } from '@/features/classes/hooks/use-classes';
import { StudentForm } from '@/features/students/components/StudentForm';
import { StudentList } from '@/features/students/components/StudentList';
import {
  useCreateStudent,
  useDeleteStudent,
  useStudents,
  useUpdateStudent,
} from '@/features/students/hooks/use-students';
import type { StudentInput } from '@/features/students/api/students-api';
import { useSubjects } from '@/features/subjects/hooks/use-subjects';
import { getErrorMessage } from '@/lib/api-error';
import { queryErrorMessage } from '@/lib/query-result';
import type { Student } from '@/types';
import { resolveSubjectName } from '@/utils/entityLabels';

export function StudentsRoute() {
  const studentsQuery = useStudents();
  const subjectsQuery = useSubjects();
  const classesQuery = useClasses();
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();
  const deleteStudent = useDeleteStudent();
  const students = studentsQuery.data ?? [];
  const subjects = subjectsQuery.data ?? [];
  const classes = classesQuery.data ?? [];
  const [searchParams, setSearchParams] = useSearchParams();
  const [formOpen, setFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  useEffect(() => {
    if (searchParams.get('new') !== '1') {
      return;
    }

    setEditingStudent(null);
    setFormOpen(true);
  }, [searchParams]);

  function openForm(student: Student | null = null) {
    setEditingStudent(student);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingStudent(null);
    if (searchParams.get('new') === '1') {
      const next = new URLSearchParams(searchParams);
      next.delete('new');
      setSearchParams(next, { replace: true });
    }
  }

  async function saveStudent(input: StudentInput | Partial<Student>) {
    try {
      if (editingStudent) {
        await updateStudent.mutateAsync({ id: editingStudent.id, input });
        toast.success('Alumno actualizado.');
      } else {
        await createStudent.mutateAsync(input as StudentInput);
        toast.success('Alumno creado.');
      }
    } catch (error) {
      toast.error('No se pudo guardar el alumno.', { description: getErrorMessage(error) });
      throw error;
    }
  }

  async function confirmDelete() {
    if (!deletingStudent) {
      return;
    }

    try {
      await deleteStudent.mutateAsync(deletingStudent.id);
      toast.success(`Se eliminó al alumno ${deletingStudent.name}.`);
      setDeletingStudent(null);
    } catch (error) {
      toast.error(`No se pudo eliminar al alumno ${deletingStudent.name}.`, {
        description: getErrorMessage(error),
      });
    }
  }

  const affectedClasses = deletingStudent
    ? classes.filter((classItem) => classItem.attendees.includes(deletingStudent.id))
    : [];

  return (
    <>
      <StudentList
        classes={classes}
        error={queryErrorMessage(studentsQuery.error)}
        loading={studentsQuery.isLoading}
        onCreate={() => openForm()}
        onDelete={setDeletingStudent}
        onEdit={openForm}
        students={students}
        subjects={subjects}
      />

      <StudentForm
        isOpen={formOpen}
        onClose={closeForm}
        onSave={saveStudent}
        student={editingStudent}
        students={students}
      />

      <EntityDeleteDialog
        affectedClasses={affectedClasses}
        affectedHeading="Se quitará al alumno de estas clases (si quedan vacías, se eliminan):"
        description={
          deletingStudent
            ? `Vas a eliminar al alumno ${deletingStudent.name}. Esta acción no se puede deshacer.`
            : 'Esta acción no se puede deshacer.'
        }
        onConfirm={() => void confirmDelete()}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingStudent(null);
          }
        }}
        open={deletingStudent !== null}
        subjectName={(subjectId) => resolveSubjectName(subjectId, subjects)}
      />
    </>
  );
}
