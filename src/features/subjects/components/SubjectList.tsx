import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import type { Subject } from '@/types';
import { getSubjectColor } from '@/utils/subjectColor';

type SubjectListProps = {
  error: string | null;
  loading: boolean;
  onCreate: () => void;
  onDelete: (subject: Subject) => void;
  onEdit: (subject: Subject) => void;
  subjects: Subject[];
};

export function SubjectList({ error, loading, onCreate, onDelete, onEdit, subjects }: SubjectListProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Materias</h1>
          <p className="text-sm text-muted-foreground">Definí precios por hora en múltiplos de $50 UYU.</p>
        </div>
        <Button onClick={onCreate}>
          <Plus className="size-4" data-icon="inline-start" />
          Nueva materia
        </Button>
      </div>

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
        {subjects.length === 0 && !loading ? (
          <p className="p-6 text-sm text-muted-foreground">Todavía no hay materias cargadas.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" />
                <TableHead>Nombre</TableHead>
                <TableHead>Precio por hora</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.map((subject) => (
                <TableRow key={subject.id}>
                  <TableCell>
                    <span
                      aria-hidden
                      className="inline-block size-3 rounded-full"
                      style={{ backgroundColor: getSubjectColor(subject) }}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{subject.name}</TableCell>
                  <TableCell>
                    <PriceDisplay amount={subject.pricePerHour} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              aria-label="Editar materia"
                              onClick={() => onEdit(subject)}
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
                              aria-label="Eliminar materia"
                              onClick={() => onDelete(subject)}
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
