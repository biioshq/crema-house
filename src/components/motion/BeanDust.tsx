'use client';

import { useMemo, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useIsoLayoutEffect } from '@/hooks/useIsoLayoutEffect';
import { useMotionOK } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

/**
 * Roasted beans drifting through the page, in plain DOM.
 *
 * The hero pays for a WebGL context because it needs real depth; everywhere
 * else that would be an absurd cost for a dozen specks. These are transform-
 * only tweens on a handful of absolutely positioned elements — cheap enough
 * to leave running, and they inherit the section's own background.
 */

type BeanDustProps = {
  count?: number;
  className?: string;
  /** Overall visibility; each speck varies around it. */
  opacity?: number;
  seed?: number;
};

type Speck = {
  left: number;
  top: number;
  size: number;
  rotate: number;
  opacity: number;
  driftX: number;
  driftY: number;
  duration: number;
  delay: number;
  spin: number;
};

function makeSpecks(count: number, seed: number): Speck[] {
  // Deterministic: identical on server and client, identical across remounts.
  let state = seed;
  const random = () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };

  return Array.from({ length: count }, () => {
    const size = 5 + random() * 9;
    return {
      left: random() * 100,
      top: random() * 100,
      size,
      rotate: random() * 180,
      // Smaller specks read as further away, so they sit fainter.
      opacity: 0.26 + (size / 14) * 0.6,
      driftX: (random() - 0.5) * 90,
      driftY: -30 - random() * 90,
      duration: 22 + random() * 26,
      delay: -random() * 30,
      spin: (random() - 0.5) * 120,
    };
  });
}

export function BeanDust({ count = 12, className, opacity = 0.5, seed = 0x51ce }: BeanDustProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const motionOK = useMotionOK();
  const specks = useMemo(() => makeSpecks(count, seed), [count, seed]);

  useIsoLayoutEffect(() => {
    if (!motionOK) return;
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const nodes = gsap.utils.toArray<HTMLElement>('.bean-speck');

      nodes.forEach((node, index) => {
        const speck = specks[index];
        if (!speck) return;

        gsap.to(node, {
          x: speck.driftX,
          y: speck.driftY,
          rotate: speck.rotate + speck.spin,
          duration: speck.duration,
          delay: speck.delay,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        });
      });
    }, rootRef);

    return () => ctx.revert();
  }, [specks, motionOK]);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      style={{ opacity }}
    >
      {specks.map((speck, index) => (
        <span
          key={index}
          className="bean-speck absolute block will-change-transform"
          style={{
            left: `${speck.left}%`,
            top: `${speck.top}%`,
            width: speck.size,
            height: speck.size * 0.72,
            opacity: speck.opacity,
            rotate: `${speck.rotate}deg`,
            borderRadius: '50%',
            // A bean, not a dot: warm rim, dark body, and the centre crease.
            background:
              'radial-gradient(60% 70% at 35% 30%, rgb(120 82 44 / 0.9), rgb(28 17 10 / 0.95) 70%)',
            boxShadow: 'inset 0 0 0 0.5px rgb(231 178 105 / 0.16)',
          }}
        >
          <span
            className="absolute top-1/2 left-[18%] block h-px w-[64%] -translate-y-1/2 rounded-full"
            style={{ background: 'rgb(10 7 5 / 0.85)' }}
          />
        </span>
      ))}
    </div>
  );
}
