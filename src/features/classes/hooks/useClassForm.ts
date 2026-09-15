import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import type { ClassInput } from '@/features/classes/api/classes-api';
import { computeClassPriceFromSubject, computeClassTotals } from '@/features/classes/utils/classPrice';
import { findOverlappingClass, formatOverlapError } from '@/features/classes/utils/overlap';
import { snapDurationHours } from '@/features/classes/utils/slotDuration';
import type { Class, ClassPaymentStatus, Student, Subject } from '@/types';
import { fromLocalInputValue, toLocalInputValue } from '@/utils/dateLocal';
import { applyDiscount } from '@/utils/discounts';
import { filterStudentsBySearch } from '@/utils/studentSearch';

type UseClassFormParams = {
  classItem?: Class | null;
  classes: Class[];
  defaultDate?: string | null;
  defaultDurationHours?: number | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: ClassInput | Partial<Class>) => Promise<void>;
  students: Student[];
  subjects: Subject[];
};

export function useClassForm({
  classItem,
  classes,
  defaultDate,
  defaultDurationHours,
  isOpen,
  onClose,
  onSave,
  students,
  subjects,
}: UseClassFormParams) {
  const initialDate = defaultDate ?? new Date().toISOString();
  const [date, setDate] = useState(toLocalInputValue(initialDate));
  const [durationHours, setDurationHours] = useState(1);
  const [subjectId, setSubjectId] = useState('');
  const [attendees, setAttendees] = useState<string[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<ClassPaymentStatus>('unpaid');
  const [surchargePercent, setSurchargePercent] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [studentSearch, setStudentSearch] = useState('');
  const wasOpen = useRef(false);

  useEffect(() => {
    const justOpened = isOpen && !wasOpen.current;
    wasOpen.current = isOpen;

    if (!justOpened) {
      return;
    }

    setDate(toLocalInputValue(classItem?.date ?? defaultDate ?? new Date().toISOString()));
    setDurationHours(classItem?.durationHours ?? defaultDurationHours ?? 1);
    setSubjectId(classItem?.subjectId ?? subjects[0]?.id ?? '');
    setAttendees(classItem?.attendees ?? []);
    setPaymentStatus(classItem?.paymentStatus ?? 'unpaid');
    setSurchargePercent(classItem?.surchargePercent ?? 0);
    setError(null);
    setStudentSearch('');
  }, [classItem, defaultDate, defaultDurationHours, isOpen, subjects]);

  const subject = useMemo(() => subjects.find((item) => item.id === subjectId), [subjectId, subjects]);
  const price = useMemo(
    () => computeClassPriceFromSubject(subject, durationHours, surchargePercent),
    [durationHours, subject, surchargePercent],
  );
  const selectedStudents = useMemo(
    () => students.filter((student) => attendees.includes(student.id)),
    [attendees, students],
  );
  const filteredStudents = useMemo(
    () => filterStudentsBySearch(students, studentSearch),
    [studentSearch, students],
  );

  const isFree = paymentStatus === 'free';

  const displayPrice = useMemo(() => {
    if (isFree) {
      return { basePrice: 0, finalPrice: 0, surchargePercent: 0 };
    }
    return computeClassTotals(price, selectedStudents);
  }, [isFree, price, selectedStudents]);

  function toggleAttendee(studentId: string) {
    setAttendees((current) =>
      current.includes(studentId) ? current.filter((id) => id !== studentId) : [...current, studentId],
    );
  }

  function effectivePriceForStudent(student: Student) {
    return applyDiscount(price.finalPrice, student.discountPercent);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!subjectId) {
      setError('Seleccioná una materia antes de guardar.');
      return;
    }

    if (attendees.length === 0) {
      setError('Seleccioná al menos un asistente.');
      return;
    }

    const normalizedDate = fromLocalInputValue(date);
    const normalizedDuration = snapDurationHours(durationHours);
    const overlapping = findOverlappingClass(classes, normalizedDate, normalizedDuration, classItem?.id);

    if (overlapping) {
      setError(formatOverlapError(overlapping));
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSave({
        date: normalizedDate,
        durationHours: normalizedDuration,
        subjectId,
        attendees,
        paymentStatus,
        ...displayPrice,
        surchargePercent: isFree ? 0 : displayPrice.surchargePercent,
      });
      onClose();
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : 'No se pudo guardar la clase';
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  return {
    attendees,
    date,
    durationHours,
    displayPrice,
    effectivePriceForStudent,
    error,
    filteredStudents,
    handleSubmit,
    isFree,
    paymentStatus,
    price,
    saving,
    selectedStudents,
    setDate,
    setDurationHours,
    setPaymentStatus,
    setStudentSearch,
    setSurchargePercent,
    setSubjectId,
    studentSearch,
    subjectId,
    surchargePercent,
    toggleAttendee,
  };
}
