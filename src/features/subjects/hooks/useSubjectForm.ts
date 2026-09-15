import { useEffect, useState, type FormEvent } from 'react';
import { PRICE_BASE } from '@/config/constants';
import type { SubjectInput } from '@/features/subjects/api/subjects-api';
import type { Subject } from '@/types';
import { snapToValidPrice } from '@/utils/pricing';

type UseSubjectFormParams = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: SubjectInput | Partial<Subject>) => Promise<void>;
  subject?: Subject | null;
};

export function useSubjectForm({ isOpen, onClose, onSave, subject }: UseSubjectFormParams) {
  const [name, setName] = useState('');
  const [pricePerHour, setPricePerHour] = useState(PRICE_BASE);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const snappedPrice = snapToValidPrice(pricePerHour);

  useEffect(() => {
    setName(subject?.name ?? '');
    setPricePerHour(subject?.pricePerHour ?? PRICE_BASE);
    setError(null);
  }, [subject, isOpen]);

  function snapPrice() {
    setPricePerHour(snappedPrice);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await onSave({ name, pricePerHour: snappedPrice });
      onClose();
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : 'No se pudo guardar la materia';
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  return {
    error,
    handleSubmit,
    name,
    pricePerHour,
    saving,
    setName,
    setPricePerHour,
    snapPrice,
    snappedPrice,
  };
}
