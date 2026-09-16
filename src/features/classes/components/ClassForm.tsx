import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import type { ClassInput } from '@/features/classes/api/classes-api';
import { useClassForm } from '@/features/classes/hooks/useClassForm';
import { StudentSearchBar } from '@/components/StudentSearchBar';
import type { Class, ClassPaymentStatus, Student, Subject } from '@/types';
import {
  CALENDAR_TIME_INPUT_STEP_SECONDS,
  CLASS_DURATION_STEP_HOURS,
  MIN_CLASS_DURATION_HOURS,
} from '@/config/constants';
import { CLASS_PAYMENT_STATUS_OPTIONS } from '@/utils/classStatus';
import { formatContacts } from '@/utils/contacts';
import { formatCurrency } from '@/utils/format';

type ClassFormProps = {
  classItem?: Class | null;
  classes: Class[];
  defaultDate?: string | null;
  defaultDurationHours?: number | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (classItem: Class) => void;
  onSave: (input: ClassInput | Partial<Class>) => Promise<void>;
  students: Student[];
  subjects: Subject[];
};

export function ClassForm({
  classItem,
  classes,
  defaultDate,
  defaultDurationHours,
  isOpen,
  onClose,
  onDelete,
  onSave,
  students,
  subjects,
}: ClassFormProps) {
  const {
    attendees,
    date,
    displayPrice,
    durationHours,
    effectivePriceForStudent,
    error,
    filteredStudents,
    handleSubmit,
    isFree,
    paymentStatus,
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
    toggleAttendee,
    surchargePercent,
  } = useClassForm({
    classItem,
    classes,
    defaultDate,
    defaultDurationHours,
    isOpen,
    onClose,
    onSave,
    students,
    subjects,
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{classItem ? 'Editar clase' : 'Nueva clase'}</DialogTitle>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="class-date">Fecha y hora</Label>
              <Input
                id="class-date"
                onChange={(event) => setDate(event.target.value)}
                required
                step={CALENDAR_TIME_INPUT_STEP_SECONDS}
                type="datetime-local"
                value={date}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="class-duration">Duración en horas</Label>
              <Input
                id="class-duration"
                min={MIN_CLASS_DURATION_HOURS}
                onChange={(event) => setDurationHours(Number(event.target.value))}
                required
                step={CLASS_DURATION_STEP_HOURS}
                type="number"
                value={durationHours}
              />
              <p className="text-xs text-muted-foreground">En bloques de 15 minutos (0,25 h).</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="class-subject">Materia</Label>
            <NativeSelect
              id="class-subject"
              onChange={(event) => setSubjectId(event.target.value)}
              required
              value={subjectId}
            >
              <option value="">Seleccionar materia</option>
              {subjects.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} · {formatCurrency(item.pricePerHour)} / hora
                </option>
              ))}
            </NativeSelect>
          </div>

          <div className="space-y-2">
            <Label htmlFor="class-student-search">Asistentes</Label>
            {students.length > 0 ? (
              <StudentSearchBar
                id="class-student-search"
                onChange={setStudentSearch}
                value={studentSearch}
              />
            ) : null}
            <div className="grid max-h-64 gap-2 overflow-y-auto sm:grid-cols-2">
              {filteredStudents.map((student) => {
                const selected = attendees.includes(student.id);
                const contactsLabel = formatContacts(student.contacts);
                return (
                  <button
                    className={`min-h-16 rounded-lg border p-3 text-left transition ${
                      selected ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-muted-foreground/30'
                    }`}
                    key={student.id}
                    onClick={() => toggleAttendee(student.id)}
                    type="button"
                  >
                    <span className="block font-semibold text-foreground">{student.name}</span>
                    {contactsLabel ? (
                      <span className="mt-1 block text-xs text-muted-foreground">{contactsLabel}</span>
                    ) : null}
                    <span className="mt-1 inline-flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant={student.discountPercent > 0 ? 'default' : 'secondary'}>
                        {student.discountPercent}% OFF
                      </Badge>
                      {formatCurrency(effectivePriceForStudent(student))}
                    </span>
                  </button>
                );
              })}
            </div>
            {students.length === 0 ? (
              <p className="text-sm text-muted-foreground">Cargá alumnos antes de crear clases.</p>
            ) : filteredStudents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No se encontraron alumnos con esa búsqueda.</p>
            ) : null}
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="class-status">Estado</Label>
                <NativeSelect
                  id="class-status"
                  onChange={(event) => setPaymentStatus(event.target.value as ClassPaymentStatus)}
                  value={paymentStatus}
                >
                  {CLASS_PAYMENT_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </NativeSelect>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="class-surcharge">Recargo (%)</Label>
                <Input
                  disabled={isFree}
                  id="class-surcharge"
                  min={0}
                  onChange={(event) => setSurchargePercent(Number(event.target.value))}
                  step={1}
                  type="number"
                  value={surchargePercent}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <PriceDisplay amount={displayPrice.basePrice} label="Precio base" />
              <PriceDisplay amount={displayPrice.finalPrice} label="Precio final" />
            </div>

            {selectedStudents.length > 0 && !isFree ? (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-muted-foreground">Precio efectivo por alumno</p>
                {selectedStudents.map((student) => (
                  <div className="flex items-center justify-between rounded-lg bg-background px-3 py-2 text-sm" key={student.id}>
                    <span className="text-muted-foreground">{student.name}</span>
                    <span className="font-semibold text-foreground">
                      {formatCurrency(effectivePriceForStudent(student))}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <DialogFooter>
            {classItem && onDelete ? (
              <Button className="sm:mr-auto" onClick={() => onDelete(classItem)} type="button" variant="destructive">
                Eliminar
              </Button>
            ) : null}
            <Button onClick={onClose} type="button" variant="outline">
              Cancelar
            </Button>
            <Button disabled={saving || !subjectId || attendees.length === 0} type="submit">
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
