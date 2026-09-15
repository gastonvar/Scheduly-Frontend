import type { ReactNode } from 'react';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { StudentSearchBar } from '@/components/StudentSearchBar';
import {
  ClassFiltersContext,
  useClassFilters,
  useClassFiltersRoot,
  type ClassFilterState,
  type PaymentStatusFilter,
} from '@/features/classes/hooks/useClassFilters';
import type { Subject, Student } from '@/types';

export type { ClassFilterState, PaymentStatusFilter } from '@/features/classes/hooks/useClassFilters';

type ClassFiltersProps = {
  filters: ClassFilterState;
  onChange: (filters: ClassFilterState) => void;
  students: Student[];
  subjects: Subject[];
};

type ClassFiltersRootProps = ClassFiltersProps & {
  children: ReactNode;
};

function ClassFiltersRoot({ children, filters, onChange, students, subjects }: ClassFiltersRootProps) {
  const { contextValue } = useClassFiltersRoot({ filters, onChange, students, subjects });

  return (
    <ClassFiltersContext.Provider value={contextValue}>
      <div className="grid gap-3 rounded-xl border border-border bg-card p-4 md:grid-cols-3">
        {children}
      </div>
    </ClassFiltersContext.Provider>
  );
}

function PaidField() {
  const { filters, updateFilters } = useClassFilters();

  return (
    <div className="space-y-1.5">
      <Label>Estado</Label>
      <NativeSelect
        onChange={(event) =>
          updateFilters({ paymentStatus: event.target.value as PaymentStatusFilter })
        }
        value={filters.paymentStatus}
      >
        <option value="all">Todas</option>
        <option value="paid">Pagadas</option>
        <option value="unpaid">Pendientes</option>
        <option value="free">Gratis</option>
      </NativeSelect>
    </div>
  );
}

function SubjectField() {
  const { filters, subjects, updateFilters } = useClassFilters();

  return (
    <div className="space-y-1.5">
      <Label>Materia</Label>
      <NativeSelect
        onChange={(event) => updateFilters({ subjectId: event.target.value })}
        value={filters.subjectId}
      >
        <option value="">Todas</option>
        {subjects.map((subject) => (
          <option key={subject.id} value={subject.id}>
            {subject.name}
          </option>
        ))}
      </NativeSelect>
    </div>
  );
}

function StudentField() {
  const { filteredStudents, filters, setStudentSearch, studentSearch, updateFilters } = useClassFilters();

  return (
    <div className="space-y-1.5">
      <Label htmlFor="class-filter-student">Alumno</Label>
      <StudentSearchBar
        id="class-filter-student-search"
        onChange={setStudentSearch}
        placeholder="Buscar alumno..."
        value={studentSearch}
      />
      <NativeSelect
        id="class-filter-student"
        onChange={(event) => updateFilters({ studentId: event.target.value })}
        value={filters.studentId}
      >
        <option value="">Todos</option>
        {filteredStudents.map((student) => (
          <option key={student.id} value={student.id}>
            {student.name}
          </option>
        ))}
      </NativeSelect>
    </div>
  );
}

export const ClassFilters = Object.assign(ClassFiltersRoot, {
  PaidField,
  StudentField,
  SubjectField,
});
