import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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
  const { attendeeNames, filteredClasses, filters, setFilters, subjectName } = useClassList({ classes, students, subjects });

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clases</h1>
          <p className="text-sm text-muted-foreground">Listado completo con filtros y pago rápido.</p>
        </div>
        <Button onClick={onCreate}>
          <Plus className="size-4" data-icon="inline-start" />
          Nueva clase
        </Button>
      </div>

      <ClassFilters filters={filters} onChange={setFilters} students={students} subjects={subjects}>
        <ClassFilters.PaidField />
        <ClassFilters.SubjectField />
        <ClassFilters.StudentField />
      </ClassFilters>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Cargando...
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {filteredClasses.length === 0 && !loading ? (
          <p className="p-6 text-sm text-muted-foreground">No hay clases para los filtros seleccionados.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead className="hidden md:table-cell">Materia</TableHead>
                <TableHead className="hidden lg:table-cell">Asistentes</TableHead>
                <TableHead className="hidden md:table-cell">Duración</TableHead>
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
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {subjectName(classItem.subjectId)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">
                    {attendeeNames(classItem.attendees) || 'Sin asistentes'}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{classItem.durationHours} h</TableCell>
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
                      <span className="text-xs text-muted-foreground">
                        {isClassFree(classItem) ? 'Sí' : 'No'}
                      </span>
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
                    <div className="flex justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              aria-label="Editar clase"
                              onClick={() => onEdit(classItem)}
                              size="icon-sm"
                              variant="ghost"
                            />
                          }
                        >
                          <Pencil className="size-4" />
                        </TooltipTrigger>
                        <TooltipContent>Editar</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              aria-label="Eliminar clase"
                              onClick={() => onDelete(classItem)}
                              size="icon-sm"
                              variant="destructive"
                            />
                          }
                        >
                          <Trash2 className="size-4" />
                        </TooltipTrigger>
                        <TooltipContent>Eliminar</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </section>
  );
}
