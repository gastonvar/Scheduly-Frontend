import type { ElementType, ReactNode } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  BookOpen,
  CalendarRange,
  Clock,
  DollarSign,
  Gift,
  GraduationCap,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { DateRange, DashboardMetrics } from '@/features/dashboard/utils/dashboardMetrics';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { classStatusBorderColor, classStatusClassName, classStatusLabel } from '@/utils/classStatus';
import { formatCurrency, formatDate, formatTime } from '@/utils/format';

type DashboardViewProps = {
  dateRange: DateRange;
  error?: string | null;
  loading?: boolean;
  metrics: DashboardMetrics;
  onDateRangeChange: (range: DateRange) => void;
  subjectName: (subjectId: string) => string;
  studentNames: (attendees: string[]) => string;
};

type KpiCardProps = {
  title: string;
  value: ReactNode;
  description?: string;
  icon: ElementType;
  accent?: string;
};

function KpiCard({ title, value, description, icon: Icon, accent = 'text-primary' }: KpiCardProps) {
  return (
    <Card className="ring-1 ring-foreground/10">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardDescription>{title}</CardDescription>
          <Icon className={`size-4 shrink-0 ${accent}`} />
        </div>
        <CardTitle className="text-2xl font-bold tabular-nums">{value}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
    </Card>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
  valueLabel,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
  valueLabel?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      {label ? <p className="mb-1 font-medium text-foreground">{label}</p> : null}
      {payload.map((entry) => (
        <p key={entry.name} className="text-muted-foreground" style={{ color: entry.color }}>
          {entry.name}: {valueLabel === 'currency' ? formatCurrency(entry.value) : `${entry.value}${valueLabel ?? ''}`}
        </p>
      ))}
    </div>
  );
}

