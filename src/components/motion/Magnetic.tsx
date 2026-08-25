'use client';

import { useRef, type ReactNode } from 'react';
import { gsap } from '@/lib/gsap';
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
 * springs home on exit. Translation is applied to a wrapper and its child at
 * different rates, which reads as the label floating slightly above the pill.
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

    const shellX = gsap.quickTo(shell, 'x', { duration: 0.7, ease: 'power3.out' });
    const shellY = gsap.quickTo(shell, 'y', { duration: 0.7, ease: 'power3.out' });
    const innerX = gsap.quickTo(inner, 'x', { duration: 0.9, ease: 'power3.out' });
    const innerY = gsap.quickTo(inner, 'y', { duration: 0.9, ease: 'power3.out' });

    let inside = false;

    const onMove = (event: PointerEvent) => {
      const rect = shell.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const near =
        event.clientX > rect.left - padding &&
        event.clientX < rect.right + padding &&
        event.clientY > rect.top - padding &&
        event.clientY < rect.bottom + padding;

      if (near) {
        inside = true;
        const dx = event.clientX - cx;
        const dy = event.clientY - cy;
        shellX(dx * strength);
        shellY(dy * strength);
        innerX(dx * innerStrength);
        innerY(dy * innerStrength);
      } else if (inside) {
        inside = false;
        // Elastic release — the only overshoot in the whole site.
        gsap.to([shell, inner], {
          x: 0,
          y: 0,
          duration: 1.1,
          ease: 'elastic.out(1, 0.4)',
          overwrite: true,
        });
      }
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [enabled, strength, padding, innerStrength]);

  return (
    <span ref={shellRef} className={cn('inline-block will-change-transform', className)}>
      <span ref={innerRef} className="block h-full w-full will-change-transform">
        {children}
      </span>
    </span>
  );
}
