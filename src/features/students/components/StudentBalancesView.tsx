import { useMemo, useState } from 'react';
import { Loader2, Wallet } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StudentSearchBar } from '@/components/StudentSearchBar';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  computeAllStudentBalances,
  type StudentBalance,
} from '@/features/students/utils/studentBalance';
import type { Class, Student, Subject } from '@/types';
import { classStatusClassName, classStatusLabel } from '@/utils/classStatus';
import { formatDate, formatTime } from '@/utils/format';
import { filterStudentsBySearch } from '@/utils/studentSearch';

type StudentBalancesViewProps = {
  classes: Class[];
  error: string | null;
  loading: boolean;
  onTogglePaid: (classItem: Class) => void;
  students: Student[];
  subjects: Subject[];
};

function UnpaidClassRow({
  classItem,
  onTogglePaid,
  shareAmount,
  subjectName,
}: {
  classItem: Class;
  onTogglePaid: (classItem: Class) => void;
  shareAmount: number;
  subjectName: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-medium">{formatDate(classItem.date)}</p>
        <p className="text-xs text-muted-foreground">
          {formatTime(classItem.date)} · {subjectName}
        </p>
      </div>
      <div className="flex min-w-0 flex-col gap-2 sm:items-end">
        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <PriceDisplay amount={shareAmount} />
          <Badge className={classStatusClassName(classItem)}>{classStatusLabel(classItem)}</Badge>
        </div>
        <Button className="w-full sm:w-auto" onClick={() => onTogglePaid(classItem)} type="button" variant="outline">
          Marcar pagada
        </Button>
      </div>
    </div>
  );
}

function BalanceCard({
  balance,
  onTogglePaid,
}: {
  balance: StudentBalance;
  onTogglePaid: (classItem: Class) => void;
}) {
  return (
    <Card className="ring-1 ring-foreground/10">
      <CardHeader className="pb-3">
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <CardTitle className="text-lg">{balance.student.name}</CardTitle>
            <CardDescription>
              {balance.unpaidClasses.length} pendiente
              {balance.unpaidClasses.length === 1 ? '' : 's'}
              {balance.lastPaidDate ? ` · Último pago ${formatDate(balance.lastPaidDate)}` : ''}
            </CardDescription>
          </div>
          <div className="sm:text-right">
            <p className="text-xs text-muted-foreground">Saldo pendiente</p>
            <PriceDisplay amount={balance.unpaidTotal} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {balance.unpaidClasses.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin clases pendientes.</p>
        ) : (
          <>
            <div className="space-y-2 md:hidden">
              {balance.unpaidClasses.map(({ classItem, shareAmount, subjectName }) => (
                <UnpaidClassRow
                  classItem={classItem}
                  key={classItem.id}
                  onTogglePaid={onTogglePaid}
                  shareAmount={shareAmount}
                  subjectName={subjectName}
                />
              ))}
            </div>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Materia</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead className="text-right">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {balance.unpaidClasses.map(({ classItem, shareAmount, subjectName }) => (
                    <TableRow key={classItem.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{formatDate(classItem.date)}</p>
                          <p className="text-xs text-muted-foreground">{formatTime(classItem.date)}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{subjectName}</TableCell>
                      <TableCell className="text-right">
                        <PriceDisplay amount={shareAmount} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Badge className={classStatusClassName(classItem)}>{classStatusLabel(classItem)}</Badge>
                          <Button onClick={() => onTogglePaid(classItem)} type="button" variant="outline">
                            Marcar pagada
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function StudentBalancesView({
  classes,
  error,
  loading,
  onTogglePaid,
  students,
  subjects,
}: StudentBalancesViewProps) {
  const [search, setSearch] = useState('');
  const [onlyPending, setOnlyPending] = useState(true);

  const balances = useMemo(
    () => computeAllStudentBalances(students, classes, subjects),
    [classes, students, subjects],
  );

  const filteredBalances = useMemo(() => {
    const matchingStudents = new Set(filterStudentsBySearch(students, search).map((student) => student.id));
    return balances.filter((balance) => {
      if (!matchingStudents.has(balance.student.id)) return false;
      if (onlyPending && balance.unpaidTotal <= 0) return false;
      return true;
    });
  }, [balances, onlyPending, search, students]);

  const totalPending = filteredBalances.reduce((sum, balance) => sum + balance.unpaidTotal, 0);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          description="Pendientes de cobro por alumno. El monto se reparte entre asistentes de cada clase."
          title="Saldos"
        />
        <div className="rounded-lg border border-border bg-card px-4 py-3 sm:text-right">
          <p className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
            <Wallet className="size-3.5" />
            Total filtrado
          </p>
          <PriceDisplay amount={totalPending} />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {students.length > 0 ? (
          <div className="flex-1">
            <StudentSearchBar onChange={setSearch} placeholder="Buscar alumno..." value={search} />
          </div>
        ) : null}
        <Button
          className="w-full sm:w-auto"
          onClick={() => setOnlyPending((current) => !current)}
          type="button"
          variant={onlyPending ? 'default' : 'outline'}
        >
          {onlyPending ? 'Solo con deuda' : 'Todos con actividad'}
        </Button>
      </div>

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

      {filteredBalances.length === 0 && !loading ? (
        <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          {onlyPending
            ? 'No hay alumnos con clases pendientes de cobro.'
            : 'No hay alumnos con actividad de clases todavía.'}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBalances.map((balance) => (
            <BalanceCard balance={balance} key={balance.student.id} onTogglePaid={onTogglePaid} />
          ))}
        </div>
      )}
    </section>
  );
}
