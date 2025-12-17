import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/lib/utils';

const textareaVariants = cva(
  'w-full min-h-[80px] rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[1px]',
  {
    variants: {
      variant: {
        default: '',
        homepage:
          'h-32 rounded-lg border-2 border-light-black bg-light-black pl-4 pr-4 py-2 text-light-grey shadow-none focus-visible:ring-0 placeholder:text-lightGrey/60 aria-invalid:border-red-500',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & VariantProps<typeof textareaVariants>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, variant, ...props }, ref) => (
  <textarea ref={ref} className={cn(textareaVariants({ variant }), className)} {...props} />
));

Textarea.displayName = 'Textarea';

export { Textarea };
