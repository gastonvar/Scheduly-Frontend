import { Copy, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { ItemActions } from '@/components/common/item-actions';
import { PageHeader } from '@/components/common/page-header';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ReferralBadge } from '@/features/students/components/ReferralBadge';
import { useStudentList } from '@/features/students/hooks/useStudentList';
import { StudentSearchBar } from '@/components/StudentSearchBar';
import type { Class, Contact, Student, Subject } from '@/types';
import { contactHref, contactTypeLabel, copyContactValue } from '@/utils/contacts';
import { formatDate } from '@/utils/format';

type StudentListProps = {
  classes: Class[];
  error: string | null;
  loading: boolean;
  onCreate: () => void;
  onDelete: (student: Student) => void;
  onEdit: (student: Student) => void;
  students: Student[];
  subjects: Subject[];
};

async function handleCopyContact(contact: Contact) {
  const ok = await copyContactValue(contact.value);
  if (ok) {
    toast.success('Contacto copiado.');
  } else {
    toast.error('No se pudo copiar el contacto.');
  }
}

function ContactRow({ contact }: { contact: Contact }) {
  const href = contactHref(contact);

  return (
    <li className="flex min-h-9 items-center gap-1.5">
      <span className="min-w-0 flex-1 truncate">
        <span className="text-muted-foreground/70">{contactTypeLabel(contact.type)}:</span>{' '}
        {href ? (
          <a
            className="text-foreground underline-offset-2 hover:underline"
            href={href}
            rel={contact.type === 'WhatsApp' ? 'noreferrer' : undefined}
            target={contact.type === 'WhatsApp' ? '_blank' : undefined}
          >
            {contact.value}
          </a>
        ) : (
          contact.value
        )}
      </span>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              aria-label={`Copiar ${contactTypeLabel(contact.type)}`}
              onClick={() => void handleCopyContact(contact)}
              size="icon-sm"
              type="button"
              variant="ghost"
            />
          }
        >
          <Copy className="size-3.5" />
        </TooltipTrigger>
        <TooltipContent>Copiar</TooltipContent>
      </Tooltip>
    </li>
  );
}

function StudentCard({
  lastPaidClass,
  onDelete,
  onEdit,
  paidReferralCount,
  referredByName,
  student,
  subjectName,
}: {
  lastPaidClass: Class | null;
  onDelete: (student: Student) => void;
  onEdit: (student: Student) => void;
  paidReferralCount: number;
  referredByName: string;
  student: Student;
  subjectName: string;
}) {
  return (
    <article className="flex min-h-16 flex-col gap-3 overflow-hidden rounded-xl border bg-card px-3 py-3 sm:px-4">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium leading-snug">{student.name}</p>
          {student.contacts.length === 0 ? (
            <p className="mt-0.5 text-xs text-muted-foreground">Sin contactos</p>
          ) : (
            <ul className="mt-1 space-y-0.5 text-sm text-muted-foreground">
              {student.contacts.map((contact) => (
                <ContactRow contact={contact} key={contact.id} />
              ))}
            </ul>
          )}
        </div>
        <ItemActions
          deleteLabel="Eliminar alumno"
          editLabel="Editar alumno"
          onDelete={() => onDelete(student)}
          onEdit={() => onEdit(student)}
        />
      </div>
      <div className="flex min-w-0 flex-wrap items-end justify-between gap-2 text-xs text-muted-foreground">
        <div className="min-w-0">
          {lastPaidClass ? (
            <p>
              Última paga {formatDate(lastPaidClass.date)}
              {subjectName ? ` · ${subjectName}` : ''}
            </p>
          ) : (
            <p>Sin clases pagadas</p>
          )}
          {referredByName ? <p>Referido por {referredByName}</p> : null}
        </div>
        <ReferralBadge discountPercent={student.discountPercent} paidReferralCount={paidReferralCount} />
      </div>
    </article>
  );
}

export function StudentList({
  classes,
  error,
  loading,
  onCreate,
  onDelete,
  onEdit,
  students,
  subjects,
}: StudentListProps) {
  const {
    filteredStudents,
    lastPaidClassForStudent,
    paidReferralCountForStudent,
    search,
    setSearch,
    studentName,
    subjectName,
  } = useStudentList({ classes, students, subjects });

  return (
    <section className="space-y-4">
      <PageHeader
        actions={
          <Button onClick={onCreate}>
            <Plus className="size-4" data-icon="inline-start" />
            Nuevo alumno
          </Button>
        }
        description="Gestioná datos de contacto, referidos y descuentos."
        title="Alumnos"
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

      {students.length > 0 ? <StudentSearchBar onChange={setSearch} value={search} /> : null}

      {students.length === 0 && !loading ? (
        <p className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">Todavía no hay alumnos cargados.</p>
      ) : filteredStudents.length === 0 ? (
        <p className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
          No se encontraron alumnos con esa búsqueda.
        </p>
      ) : (
        <>
          <ul className="space-y-2 md:hidden">
            {filteredStudents.map((student) => {
              const lastPaidClass = lastPaidClassForStudent(student.id);
              return (
                <li key={student.id}>
                  <StudentCard
                    lastPaidClass={lastPaidClass}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    paidReferralCount={paidReferralCountForStudent(student)}
                    referredByName={studentName(student.referredBy)}
                    student={student}
                    subjectName={lastPaidClass ? subjectName(lastPaidClass.subjectId) : ''}
                  />
                </li>
              );
            })}
          </ul>

          <div className="hidden overflow-hidden rounded-xl border border-border bg-card md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="hidden lg:table-cell">Contactos</TableHead>
                  <TableHead>Última clase pagada</TableHead>
                  <TableHead className="hidden lg:table-cell">Referido por</TableHead>
                  <TableHead className="hidden lg:table-cell">Descuento</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => {
                  const lastPaidClass = lastPaidClassForStudent(student.id);

                  return (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <ul className="space-y-0.5 text-muted-foreground">
                          {student.contacts.length === 0 ? (
                            <li>Sin contactos</li>
                          ) : (
                            student.contacts.map((contact) => <ContactRow contact={contact} key={contact.id} />)
                          )}
                        </ul>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {lastPaidClass ? (
                          <>
                            <span className="block">{formatDate(lastPaidClass.date)}</span>
                            <span className="block text-xs">{subjectName(lastPaidClass.subjectId)}</span>
                          </>
                        ) : (
                          'Sin clases pagadas'
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {studentName(student.referredBy)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <ReferralBadge
                          discountPercent={student.discountPercent}
                          paidReferralCount={paidReferralCountForStudent(student)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <ItemActions
                          className="justify-end"
                          deleteLabel="Eliminar alumno"
                          editLabel="Editar alumno"
                          onDelete={() => onDelete(student)}
                          onEdit={() => onEdit(student)}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </section>
  );
}
