import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { AppErrorBoundary } from '@/app/error-boundary';
import { ProtectedRoute } from '@/app/protected-route';
import { NotFoundRoute } from '@/app/routes/not-found-route';
import { PageSpinner } from '@/components/ui/spinner';
import { LoginRoute } from '@/features/auth/routes/login-route';

const DashboardRoute = lazy(() =>
  import('@/features/dashboard/routes/dashboard-route').then((module) => ({ default: module.DashboardRoute })),
);
const StudentsRoute = lazy(() =>
  import('@/features/students/routes/students-route').then((module) => ({ default: module.StudentsRoute })),
);
const SubjectsRoute = lazy(() =>
  import('@/features/subjects/routes/subjects-route').then((module) => ({ default: module.SubjectsRoute })),
);
const CalendarRoute = lazy(() =>
  import('@/features/classes/routes/calendar-route').then((module) => ({ default: module.CalendarRoute })),
);
const ClassesRoute = lazy(() =>
  import('@/features/classes/routes/classes-route').then((module) => ({ default: module.ClassesRoute })),
);
const BalancesRoute = lazy(() =>
  import('@/features/students/routes/balances-route').then((module) => ({ default: module.BalancesRoute })),
);

function RouteFallback() {
  return <PageSpinner>Cargando…</PageSpinner>;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AppErrorBoundary>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/login" element={<LoginRoute />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Navigate to="/inicio" replace />} />
              <Route path="/inicio" element={<DashboardRoute />} />
              <Route path="/alumnos" element={<StudentsRoute />} />
              <Route path="/materias" element={<SubjectsRoute />} />
              <Route path="/calendario" element={<CalendarRoute />} />
              <Route path="/clases" element={<ClassesRoute />} />
              <Route path="/saldos" element={<BalancesRoute />} />
              <Route path="*" element={<NotFoundRoute />} />
            </Route>
            <Route path="*" element={<NotFoundRoute />} />
          </Routes>
        </Suspense>
      </AppErrorBoundary>
    </BrowserRouter>
  );
}