export function DashboardView({
  dateRange,
  error = null,
  loading = false,
  metrics,
  onDateRangeChange,
  subjectName,
  studentNames,
}: DashboardViewProps) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inicio</h1>
          <p className="text-sm text-muted-foreground">
            Métricas, ingresos y actividad según el período seleccionado.
          </p>
          {loading ? <p className="mt-1 text-sm text-muted-foreground">Cargando métricas...</p> : null}
          {error ? <p className="mt-1 text-sm text-destructive">{error}</p> : null}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="space-y-1.5">
            <Label htmlFor="dashboard-from" className="flex items-center gap-1.5 text-xs">
              <CalendarRange className="size-3.5" />
              Desde
            </Label>
            <Input
              id="dashboard-from"
              max={dateRange.to}
              onChange={(event) => onDateRangeChange({ ...dateRange, from: event.target.value })}
              type="date"
              value={dateRange.from}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dashboard-to" className="text-xs">
              Hasta
            </Label>
            <Input
              id="dashboard-to"
              min={dateRange.from}
              onChange={(event) => onDateRangeChange({ ...dateRange, to: event.target.value })}
              type="date"
              value={dateRange.to}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          accent="text-primary"
          description={`${metrics.paidClasses} pagadas · ${metrics.unpaidClasses} pendientes`}
          icon={DollarSign}
          title="Cobrado en el período"
          value={<PriceDisplay amount={metrics.paidRevenue} />}
        />
        <KpiCard
          accent="text-orange-400"
          description="Clases facturables sin cobrar"
          icon={TrendingUp}
          title="Pendiente de cobro"
          value={<PriceDisplay amount={metrics.pendingRevenue} />}
        />
        <KpiCard
          accent="text-emerald-400"
          description={`Promedio ${formatCurrency(metrics.averageHourlyRate)}/h cobrada`}
          icon={Clock}
          title="Horas enseñadas"
          value={`${metrics.totalHours} h`}
        />
        <KpiCard
          accent="text-yellow-400"
          description="Horas gratuitas en el período"
          icon={Gift}
          title="Horas gratis"
          value={`${metrics.freeHours} h`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          description={`Duración promedio ${metrics.averageClassDuration} h`}
          icon={BookOpen}
          title="Total de clases"
          value={metrics.totalClasses}
        />
        <KpiCard
          description={`${metrics.uniqueAttendees} alumnos distintos`}
          icon={Users}
          title="Alumnos activos"
          value={metrics.activeStudents}
        />
        <KpiCard
          description="Clases facturables cobradas"
          icon={TrendingUp}
          title="Tasa de cobro"
          value={`${metrics.collectionRate}%`}
        />
        <KpiCard
          description="Precio promedio por clase facturable"
          icon={GraduationCap}
          title="Ticket promedio"
          value={formatCurrency(metrics.averageClassPrice)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="ring-1 ring-foreground/10">
          <CardHeader>
            <CardTitle>Ingresos por semana</CardTitle>
            <CardDescription>Cobrado en clases pagadas del período</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {metrics.revenueByWeek.length === 0 ? (
              <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No hay datos en este período.
              </p>
            ) : (
              <ResponsiveContainer height="100%" width="100%">
                <BarChart data={metrics.revenueByWeek}>
                  <CartesianGrid stroke="oklch(0.3 0.015 285)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="week" stroke="oklch(0.65 0 0)" tick={{ fontSize: 11 }} />
                  <YAxis stroke="oklch(0.65 0 0)" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip content={<ChartTooltip valueLabel="currency" />} />
                  <Bar dataKey="revenue" fill="var(--chart-1)" name="Ingresos" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="ring-1 ring-foreground/10">
          <CardHeader>
            <CardTitle>Horas por materia</CardTitle>
            <CardDescription>Distribución de horas enseñadas</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {metrics.hoursBySubject.length === 0 ? (
              <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No hay datos en este período.
              </p>
            ) : (
              <ResponsiveContainer height="100%" width="100%">
                <BarChart data={metrics.hoursBySubject} layout="vertical">
                  <CartesianGrid stroke="oklch(0.3 0.015 285)" strokeDasharray="3 3" horizontal={false} />
                  <XAxis stroke="oklch(0.65 0 0)" tick={{ fontSize: 11 }} type="number" />
                  <YAxis
                    dataKey="name"
                    stroke="oklch(0.65 0 0)"
                    tick={{ fontSize: 11 }}
                    type="category"
                    width={100}
                  />
                  <Tooltip content={<ChartTooltip valueLabel=" h" />} />
                  <Bar dataKey="hours" fill="var(--chart-2)" name="Horas" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="ring-1 ring-foreground/10">
          <CardHeader>
            <CardTitle>Estado de las clases</CardTitle>
            <CardDescription>Pagadas, pendientes y gratis</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {metrics.statusBreakdown.length === 0 ? (
              <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No hay clases en este período.
              </p>
            ) : (
              <ResponsiveContainer height="100%" width="100%">
                <PieChart>
                  <Pie
                    aria-label="Distribución de estados de clase"
                    cx="50%"
                    cy="50%"
                    data={metrics.statusBreakdown}
                    dataKey="count"
                    innerRadius={55}
                    nameKey="label"
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {metrics.statusBreakdown.map((entry) => (
                      <Cell fill={entry.fill} key={entry.status} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="ring-1 ring-foreground/10">
          <CardHeader>
            <CardTitle>Top alumnos por horas</CardTitle>
            <CardDescription>Los 5 alumnos con más horas en el período</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.topStudents.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No hay alumnos en este período.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Alumno</TableHead>
                    <TableHead className="text-right">Horas</TableHead>
                    <TableHead className="hidden sm:table-cell text-right">Clases</TableHead>
                    <TableHead className="text-right">Cobrado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.topStudents.map((student) => (
                    <TableRow key={student.studentId}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell className="text-right tabular-nums">{student.hours} h</TableCell>
                      <TableCell className="hidden sm:table-cell text-right tabular-nums">{student.classes}</TableCell>
                      <TableCell className="text-right">
                        <PriceDisplay amount={student.revenue} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Próximas clases</h2>
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {metrics.upcomingClasses.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No hay clases en los próximos 7 días.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Materia</TableHead>
                  <TableHead className="hidden sm:table-cell">Fecha</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead className="hidden md:table-cell">Asistentes</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.upcomingClasses.map((classItem) => (
                  <TableRow
                    className="border-l-4"
                    key={classItem.id}
                    style={{ borderLeftColor: classStatusBorderColor(classItem) }}
                  >
                    <TableCell className="font-medium">{subjectName(classItem.subjectId)}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {formatDate(classItem.date)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatTime(classItem.date)}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {studentNames(classItem.attendees) || 'Sin asistentes'}
                    </TableCell>
                    <TableCell>
                      <Badge className={classStatusClassName(classItem)}>{classStatusLabel(classItem)}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Top descuentos</h2>
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {metrics.topDiscounts.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No hay descuentos activos todavía.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alumno</TableHead>
                  <TableHead className="text-right">Descuento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.topDiscounts.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="default">{student.discountPercent}% OFF</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </section>
  );
}
