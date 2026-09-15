import { useEffect, useMemo, useRef, useState } from 'react';
import { useClasses } from '@/features/classes/hooks/use-classes';
import { DashboardView } from '@/features/dashboard/components/DashboardView';
import {
  computeDashboardMetrics,
  getDefaultDateRange,
  type DateRange,
} from '@/features/dashboard/utils/dashboardMetrics';
import { useStudents } from '@/features/students/hooks/use-students';
import { useSubjects } from '@/features/subjects/hooks/use-subjects';
import { queryErrorMessage } from '@/lib/query-result';
import { resolveStudentNames, resolveSubjectName } from '@/utils/entityLabels';

export function DashboardRoute() {
  const studentsQuery = useStudents();
  const subjectsQuery = useSubjects();
  const classesQuery = useClasses();
  const students = studentsQuery.data ?? [];
  const subjects = subjectsQuery.data ?? [];
  const classes = classesQuery.data ?? [];
  const [dateRange, setDateRange] = useState<DateRange>(() => getDefaultDateRange());
  const rangeInitialized = useRef(false);

  useEffect(() => {
    if (rangeInitialized.current || classesQuery.isLoading) {
      return;
    }

    setDateRange(getDefaultDateRange(classes));
    rangeInitialized.current = true;
  }, [classes, classesQuery.isLoading]);

  const metrics = useMemo(
    () => computeDashboardMetrics(classes, students, subjects, dateRange),
    [classes, dateRange, students, subjects],
  );

  return (
    <DashboardView
      dateRange={dateRange}
      error={
        queryErrorMessage(studentsQuery.error) ||
        queryErrorMessage(subjectsQuery.error) ||
        queryErrorMessage(classesQuery.error)
      }
      loading={studentsQuery.isLoading || subjectsQuery.isLoading || classesQuery.isLoading}
      metrics={metrics}
      onDateRangeChange={setDateRange}
      studentNames={(attendees) => resolveStudentNames(attendees, students)}
      subjectName={(subjectId) => resolveSubjectName(subjectId, subjects)}
    />
  );
}
