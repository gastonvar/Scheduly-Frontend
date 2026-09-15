import { useEffect, useMemo, useState, type FormEvent } from 'react';
import type { StudentInput } from '@/features/students/api/students-api';
import { createEmptyContact } from '@/utils/contacts';
import { filterStudentsBySearch } from '@/utils/studentSearch';
import type { Contact, Student } from '@/types';

type UseStudentFormParams = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: StudentInput | Partial<Student>) => Promise<void>;
  student?: Student | null;
  students: Student[];
};

const emptyForm: StudentInput = {
  name: '',
  contacts: [createEmptyContact()],
  referredBy: null,
  referrals: [],
  discountPercent: 0,
};

export function useStudentForm({ isOpen, onClose, onSave, student, students }: UseStudentFormParams) {
  const [form, setForm] = useState<StudentInput>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [referralSearch, setReferralSearch] = useState('');

  useEffect(() => {
    setForm(
      student
        ? { ...student, contacts: student.contacts.length > 0 ? student.contacts : [createEmptyContact()] }
        : emptyForm,
    );
    setError(null);
    setReferralSearch('');
  }, [student, isOpen]);

  const referralOptions = useMemo(() => {
    const candidates = students.filter((option) => option.id !== student?.id);
    const matches = filterStudentsBySearch(candidates, referralSearch);
    if (!form.referredBy || matches.some((option) => option.id === form.referredBy)) {
      return matches;
    }
    const selected = candidates.find((option) => option.id === form.referredBy);
    return selected ? [selected, ...matches] : matches;
  }, [form.referredBy, referralSearch, student?.id, students]);

  function setName(name: string) {
    setForm((current) => ({ ...current, name }));
  }

  function setReferredBy(referredBy: string | null) {
    setForm((current) => ({ ...current, referredBy }));
  }

  function updateContact(contactId: string, patch: Partial<Contact>) {
    setForm((current) => ({
      ...current,
      contacts: current.contacts.map((contact) => (contact.id === contactId ? { ...contact, ...patch } : contact)),
    }));
  }

  function addContact() {
    setForm((current) => ({
      ...current,
      contacts: [...current.contacts, createEmptyContact()],
    }));
  }

  function removeContact(contactId: string) {
    setForm((current) => ({
      ...current,
      contacts: current.contacts.length > 1 ? current.contacts.filter((contact) => contact.id !== contactId) : current.contacts,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const contacts = form.contacts.map((contact) => ({ ...contact, value: contact.value.trim() })).filter((contact) => contact.value);

    if (contacts.length === 0) {
      setError('Agregá al menos un contacto con datos.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSave({ ...form, contacts });
      onClose();
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : 'No se pudo guardar el alumno';
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  return {
    addContact,
    error,
    form,
    handleSubmit,
    referralOptions,
    referralSearch,
    removeContact,
    saving,
    setName,
    setReferralSearch,
    setReferredBy,
    updateContact,
  };
}
