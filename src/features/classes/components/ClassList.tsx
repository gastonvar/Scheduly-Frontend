import { Loader2, Plus } from 'lucide-react';
import { ItemActions } from '@/components/common/item-actions';
import { PageHeader } from '@/components/common/page-header';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { ClassFilters } from '@/features/classes/components/ClassFilters';
import { useClassList } from '@/features/classes/hooks/useClassList';
import type { Class, Student, Subject } from '@/types';
import {
  classStatusClassName,
  classStatusLabel,
  isClassFree,
  isClassPaid,
} from '@/utils/classStatus';
import { formatDate, formatTime } from '@/utils/format';

type ClassListProps = {
  classes: Class[];
  error: string | null;
  loading: boolean;
  onCreate: () => void;
  onDelete: (classItem: Class) => void;
  onEdit: (classItem: Class) => void;
  onTogglePaid: (classItem: Class) => void;
  onToggleFree: (classItem: Class) => void;
  students: Student[];
  subjects: Subject[];
};

function ClassPaymentControls({
  classItem,
  onToggleFree,
  onTogglePaid,
}: {
  classItem: Class;
  onToggleFree: (classItem: Class) => void;
  onTogglePaid: (classItem: Class) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <label className="flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 text-sm">
        <Switch
          aria-label={isClassFree(classItem) ? 'Quitar clase gratis' : 'Marcar como gratis'}
          checked={isClassFree(classItem)}
          onCheckedChange={() => onToggleFree(classItem)}
        />
        Gratis
      </label>
      {isClassFree(classItem) ? (
        <div className="flex min-h-11 items-center justify-center rounded-lg border border-border px-3">
          <Badge className={classStatusClassName(classItem)}>{classStatusLabel(classItem)}</Badge>
        </div>
      ) : (
        <label className="flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 text-sm">
          <Switch
            aria-label={isClassPaid(classItem) ? 'Marcar como pendiente' : 'Marcar como pagada'}
            checked={isClassPaid(classItem)}
            onCheckedChange={() => onTogglePaid(classItem)}
          />
          {classStatusLabel(classItem)}
        </label>
      )}
    </div>
  );
}

function ClassCard({
  attendeeNames,
  classItem,
  onDelete,
  onEdit,
  onToggleFree,
  onTogglePaid,
  subjectName,
}: {
  attendeeNames: string;
  classItem: Class;
  onDelete: (classItem: Class) => void;
  onEdit: (classItem: Class) => void;
  onToggleFree: (classItem: Class) => void;
  onTogglePaid: (classItem: Class) => void;
  subjectName: string;
}) {
  return (
    <article className="flex min-w-0 flex-col gap-3 overflow-hidden rounded-xl border bg-card p-3 sm:p-4">
      <div className="flex items-start gap-3">
        <button className="min-w-0 flex-1 text-left" onClick={() => onEdit(classItem)} type="button">
          <p className="font-medium leading-snug">{formatDate(classItem.date)}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatTime(classItem.date)} · {classItem.durationHours} h
          </p>
          <p className="mt-1 truncate text-sm text-muted-foreground">{subjectName}</p>
          <p className="truncate text-xs text-muted-foreground">{attendeeNames || 'Sin asistentes'}</p>
        </button>
        <div className="flex flex-col items-end gap-2">
          {isClassFree(classItem) ? (
            <Badge className={classStatusClassName(classItem)}>Gratis</Badge>
          ) : (
            <PriceDisplay amount={classItem.finalPrice} />
          )}
          <ItemActions
            deleteLabel="Eliminar clase"
            editLabel="Editar clase"
            onDelete={() => onDelete(classItem)}
            onEdit={() => onEdit(classItem)}
          />
        </div>
      </div>
      <ClassPaymentControls classItem={classItem} onToggleFree={onToggleFree} onTogglePaid={onTogglePaid} />
    </article>
  );
}

export function ClassList({
  classes,
  error,
  loading,
  onCreate,
  onDelete,
  onEdit,
  onTogglePaid,
  onToggleFree,
  students,
  subjects,
}: ClassListProps) {
  const { attendeeNames, filteredClasses, filters, setFilters, subjectName } = useClassList({
    classes,
    students,
    subjects,
  });

  return (
    <section className="space-y-4">
      <PageHeader
        actions={
          <Button onClick={onCreate}>
            <Plus className="size-4" data-icon="inline-start" />
            Nueva clase
          </Button>
        }
        description="Listado completo con filtros y pago rápido."
        title="Clases"
      />

      <ClassFilters filters={filters} onChange={setFilters} students={students} subjects={subjects}>
        <ClassFilters.PaidField />
        <ClassFilters.SubjectField />
        <ClassFilters.StudentField />
      </ClassFilters>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Cargando...
        </div>
      ) : null}

      {filteredClasses.length === 0 && !loading ? (
        <p className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
          No hay clases para los filtros seleccionados.
        </p>
      ) : (
        <>
          <ul className="space-y-2 lg:hidden">
            {filteredClasses.map((classItem) => (
              <li key={classItem.id}>
                <ClassCard
                  attendeeNames={attendeeNames(classItem.attendees)}
                  classItem={classItem}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  onToggleFree={onToggleFree}
                  onTogglePaid={onTogglePaid}
                  subjectName={subjectName(classItem.subjectId)}
                />
              </li>
            ))}
          </ul>

          <div className="hidden overflow-hidden rounded-xl border border-border bg-card lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Materia</TableHead>
                  <TableHead className="hidden xl:table-cell">Asistentes</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead className="hidden xl:table-cell">Base</TableHead>
                  <TableHead className="hidden xl:table-cell">Recargo</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Gratis</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClasses.map((classItem) => (
                  <TableRow key={classItem.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{formatDate(classItem.date)}</p>
                        <p className="text-xs text-muted-foreground">{formatTime(classItem.date)}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{subjectName(classItem.subjectId)}</TableCell>
                    <TableCell className="hidden xl:table-cell text-muted-foreground">
                      {attendeeNames(classItem.attendees) || 'Sin asistentes'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{classItem.durationHours} h</TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <PriceDisplay amount={classItem.basePrice} />
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      {classItem.surchargePercent > 0 ? (
                        <Badge variant="default">+{classItem.surchargePercent}%</Badge>
                      ) : (
                        <Badge variant="secondary">Sin recargo</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {isClassFree(classItem) ? (
                        <Badge className={classStatusClassName(classItem)}>Gratis</Badge>
                      ) : (
                        <PriceDisplay amount={classItem.finalPrice} />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          aria-label={isClassFree(classItem) ? 'Quitar clase gratis' : 'Marcar como gratis'}
                          checked={isClassFree(classItem)}
                          onCheckedChange={() => onToggleFree(classItem)}
                        />
                        <span className="text-xs text-muted-foreground">{isClassFree(classItem) ? 'Sí' : 'No'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {isClassFree(classItem) ? (
                        <Badge className={classStatusClassName(classItem)}>{classStatusLabel(classItem)}</Badge>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Switch
                            aria-label={
                              isClassPaid(classItem) ? 'Marcar como pendiente' : 'Marcar como pagada'
                            }
                            checked={isClassPaid(classItem)}
                            onCheckedChange={() => onTogglePaid(classItem)}
                          />
                          <Badge className={classStatusClassName(classItem)}>{classStatusLabel(classItem)}</Badge>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <ItemActions
                        className="justify-end"
                        deleteLabel="Eliminar clase"
                        editLabel="Editar clase"
                        onDelete={() => onDelete(classItem)}
                        onEdit={() => onEdit(classItem)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </section>
  );
}
