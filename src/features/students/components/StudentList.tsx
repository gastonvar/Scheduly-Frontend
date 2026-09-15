import { Copy, Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
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
    <li className="flex items-center gap-1.5">
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Alumnos</h1>
          <p className="text-sm text-muted-foreground">Gestioná datos de contacto, referidos y descuentos.</p>
        </div>
        <Button onClick={onCreate}>
          <Plus className="size-4" data-icon="inline-start" />
          Nuevo alumno
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

      {students.length > 0 ? <StudentSearchBar onChange={setSearch} value={search} /> : null}

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {students.length === 0 && !loading ? (
          <p className="p-6 text-sm text-muted-foreground">Todavía no hay alumnos cargados.</p>
        ) : filteredStudents.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No se encontraron alumnos con esa búsqueda.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className="hidden lg:table-cell">Contactos</TableHead>
                <TableHead className="hidden sm:table-cell">Última clase pagada</TableHead>
                <TableHead className="hidden md:table-cell">Referido por</TableHead>
                <TableHead className="hidden md:table-cell">Descuento</TableHead>
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
                          student.contacts.map((contact) => (
                            <ContactRow contact={contact} key={contact.id} />
                          ))
                        )}
                      </ul>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {lastPaidClass ? (
                        <>
                          <span className="block">{formatDate(lastPaidClass.date)}</span>
                          <span className="block text-xs">{subjectName(lastPaidClass.subjectId)}</span>
                        </>
                      ) : (
                        'Sin clases pagadas'
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {studentName(student.referredBy)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <ReferralBadge
                        discountPercent={student.discountPercent}
                        paidReferralCount={paidReferralCountForStudent(student)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <Button
                                aria-label="Editar alumno"
                                onClick={() => onEdit(student)}
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
                                aria-label="Eliminar alumno"
                                onClick={() => onDelete(student)}
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
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </section>
  );
}
