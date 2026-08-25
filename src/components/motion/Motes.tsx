'use client';

import { useMemo, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useIsoLayoutEffect } from '@/hooks/useIsoLayoutEffect';
import { useMotionOK } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

/**
 * Dust in the light.
 *
 * The soft, out-of-focus warmth that hangs in a room with one big window —
 * a dozen blurred motes drifting at a speed you only notice if you stop and
 * look. This is the site's only ambient system: plain DOM, transform-only
 * tweens, no canvas and no render loop of its own, which is cheap enough to
 * leave running and lets every mote inherit the section's own background.
 *
 * The field is deterministic, so it is identical on the server, on the
 * client, and across every remount.
 */

type MotesProps = {
  count?: number;
  className?: string;
  /** Overall visibility; each mote varies around it. */
  opacity?: number;
  seed?: number;
};

type Mote = {
  left: number;
  top: number;
  size: number;
  opacity: number;
  driftX: number;
  driftY: number;
  duration: number;
  delay: number;
  warm: boolean;
};

function makeMotes(count: number, seed: number): Mote[] {
  let state = seed;
  const random = () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };

  return Array.from({ length: count }, () => {
    const size = 14 + random() * 58;
    return {
      left: random() * 100,
      top: random() * 100,
      size,
      // Larger motes read as nearer the lens, so they sit softer and fainter.
      opacity: 0.5 - (size / 72) * 0.28,
      driftX: (random() - 0.5) * 70,
      driftY: -20 - random() * 70,
      duration: 26 + random() * 30,
      delay: -random() * 34,
      warm: random() > 0.45,
    };
  });
}

export function Motes({ count = 9, className, opacity = 0.6, seed = 0x51ce }: MotesProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const motionOK = useMotionOK();
  const motes = useMemo(() => makeMotes(count, seed), [count, seed]);

  useIsoLayoutEffect(() => {
    if (!motionOK) return;
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.mote').forEach((node, index) => {
        const mote = motes[index];
        if (!mote) return;

        gsap.to(node, {
          x: mote.driftX,
          y: mote.driftY,
          duration: mote.duration,
          delay: mote.delay,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        });
      });
    }, rootRef);

    return () => ctx.revert();
  }, [motes, motionOK]);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      style={{ opacity }}
    >
      {motes.map((mote, index) => (
        <span
          key={index}
          className="mote absolute block rounded-full will-change-transform"
          style={{
            left: `${mote.left}%`,
            top: `${mote.top}%`,
            width: mote.size,
            height: mote.size,
            opacity: mote.opacity,
            // A gradient rather than a blur filter: a filter on a dozen
            // elements forces a dozen offscreen passes every frame, and this
            // looks the same.
            background: mote.warm
              ? 'radial-gradient(circle, rgb(221 184 119 / 0.55) 0%, rgb(221 184 119 / 0.16) 46%, transparent 70%)'
              : 'radial-gradient(circle, rgb(255 255 255 / 0.9) 0%, rgb(255 255 255 / 0.3) 44%, transparent 70%)',
          }}
        />
      ))}
    </div>
  );
}
