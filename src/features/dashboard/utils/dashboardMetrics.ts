import { endOfMonth, format, startOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Class, Student, Subject } from '@/types';
import { isClassBillable, isClassFree, isClassPaid, isClassUnpaid } from '@/utils/classPayment';
import { fromLocalDateInput, toLocalDateInput } from '@/utils/dateLocal';
import { resolveStudentName, resolveSubjectName } from '@/utils/entityLabels';

export type DateRange = {
  from: string;
  to: string;
};

export { fromLocalDateInput, toLocalDateInput };

export function getDefaultDateRange(classes: Class[] = [], reference = new Date()): DateRange {
  const to = endOfMonth(reference);
  const from =
    classes.length === 0
      ? startOfMonth(reference)
      : new Date(
          classes.reduce((oldest, classItem) => {
            const classDate = new Date(classItem.date);
            return classDate < oldest ? classDate : oldest;
          }, new Date(classes[0].date)),
        );

  return {
    from: toLocalDateInput(from),
    to: toLocalDateInput(to),
  };
}

export function isDateInRange(isoDate: string, range: DateRange): boolean {
  const value = new Date(isoDate);
  const from = fromLocalDateInput(range.from);
  const to = fromLocalDateInput(range.to, true);
  return value >= from && value <= to;
}

export function filterClassesInRange(classes: Class[], range: DateRange): Class[] {
  return classes.filter((classItem) => isDateInRange(classItem.date, range));
}

export type DashboardMetrics = {
  totalClasses: number;
  totalHours: number;
  paidRevenue: number;
  pendingRevenue: number;
  freeClasses: number;
  freeHours: number;
  paidClasses: number;
  unpaidClasses: number;
  collectionRate: number;
  averageHourlyRate: number;
  activeStudents: number;
  uniqueAttendees: number;
  averageClassDuration: number;
  averageClassPrice: number;
  revenueByWeek: Array<{ week: string; revenue: number; hours: number }>;
  hoursBySubject: Array<{ subjectId: string; name: string; hours: number; classes: number }>;
  statusBreakdown: Array<{ status: string; label: string; count: number; fill: string }>;
  topStudents: Array<{ studentId: string; name: string; hours: number; classes: number; revenue: number }>;
  upcomingClasses: Class[];
  topDiscounts: Student[];
};

function isBillable(classItem: Class): boolean {
  return isClassBillable(classItem);
}

export function computeDashboardMetrics(
  classes: Class[],
  students: Student[],
  subjects: Subject[],
  range: DateRange,
): DashboardMetrics {
  const rangeClasses = filterClassesInRange(classes, range);
  const billableClasses = rangeClasses.filter(isBillable);
  const paidBillable = billableClasses.filter(isClassPaid);
  const unpaidBillable = billableClasses.filter(isClassUnpaid);
  const freeClassesList = rangeClasses.filter(isClassFree);

  const totalHours = rangeClasses.reduce((total, classItem) => total + classItem.durationHours, 0);
  const paidRevenue = paidBillable.reduce((total, classItem) => total + classItem.finalPrice, 0);
  const pendingRevenue = unpaidBillable.reduce((total, classItem) => total + classItem.finalPrice, 0);
  const freeHours = freeClassesList.reduce((total, classItem) => total + classItem.durationHours, 0);

  const paidHours = paidBillable.reduce((total, classItem) => total + classItem.durationHours, 0);
  const collectionRate =
    billableClasses.length === 0 ? 0 : Math.round((paidBillable.length / billableClasses.length) * 100);
  const averageHourlyRate = paidHours > 0 ? Math.round(paidRevenue / paidHours) : 0;
  const averageClassDuration =
    rangeClasses.length === 0 ? 0 : Math.round((totalHours / rangeClasses.length) * 10) / 10;
  const averageClassPrice =
    billableClasses.length === 0
      ? 0
      : Math.round(
          billableClasses.reduce((total, classItem) => total + classItem.finalPrice, 0) / billableClasses.length,
        );

  const attendeeIds = new Set(rangeClasses.flatMap((classItem) => classItem.attendees));
  const activeStudents = students.filter((student) => attendeeIds.has(student.id)).length;

  const weekMap = new Map<string, { revenue: number; hours: number }>();
  for (const classItem of rangeClasses) {
    const weekKey = format(new Date(classItem.date), "yyyy-'S'ww", { locale: es });
    const entry = weekMap.get(weekKey) ?? { revenue: 0, hours: 0 };
    entry.hours += classItem.durationHours;
    if (isClassPaid(classItem)) {
      entry.revenue += classItem.finalPrice;
    }
    weekMap.set(weekKey, entry);
  }

  const revenueByWeek = [...weekMap.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([week, data]) => ({
      week: week.replace('-S', ' S'),
      revenue: data.revenue,
      hours: data.hours,
    }));

  const subjectMap = new Map<string, { hours: number; classes: number }>();
  for (const classItem of rangeClasses) {
    const entry = subjectMap.get(classItem.subjectId) ?? { hours: 0, classes: 0 };
    entry.hours += classItem.durationHours;
    entry.classes += 1;
    subjectMap.set(classItem.subjectId, entry);
  }

  const hoursBySubject = [...subjectMap.entries()]
    .map(([subjectId, data]) => ({
      subjectId,
      name: resolveSubjectName(subjectId, subjects),
      hours: data.hours,
      classes: data.classes,
    }))
    .sort((left, right) => right.hours - left.hours);

  const statusBreakdown = [
    { status: 'paid', label: 'Pagadas', count: paidBillable.length, fill: 'var(--class-status-paid)' },
    { status: 'unpaid', label: 'Pendientes', count: unpaidBillable.length, fill: 'var(--class-status-unpaid)' },
    { status: 'free', label: 'Gratis', count: freeClassesList.length, fill: 'var(--class-status-free)' },
  ].filter((item) => item.count > 0);

  const studentMap = new Map<string, { hours: number; classes: number; revenue: number }>();
  for (const classItem of rangeClasses) {
    for (const studentId of classItem.attendees) {
      const entry = studentMap.get(studentId) ?? { hours: 0, classes: 0, revenue: 0 };
      entry.hours += classItem.durationHours;
      entry.classes += 1;
      if (isClassPaid(classItem)) {
        entry.revenue += classItem.finalPrice / classItem.attendees.length;
      }
      studentMap.set(studentId, entry);
    }
  }

  const topStudents = [...studentMap.entries()]
    .map(([studentId, data]) => ({
      studentId,
      name: resolveStudentName(studentId, students),
      hours: data.hours,
      classes: data.classes,
      revenue: Math.round(data.revenue),
    }))
    .sort((left, right) => right.hours - left.hours)
    .slice(0, 5);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  const upcomingClasses = [...classes]
    .filter((classItem) => {
      const value = new Date(classItem.date);
      return value >= today && value <= nextWeek;
    })
    .sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime());

  const topDiscounts = [...students]
    .filter((student) => student.discountPercent > 0)
    .sort((left, right) => right.discountPercent - left.discountPercent)
    .slice(0, 3);

  return {
    totalClasses: rangeClasses.length,
    totalHours,
    paidRevenue,
    pendingRevenue,
    freeClasses: freeClassesList.length,
    freeHours,
    paidClasses: paidBillable.length,
    unpaidClasses: unpaidBillable.length,
    collectionRate,
    averageHourlyRate,
    activeStudents,
    uniqueAttendees: attendeeIds.size,
    averageClassDuration,
    averageClassPrice,
    revenueByWeek,
    hoursBySubject,
    statusBreakdown,
    topStudents,
    upcomingClasses,
    topDiscounts,
  };
}
