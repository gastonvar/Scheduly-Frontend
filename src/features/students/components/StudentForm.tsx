import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import type { StudentInput } from '@/features/students/api/students-api';
import { StudentSearchBar } from '@/components/StudentSearchBar';
import { useStudentForm } from '@/features/students/hooks/useStudentForm';
import { CONTACT_TYPES, contactTypeLabel } from '@/utils/contacts';
import type { ContactType, Student } from '@/types';

type StudentFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: StudentInput | Partial<Student>) => Promise<void>;
  student?: Student | null;
  students: Student[];
};

export function StudentForm({ isOpen, onClose, onSave, student, students }: StudentFormProps) {
  const {
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
  } = useStudentForm({ isOpen, onClose, onSave, student, students });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{student ? 'Editar alumno' : 'Nuevo alumno'}</DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="student-name">Nombre</Label>
            <Input
              id="student-name"
              onChange={(event) => setName(event.target.value)}
              required
              value={form.name}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Contactos</Label>
              <Button onClick={addContact} type="button" variant="ghost" size="sm">
                <Plus className="size-3.5" data-icon="inline-start" />
                Agregar
              </Button>
            </div>
            <div className="space-y-2">
              {form.contacts.map((contact) => (
                <div className="flex gap-2" key={contact.id}>
                  <NativeSelect
                    className="w-auto shrink-0"
                    onChange={(event) => updateContact(contact.id, { type: event.target.value as ContactType })}
                    value={contact.type}
                  >
                    {CONTACT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {contactTypeLabel(type)}
                      </option>
                    ))}
                  </NativeSelect>
                  <Input
                    className="flex-1"
                    onChange={(event) => updateContact(contact.id, { value: event.target.value })}
                    placeholder="Dato de contacto"
                    value={contact.value}
                  />
                  <Button
                    aria-label="Quitar contacto"
                    disabled={form.contacts.length === 1}
                    onClick={() => removeContact(contact.id)}
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="referred-by">Referido por</Label>
            <StudentSearchBar
              id="referral-search"
              onChange={setReferralSearch}
              placeholder="Buscar alumno referidor..."
              value={referralSearch}
            />
            <NativeSelect
              id="referred-by"
              onChange={(event) => setReferredBy(event.target.value || null)}
              value={form.referredBy ?? ''}
            >
              <option value="">Sin referido</option>
              {referralOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </NativeSelect>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <DialogFooter>
            <Button onClick={onClose} type="button" variant="outline">
              Cancelar
            </Button>
            <Button disabled={saving} type="submit">
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
