'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * The house button.
 *
 * Fully rounded, softly shadowed, and lit rather than filled: a gold wash
 * rises from the bottom edge on hover while the label stays exactly where it
 * was. Nothing scales, nothing bounces — the movement is in the surface, not
 * in the object. The shadow deepens by a millimetre at the same time, which
 * is what makes the pill read as floating rather than printed.
 *
 * Timing is the one thing that is *not* slow here. A 700ms colour change and a
 * 750ms wash on a control you just clicked does not read as considered, it
 * reads as broken — a button has to acknowledge the cursor inside about
 * 150ms. The wash still takes its time; the acknowledgement does not.
 */
const buttonVariants = cva(
  [
    'group/btn relative isolate inline-flex items-center justify-center gap-2.5 overflow-hidden',
    'rounded-full font-sans font-medium uppercase whitespace-nowrap',
    'transition-[color,border-color,box-shadow,transform] duration-200 ease-luxe',
    // The press. A control that gives nothing back on pointerdown reads as
    // unresponsive no matter how quick everything after it is.
    'touch-manipulation active:scale-[0.98] active:duration-[80ms]',
    'disabled:pointer-events-none disabled:opacity-40',
    // The wash. Quick enough to feel like a response, slow enough to read as
    // light rising rather than a colour swapping.
    'before:absolute before:inset-0 before:-z-10 before:origin-bottom before:scale-y-0',
    // ease-luxe, not ease-curtain. The curtain curve is an ease-in-out and is
    // near-flat through its first third, so the gold did not visibly start
    // climbing until roughly 110ms after the pointer landed — which is most of
    // what "the button takes too long to respond" actually was.
    'before:transition-transform before:duration-[340ms] before:ease-luxe',
    'hover:before:scale-y-100 focus-visible:before:scale-y-100',
  ],
  {
    variants: {
      variant: {
        /** Charcoal pill — the one primary action in any given view. */
        primary: [
          'bg-ink text-canvas shadow-pill',
          'before:bg-linear-to-t before:from-gold-deep before:to-gold',
          'hover:text-ink hover:shadow-[0_2px_4px_rgb(58_43_22/0.06),0_20px_44px_-16px_rgb(196_154_82/0.6)]',
        ],
        /** Hairline pill on paper — the quiet, everywhere action. */
        outline: [
          'border border-hair bg-card/70 text-ink shadow-soft',
          'before:bg-linear-to-t before:from-gold-wash before:to-card',
          'hover:border-gold/55 hover:shadow-float',
        ],
        /** Gold-edged pill, kept for the single reservation call. */
        gilt: [
          'border border-gold/50 bg-card/75 text-gold-deep shadow-soft',
          'before:bg-linear-to-t before:from-gold before:to-gold-lit',
          'hover:border-gold hover:text-ink hover:shadow-glow',
        ],
        ghost: ['text-ink-soft before:bg-gold-wash/70 hover:text-ink'],
      },
      size: {
        sm: 'h-10 px-5 text-micro',
        md: 'h-12 px-7 text-micro',
        lg: 'h-14 px-9 text-label tracking-[0.22em]',
        xl: 'h-16 px-11 text-label tracking-[0.22em]',
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
