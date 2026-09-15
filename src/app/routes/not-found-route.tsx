import { Link } from 'react-router';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function NotFoundRoute() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-2 text-center">
      <h1 className="text-2xl font-semibold">Página no encontrada</h1>
      <p className="text-sm text-muted-foreground">Esa ruta no existe.</p>
      <Link className={cn(buttonVariants(), 'w-full sm:w-auto')} to="/inicio">
        Volver al inicio
      </Link>
    </div>
  );
}
