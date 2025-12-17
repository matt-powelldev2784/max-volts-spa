import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[1px]',
  {
    variants: {
      variant: {
        default: '',
        homepage:
          'h-11 rounded-lg border-2 border-light-black bg-light-black pl-10 pr-4 py-2 text-light-grey shadow-none focus-visible:ring-0 placeholder:text-lightGrey/60 aria-invalid:border-red-500',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

type InputProps = React.ComponentProps<'input'> &
  VariantProps<typeof inputVariants> & {
    iconSrc?: string;
    iconAlt?: string;
  };

function Input({ className, type, variant, iconSrc, iconAlt = '', ...props }: InputProps) {
  return (
    <div className="relative">
      {iconSrc ? (
        <img
          src={iconSrc}
          alt={iconAlt}
          width={22}
          height={22}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
          draggable={false}
        />
      ) : null}

      <input
        type={type}
        data-slot="input"
        className={cn(inputVariants({ variant }), iconSrc ? 'pl-12' : '', className)}
        {...props}
      />
    </div>
  );
}

export { Input };
