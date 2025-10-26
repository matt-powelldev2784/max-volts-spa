import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-base font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: 'bg-mv-orange text-primary-foreground',
        destructive:
          'bg-destructive text-white focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline: 'border bg-background shadow-xs dark:bg-input/30 dark:border-input',
        secondary: 'bg-secondary text-secondary-foreground',
        ghost: 'text-foreground border-2 border-gray-400 text-gray-500',
        link: 'text-primary underline-offset-4',
        iconPrimary: 'bg-neutral-400 text-white',
        iconGhost: 'bg-mv-green text-white',
        blank: '',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        formButton: 'h-10 rounded-md px-6 has-[>svg]:px-4 w-1/2 md:w-auto md:min-w-[150px]',
        lgFullWidth: 'h-10 rounded-md px-6 has-[>svg]:px-4 w-full',
        icon: 'size-9',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

type ButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    isLoading?: boolean;
  };

function Button({ className, variant, size, asChild = false, isLoading, children, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? <Loader2 className="animate-spin" /> : children}
    </Comp>
  );
}

type LinkProps = React.ComponentProps<typeof Link> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

function LinkButton({ className, variant, size, asChild = false, children, ...props }: LinkProps) {
  const Comp = asChild ? Slot : Link;

  return (
    <Comp data-slot="link" className={cn(buttonVariants({ variant, size, className }))} {...props}>
      {children}
    </Comp>
  );
}

export { Button, LinkButton };
