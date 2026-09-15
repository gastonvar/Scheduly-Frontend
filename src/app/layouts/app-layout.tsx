import { BookOpen, CalendarDays, Home, List, LogOut, Menu, Users, Wallet, type LucideIcon } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useLogout } from '@/features/auth/hooks/use-auth';
import { useAuthStore } from '@/lib/auth-store';
import { cn } from '@/lib/utils';

const navItems: Array<{ to: string; label: string; icon: LucideIcon; end?: boolean }> = [
  { to: '/inicio', label: 'Inicio', icon: Home, end: true },
  { to: '/alumnos', label: 'Alumnos', icon: Users },
  { to: '/materias', label: 'Materias', icon: BookOpen },
  { to: '/calendario', label: 'Calendario', icon: CalendarDays },
  { to: '/clases', label: 'Clases', icon: List },
  { to: '/saldos', label: 'Saldos', icon: Wallet },
];

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Navegación principal" className="grid gap-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )
            }
            end={item.end}
            key={item.to}
            onClick={onNavigate}
            to={item.to}
          >
            <Icon className="size-4" />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}

function LogoutButton({ className }: { className?: string }) {
  const logout = useLogout();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  return (
    <div className={cn('mt-auto space-y-2 pt-4', className)}>
      {user?.email ? (
        <p className="truncate px-3 text-xs text-muted-foreground" title={user.email}>
          {user.email}
        </p>
      ) : null}
      <Button
        aria-label="Cerrar sesión"
        className="w-full justify-start"
        disabled={logout.isPending}
        onClick={async () => {
          try {
            await logout.mutateAsync();
          } finally {
            navigate('/login', { replace: true });
          }
        }}
        variant="ghost"
      >
        <LogOut className="size-4" />
        Salir
      </Button>
    </div>
  );
}

function Brand() {
  return (
    <>
      <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary">Tutor</p>
      <p className="text-xl font-black text-foreground">Scheduly</p>
    </>
  );
}

export function AppLayout({ children }: { children?: ReactNode }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isCalendar = location.pathname === '/calendario';

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-background text-foreground">
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <header className="flex shrink-0 items-center justify-between border-b border-border bg-background/90 p-4 lg:hidden">
          <div>
            <Brand />
          </div>
          <Button aria-label="Abrir menú" onClick={() => setSidebarOpen(true)} size="icon" variant="ghost">
            <Menu className="size-5" />
          </Button>
        </header>

        <Sheet onOpenChange={setSidebarOpen} open={sidebarOpen}>
          <SheetContent className="flex h-full w-64 flex-col p-4" side="left">
            <SheetHeader className="mb-4 p-0">
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary">Tutor</p>
              <SheetTitle className="text-xl font-black">Scheduly</SheetTitle>
            </SheetHeader>
            <NavList onNavigate={() => setSidebarOpen(false)} />
            <LogoutButton />
          </SheetContent>
        </Sheet>

        <aside className="hidden shrink-0 flex-col border-r border-border bg-background/90 p-4 lg:flex lg:w-56">
          <div className="mb-6">
            <Brand />
          </div>
          <NavList />
          <LogoutButton />
        </aside>

        <main
          className={cn(
            'flex min-h-0 flex-1 flex-col gap-5 p-4 sm:p-6 lg:p-6',
            isCalendar ? 'overflow-hidden' : 'overflow-y-auto',
          )}
        >
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}
