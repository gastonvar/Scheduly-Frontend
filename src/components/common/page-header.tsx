import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type PageHeaderProps = {
  title?: string;
  description?: string;
  descriptionClassName?: string;
  actions?: ReactNode;
};

export function PageHeader({ title, description, descriptionClassName, actions }: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between',
        !description && !actions && 'max-lg:hidden',
      )}
    >
      <div className="min-w-0">
        {title ? <h1 className="hidden text-2xl font-bold tracking-tight text-foreground lg:block">{title}</h1> : null}
        {description ? (
          <p className={cn('text-sm text-muted-foreground lg:mt-1', descriptionClassName)}>
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:w-auto [&>a]:w-full [&>a]:sm:w-auto [&>button]:w-full [&>button]:sm:w-auto">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
