'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * The house button.
 *
 * Fully rounded, softly shadowed, and lit rather than filled: a clay wash
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
    // Bricolage at 600 with 0.08em of tracking. The old label was a 0.22em
    // letter-spaced micro-cap, which is the button equivalent of the wide
    // eyebrow: unmistakably template.
    'rounded-full font-sans font-semibold tracking-wide-sm uppercase whitespace-nowrap',
    'transition-[color,border-color,box-shadow,transform] duration-200 ease-luxe',
    // The press. A control that gives nothing back on pointerdown reads as
    // unresponsive no matter how quick everything after it is.
    'touch-manipulation active:scale-[0.98] active:duration-[80ms]',
    'disabled:pointer-events-none disabled:opacity-40',
    // The wash. Quick enough to feel like a response, slow enough to read as
    // light rising rather than a colour swapping.
    'before:absolute before:inset-0 before:-z-10 before:origin-bottom before:scale-y-0',
    // ease-luxe, not ease-curtain. The curtain curve is an ease-in-out and is
    // near-flat through its first third, so the clay did not visibly start
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
          'before:bg-linear-to-t before:from-clay-deep before:to-clay',
          'hover:text-ink hover:shadow-[0_2px_4px_rgb(58_43_22/0.06),0_20px_44px_-16px_rgb(196_154_82/0.6)]',
        ],
        /** Hairline pill on paper — the quiet, everywhere action. */
        outline: [
          'border border-hair bg-card/70 text-ink shadow-soft',
          'before:bg-linear-to-t before:from-clay-wash before:to-card',
          'hover:border-clay/55 hover:shadow-float',
        ],
        /** Clay-edged pill, kept for the single reservation call. */
        gilt: [
          'border border-clay/50 bg-card/75 text-clay-deep shadow-soft',
          'before:bg-linear-to-t before:from-clay before:to-clay-lit',
          'hover:border-clay hover:text-ink hover:shadow-glow',
        ],
        ghost: ['text-ink-soft before:bg-clay-wash/70 hover:text-ink'],
      },
      size: {
        // 44px, not 40: the one place this size is used is the nav Reserve
        // pill, which appears from 640px up — landscape phones and tablets,
        // both finger-driven — beside a hamburger that is already size-11.
        sm: 'h-11 px-5 text-label',
        md: 'h-12 px-7 text-micro',
        lg: 'h-14 px-9 text-label',
        xl: 'h-16 px-11 text-label',
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
