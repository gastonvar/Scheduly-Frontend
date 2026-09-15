import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Field, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageSpinner } from '@/components/ui/spinner';
import { useCurrentUser, useLogin } from '@/features/auth/hooks/use-auth';
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas/auth-schemas';
import { getErrorMessage } from '@/lib/api-error';
import { applyFieldErrors } from '@/lib/form-errors';

export function LoginRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useCurrentUser();
  const login = useLogin();
  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname &&
    (location.state as { from?: { pathname?: string } }).from?.pathname !== '/login'
      ? (location.state as { from: { pathname: string } }).from.pathname
      : '/inicio';

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  if (currentUser.isLoading) {
    return <PageSpinner>Comprobando sesión…</PageSpinner>;
  }

  if (currentUser.data) {
    return <Navigate to="/inicio" replace />;
  }

  async function onSubmit(values: LoginFormValues) {
    try {
      await login.mutateAsync(values);
      navigate(from, { replace: true });
    } catch (error) {
      applyFieldErrors(error, form.setError);
      form.setError('root', { message: getErrorMessage(error) });
    }
  }

  return (
    <main className="flex min-h-svh flex-col overflow-y-auto bg-background px-4 py-6 text-foreground sm:py-10">
      <div className="mx-auto my-auto w-full max-w-md rounded-2xl border bg-card p-5 shadow-sm sm:p-8">
        <p className="text-center text-xs font-bold uppercase tracking-[0.35em] text-primary">Tutor</p>
        <p className="mt-2 text-center text-2xl font-black">Scheduly</p>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Iniciar sesión</h1>
        <p className="mt-2 text-base leading-relaxed text-muted-foreground">
          Ingresá para ver alumnos, materias, clases y saldos.
        </p>
        <form className="mt-8 space-y-5" noValidate onSubmit={form.handleSubmit(onSubmit)}>
          <Field className="gap-2">
            <Label className="text-base" htmlFor="email">
              Correo
            </Label>
            <Input
              autoCapitalize="none"
              autoComplete="username"
              autoCorrect="off"
              enterKeyHint="next"
              id="email"
              inputMode="email"
              spellCheck={false}
              type="email"
              {...form.register('email')}
            />
            <FieldError>{form.formState.errors.email?.message}</FieldError>
          </Field>
          <Field className="gap-2">
            <Label className="text-base" htmlFor="password">
              Contraseña
            </Label>
            <Input
              autoComplete="current-password"
              enterKeyHint="go"
              id="password"
              type="password"
              {...form.register('password')}
            />
            <FieldError>{form.formState.errors.password?.message}</FieldError>
          </Field>
          <FieldError>{form.formState.errors.root?.message}</FieldError>
          <Button
            className="w-full"
            disabled={form.formState.isSubmitting || login.isPending}
            size="lg"
            type="submit"
          >
            {form.formState.isSubmitting || login.isPending ? 'Ingresando…' : 'Ingresar'}
          </Button>
        </form>
      </div>
    </main>
  );
}
