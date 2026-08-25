'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * The house button.
 *
 * Every variant shares one behaviour: a wash rises from the bottom edge on
 * hover while the label stays put. Nothing scales, nothing bounces — the
 * movement is in the surface, not the object.
 */
const buttonVariants = cva(
  [
    'group/btn relative isolate inline-flex items-center justify-center gap-2.5 overflow-hidden',
    'rounded-full font-sans font-medium uppercase whitespace-nowrap',
    'transition-[color,border-color,box-shadow] duration-500 ease-luxe',
    'disabled:pointer-events-none disabled:opacity-40',
    // The wash.
    'before:absolute before:inset-0 before:-z-10 before:origin-bottom before:scale-y-0',
    'before:transition-transform before:duration-[650ms] before:ease-curtain',
    'hover:before:scale-y-100 focus-visible:before:scale-y-100',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-porcelain text-espresso',
          'before:bg-linear-to-t before:from-gold-lit before:to-gold',
          'hover:shadow-[0_18px_50px_-18px_rgb(231_178_105/0.65)]',
        ],
        outline: [
          'border border-crema/25 text-crema',
          'before:bg-porcelain',
          'hover:border-porcelain hover:text-espresso',
        ],
        gilt: [
          'border border-gold/45 text-gold-lit',
          'before:bg-linear-to-t before:from-gold before:to-gold-lit',
          'hover:border-gold-lit hover:text-espresso',
          'hover:shadow-[0_18px_50px_-18px_rgb(231_178_105/0.55)]',
        ],
        ghost: ['text-crema before:bg-porcelain/8 hover:text-porcelain'],
      },
      size: {
        sm: 'h-10 px-5 text-micro',
        md: 'h-12 px-7 text-micro',
        lg: 'h-14 px-9 text-label tracking-[0.24em]',
        xl: 'h-16 px-11 text-label tracking-[0.24em]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export type ButtonProps = React.ComponentPropsWithoutRef<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, asChild = false, ...props },
  ref
) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
});

export { buttonVariants };
