'use client';

import { useRef, type ReactNode } from 'react';
import { gsap } from '@/lib/gsap';
import { subscribePointer } from '@/lib/pointer';
import { useIsoLayoutEffect } from '@/hooks/useIsoLayoutEffect';
import { useHasFinePointer, useMotionOK } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

type MagneticProps = {
  children: ReactNode;
  className?: string;
  /** How far the element travels, as a fraction of pointer distance. */
  strength?: number;
  /** Extra pixels around the element that still count as "near". */
  padding?: number;
  /** The label drifts further than the shell for a touch of depth. */
  innerStrength?: number;
};

/**
 * Magnetic attraction.
 *
 * The wrapper tracks the pointer while it is inside an expanded hit area and
 * settles home on exit. Translation is applied to a wrapper and its child at
 * different rates, which reads as the label floating slightly above the pill.
 *
 * There is no listener of its own: it subscribes to the site-wide pointer
 * store, which batches every consumer's rect read into a single layout flush
 * per frame. The rect is read in the store's measure phase and reused for the
 * write, so eight magnetic buttons cost exactly what one costs.
 */
export function Magnetic({
  children,
  className,
  strength = 0.32,
  padding = 40,
  innerStrength = 0.16,
}: MagneticProps) {
  const shellRef = useRef<HTMLSpanElement>(null);
  const innerRef = useRef<HTMLSpanElement>(null);

  const finePointer = useHasFinePointer();
  const motionOK = useMotionOK();
  const enabled = finePointer && motionOK;

  useIsoLayoutEffect(() => {
    if (!enabled) return;

    const shell = shellRef.current;
    const inner = innerRef.current;
    if (!shell || !inner) return;

    // Short enough that the pill feels connected to the cursor rather than
    // dragged behind it — the old 0.7s/0.9s pair read as latency.
    const shellX = gsap.quickTo(shell, 'x', { duration: 0.4, ease: 'power3.out' });
    const shellY = gsap.quickTo(shell, 'y', { duration: 0.4, ease: 'power3.out' });
    const innerX = gsap.quickTo(inner, 'x', { duration: 0.55, ease: 'power3.out' });
    const innerY = gsap.quickTo(inner, 'y', { duration: 0.55, ease: 'power3.out' });

    let rect: DOMRect | null = null;
    let inside = false;

    const release = () => {
      if (!inside) return;
      inside = false;
      gsap.to([shell, inner], {
        x: 0,
        y: 0,
        duration: 0.55,
        ease: 'power3.out',
        overwrite: true,
      });
      // The layer is only worth promoting while something is moving.
      gsap.set([shell, inner], { willChange: 'auto', delay: 0.55 });
    };

    return subscribePointer({
      measure: () => {
        rect = shell.getBoundingClientRect();
      },
      apply: (x, y) => {
        if (!rect) return;

        const near =
          x > rect.left - padding &&
          x < rect.right + padding &&
          y > rect.top - padding &&
          y < rect.bottom + padding;

        if (near) {
          if (!inside) {
            inside = true;
            gsap.set([shell, inner], { willChange: 'transform' });
          }
          const dx = x - (rect.left + rect.width / 2);
          const dy = y - (rect.top + rect.height / 2);
          shellX(dx * strength);
          shellY(dy * strength);
          innerX(dx * innerStrength);
          innerY(dy * innerStrength);
        } else {
          release();
        }
      },
      reset: release,
    });
  }, [enabled, strength, padding, innerStrength]);

  return (
    <span ref={shellRef} className={cn('inline-block', className)}>
      <span ref={innerRef} className="block h-full w-full">
        {children}
      </span>
    </span>
  );
}
