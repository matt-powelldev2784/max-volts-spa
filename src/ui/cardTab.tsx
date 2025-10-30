import * as React from 'react';
import { cn } from '@/lib/utils';

function CardTab({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-tab"
      className={cn('w-full m-4 md:m-8 rounded-2xl shadow-lg bg-white', className)}
      {...props}
    />
  );
}

function CardHeaderTab({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="card-header-tab" className={cn('rounded-t-2xl bg-mv-orange/90 px-6 py-2', className)} {...props} />
  );
}

function CardTitleTab({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title-tab"
      className={cn('flex items-center justify-center text-lg font-semibold text-white translate-y-1', className)}
      {...props}
    />
  );
}

function CardDescriptionTab({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description-tab"
      className={cn('flex items-center justify-center text-lg font-semibold text-white', className)}
      {...props}
    />
  );
}

function CardActionTab({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action-tab"
      className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
      {...props}
    />
  );
}

function CardContentTab({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-content-tab"
      className={cn('px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-10 rounded-b-2xl', className)}
      {...props}
    />
  );
}

function CardFooterTab({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="card-footer-tab" className={cn('flex items-center px-6 [.border-t]:pt-6', className)} {...props} />
  );
}

export { CardTab, CardHeaderTab, CardFooterTab, CardTitleTab, CardActionTab, CardDescriptionTab, CardContentTab };
