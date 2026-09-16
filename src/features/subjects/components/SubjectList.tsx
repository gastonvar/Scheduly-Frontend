import { Loader2, Plus } from 'lucide-react';
import { ItemActions } from '@/components/common/item-actions';
import { PageHeader } from '@/components/common/page-header';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

function SubjectCard({
  onDelete,
  onEdit,
  subject,
}: {
  onDelete: (subject: Subject) => void;
  onEdit: (subject: Subject) => void;
  subject: Subject;
}) {
  return (
    <article className="flex min-h-16 items-center gap-3 overflow-hidden rounded-xl border bg-card px-3 py-3 sm:px-4">
      <span aria-hidden className="size-3 shrink-0 rounded-full" style={{ backgroundColor: getSubjectColor(subject) }} />
      <button className="min-w-0 flex-1 text-left" onClick={() => onEdit(subject)} type="button">
        <p className="truncate font-medium leading-snug">{subject.name}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          <PriceDisplay amount={subject.pricePerHour} />
        </p>
      </button>
      <ItemActions
        deleteLabel="Eliminar materia"
        editLabel="Editar materia"
        onDelete={() => onDelete(subject)}
        onEdit={() => onEdit(subject)}
      />
    </article>
  );
}

export function SubjectList({ error, loading, onCreate, onDelete, onEdit, subjects }: SubjectListProps) {
  return (
    <section className="space-y-4">
      <PageHeader
        actions={
          <Button onClick={onCreate}>
            <Plus className="size-4" data-icon="inline-start" />
            Nueva materia
          </Button>
        }
        description="Definí precios por hora en múltiplos de $50 UYU."
        title="Materias"
      />

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

      {subjects.length === 0 && !loading ? (
        <p className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">Todavía no hay materias cargadas.</p>
      ) : (
        <>
          <ul className="space-y-2 md:hidden">
            {subjects.map((subject) => (
              <li key={subject.id}>
                <SubjectCard onDelete={onDelete} onEdit={onEdit} subject={subject} />
              </li>
            ))}
          </ul>

          <div className="hidden overflow-hidden rounded-xl border border-border bg-card md:block">
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
                      <ItemActions
                        className="justify-end"
                        deleteLabel="Eliminar materia"
                        editLabel="Editar materia"
                        onDelete={() => onDelete(subject)}
                        onEdit={() => onEdit(subject)}
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
