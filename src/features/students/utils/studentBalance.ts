import type { Class, Student, Subject } from '@/types';
import { isClassPaid, isClassUnpaid } from '@/utils/classPayment';
import { resolveSubjectName } from '@/utils/entityLabels';

export type StudentPendingClass = {
  classItem: Class;
  shareAmount: number;
  subjectName: string;
};

export type StudentBalance = {
  student: Student;
  unpaidClasses: StudentPendingClass[];
  unpaidTotal: number;
  paidClassesCount: number;
  lastPaidDate: string | null;
};

export function computeStudentBalance(
  student: Student,
  classes: Class[],
  subjects: Subject[],
): StudentBalance {
  const studentClasses = classes.filter((classItem) => classItem.attendees.includes(student.id));
  const unpaid = studentClasses
    .filter(isClassUnpaid)
    .sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime());

  const unpaidClasses: StudentPendingClass[] = unpaid.map((classItem) => ({
    classItem,
    shareAmount: Math.round(classItem.finalPrice / Math.max(1, classItem.attendees.length)),
    subjectName: resolveSubjectName(classItem.subjectId, subjects),
  }));

  const unpaidTotal = unpaidClasses.reduce((total, item) => total + item.shareAmount, 0);
  const paidClasses = studentClasses.filter(isClassPaid);
  const lastPaidDate =
    paidClasses.length === 0
      ? null
      : paidClasses.reduce((latest, classItem) =>
          new Date(classItem.date) > new Date(latest.date) ? classItem : latest,
        ).date;

  return {
    student,
    unpaidClasses,
    unpaidTotal,
    paidClassesCount: paidClasses.length,
    lastPaidDate,
  };
}

export function computeAllStudentBalances(
  students: Student[],
  classes: Class[],
  subjects: Subject[],
): StudentBalance[] {
  return students
    .map((student) => computeStudentBalance(student, classes, subjects))
    .filter((balance) => balance.unpaidClasses.length > 0 || balance.paidClassesCount > 0)
    .sort((left, right) => right.unpaidTotal - left.unpaidTotal);
}
