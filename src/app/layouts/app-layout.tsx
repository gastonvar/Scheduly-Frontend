import { BookOpen, CalendarDays, Home, List, LogOut, Plus, Users, Wallet, type LucideIcon } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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

const titles: Record<string, string> = {
  '/inicio': 'Inicio',
  '/alumnos': 'Alumnos',
  '/materias': 'Materias',
  '/calendario': 'Calendario',
  '/clases': 'Clases',
  '/saldos': 'Saldos',
};

const quickActions = [
  { to: '/alumnos?new=1', label: 'Nuevo alumno' },
  { to: '/materias?new=1', label: 'Nueva materia' },
  { to: '/clases?new=1', label: 'Nueva clase' },
];

function pageTitle(pathname: string): string {
  return titles[pathname] ?? 'Scheduly';
}

function navClassName({ isActive }: { isActive: boolean }) {
  return cn(
    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground',
    isActive && 'bg-primary/10 text-primary',
  );
}

function NavList() {
  return (
    <nav aria-label="Navegación principal" className="flex flex-col gap-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink className={navClassName} end={item.end} key={item.to} to={item.to}>
            <Icon className="size-5" />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}

function QuickActions() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <Button aria-label="Nuevo" onClick={() => setOpen(true)} size="icon">
        <Plus className="size-5" />
        <span className="sr-only">Nuevo</span>
      </Button>
      <Dialog onOpenChange={setOpen} open={open}>
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>Nuevo</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            {quickActions.map((action) => (
              <Button
                className="w-full justify-start"
                key={action.to}
                onClick={() => {
                  setOpen(false);
                  navigate(action.to);
                }}
                type="button"
                variant="outline"
              >
                {action.label}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function UserMenu() {
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <span className="hidden max-w-[12rem] truncate text-sm text-muted-foreground lg:inline">{user?.email}</span>
      <Button
        aria-label="Cerrar sesión"
        className="lg:h-11 lg:w-auto lg:px-4"
        disabled={logout.isPending}
        onClick={async () => {
          try {
            await logout.mutateAsync();
          } finally {
            navigate('/login', { replace: true });
          }
        }}
        size="icon"
        variant="ghost"
      >
        <LogOut className="size-5" />
        <span className="hidden lg:inline">Salir</span>
      </Button>
    </div>
  );
}

function Brand() {
  return (
    <div className="min-w-0">
      <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary">Tutor</p>
      <p className="text-xl font-black leading-tight text-foreground">Scheduly</p>
    </div>
  );
}

function MobileTabBar() {
  return (
    <nav
      aria-label="Secciones"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] backdrop-blur lg:hidden"
    >
      <ul className="flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <li className="min-w-[4.5rem] flex-1" key={item.to}>
              <NavLink
                className={({ isActive }) =>
                  cn(
                    'flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 text-[11px] font-medium text-muted-foreground',
                    isActive && 'text-primary',
                  )
                }
                end={item.end}
                to={item.to}
              >
                <Icon className="size-5" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function AppLayout({ children }: { children?: ReactNode }) {
  const location = useLocation();
  const isCalendar = location.pathname === '/calendario';

  return (
    <div
      className={cn(
        'bg-background lg:grid lg:grid-cols-[14rem_1fr]',
        isCalendar ? 'h-dvh overflow-hidden' : 'min-h-svh',
      )}
    >
      <aside className="hidden border-r bg-card px-4 py-6 lg:flex lg:flex-col">
        <div className="mb-8 px-2">
          <Brand />
        </div>
        <NavList />
      </aside>
      <div className={cn('flex min-h-0 min-w-0 flex-col', isCalendar && 'h-full')}>
        <header className="sticky top-0 z-30 flex items-center gap-2 border-b bg-background/95 px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur lg:gap-3 lg:px-6 lg:py-3 lg:pt-[max(0.75rem,env(safe-area-inset-top))]">
          <span className="shrink-0 text-xs font-bold uppercase tracking-[0.28em] text-primary lg:hidden">Tutor</span>
          <h1 className="min-w-0 flex-1 truncate text-base font-semibold lg:hidden">{pageTitle(location.pathname)}</h1>
          <div className="hidden flex-1 lg:block" />
          <QuickActions />
          <UserMenu />
        </header>
        <main
          className={cn(
            'flex-1 px-3 py-4 pb-[calc(4.5rem+env(safe-area-inset-bottom))] sm:px-4 lg:px-6 lg:py-6 lg:pb-6',
            isCalendar && 'flex min-h-0 flex-col overflow-hidden',
          )}
        >
          {children ?? <Outlet />}
        </main>
        <MobileTabBar />
      </div>
    </div>
  );
}
