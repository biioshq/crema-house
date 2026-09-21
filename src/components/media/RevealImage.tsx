'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useIsoLayoutEffect } from '@/hooks/useIsoLayoutEffect';
import { useMotionOK } from '@/hooks/useMediaQuery';
import type { MediaAsset } from '@/lib/media';
import { cn } from '@/lib/utils';

/** The direction the revealing edge travels. */
export type RevealDirection = 'up' | 'down' | 'left' | 'right';

const FROM: Record<RevealDirection, string> = {
  up: 'inset(100% 0% 0% 0%)',
  down: 'inset(0% 0% 100% 0%)',
  right: 'inset(0% 100% 0% 0%)',
  left: 'inset(0% 0% 0% 100%)',
};

type RevealImageProps = {
  asset: MediaAsset;
  alt: string;
  direction?: RevealDirection;
  className?: string;
  imageClassName?: string;
  sizes: string;
  priority?: boolean;
  objectPosition?: string;
  /** Draw a line of light along the revealing edge. */
  edge?: boolean;
  /** Pixels of scrub-linked vertical drift once revealed. */
  parallax?: number;
  /** The image counter-moves against the mask, so it settles rather than slides. */
  scaleFrom?: number;
  start?: string;
  delay?: number;
};

/**
 * An image that arrives behind a travelling mask.
 *
 * The frame unmasks while the photograph inside scales down against it — the
 * two opposing moves are what make the reveal feel like a camera settling
 * instead of a panel sliding.
 */
export function RevealImage({
  asset,
  alt,
  direction = 'up',
  className,
  imageClassName,
  sizes,
  priority = false,
  objectPosition = '50% 50%',
  edge = false,
  parallax = 0,
  scaleFrom = 1.22,
  start = 'top 85%',
  delay = 0,
}: RevealImageProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const edgeRef = useRef<HTMLSpanElement>(null);
  const motionOK = useMotionOK();

  useIsoLayoutEffect(() => {
    const frame = frameRef.current;
    const inner = innerRef.current;
    if (!frame || !inner || !motionOK) return;

    const ctx = gsap.context(() => {
      gsap.set(frame, { clipPath: FROM[direction] });
      gsap.set(inner, { scale: scaleFrom });

      const tl = gsap.timeline({ paused: true, delay });

      tl.to(frame, {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 1.5,
        ease: 'power4.inOut',
      }).to(inner, { scale: 1, duration: 1.9, ease: 'power3.out' }, 0);

      if (edgeRef.current) {
        const horizontal = direction === 'left' || direction === 'right';
        const fromValue = direction === 'up' || direction === 'left' ? 100 : -100;
        tl.fromTo(
          edgeRef.current,
          { [horizontal ? 'xPercent' : 'yPercent']: fromValue, opacity: 0 },
          {
            [horizontal ? 'xPercent' : 'yPercent']: 0,
            opacity: 1,
            duration: 1.5,
            ease: 'power4.inOut',
          },
          0
        ).to(edgeRef.current, { opacity: 0, duration: 0.5 }, 1.25);
      }

      ScrollTrigger.create({
        trigger: frame,
        start,
        once: true,
        onEnter: () => tl.play(),
      });

      if (parallax !== 0) {
        gsap.fromTo(
          inner,
          { yPercent: -parallax / 2 },
          {
            yPercent: parallax / 2,
            ease: 'none',
            scrollTrigger: {
              trigger: frame,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1,
            },
          }
        );
      }
    }, frameRef);

    return () => ctx.revert();
  }, [direction, scaleFrom, parallax, start, delay, motionOK]);

  return (
    <div
      ref={frameRef}
      className={cn('relative isolate overflow-hidden', className)}
      style={{ clipPath: 'inset(0% 0% 0% 0%)' }}
    >
      {/* Scaled larger than the frame so the parallax drift never exposes an edge. */}
      {/* Promoted only where something actually keeps moving: the reveal plays
          once and stops, so a permanent layer per photograph bought nothing
          but GPU memory. */}
      <div
        ref={innerRef}
        className={cn('absolute inset-[-6%]', parallax !== 0 && 'will-change-transform')}
      >
        <Image
          src={asset.src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          placeholder="blur"
          blurDataURL={asset.blurDataURL}
          className={cn('object-cover', imageClassName)}
          style={{ objectPosition }}
        />
      </div>

      {edge && (
        <span
          ref={edgeRef}
          aria-hidden
          className={cn(
            'pointer-events-none absolute opacity-0',
            direction === 'left' || direction === 'right'
              ? 'inset-y-0 left-0 w-px'
              : 'inset-x-0 top-0 h-px'
          )}
          style={{
            background:
              direction === 'left' || direction === 'right'
                ? 'linear-gradient(180deg, transparent, rgb(224 147 122 / 0.95), transparent)'
                : 'linear-gradient(90deg, transparent, rgb(224 147 122 / 0.95), transparent)',
            boxShadow: '0 0 22px 2px rgb(224 147 122 / 0.55)',
          }}
        />
      )}
    </div>
  );
}
