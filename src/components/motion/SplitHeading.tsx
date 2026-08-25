'use client';

import { createElement, useRef, type ElementType, type ReactNode } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useIsoLayoutEffect } from '@/hooks/useIsoLayoutEffect';
import { useMotionOK } from '@/hooks/useMediaQuery';
import { splitText, type SplitResult } from '@/lib/split';
import { cn } from '@/lib/utils';

/**
 * Scroll-triggered text reveal.
 *
 * Each section picks a different `mode`, which is how the site keeps its
 * promise that no two reveals repeat. The heavy lifting is shared: wait for
 * fonts (line breaks depend on them), split, play once, then **revert the
 * split entirely** — so once the reveal is done the DOM is plain text again,
 * with no orphaned spans, no lingering `will-change`, and nothing to break
 * when the viewport is resized.
 */
export type SplitMode =
  /** Letters resolve out of blur. */
  | 'chars-blur'
  /** Words hinge up from their baseline in 3D. */
  | 'words-flip'
  /** Whole lines rise out of a mask. */
  | 'lines-rise'
  /** Letters converge from scattered offsets. */
  | 'chars-scatter'
  /** Each line unveils left to right behind a moving edge. */
  | 'mask-wipe';

type SplitHeadingProps = {
  as?: ElementType;
  id?: string;
  mode: SplitMode;
  children: ReactNode;
  className?: string;
  /** ScrollTrigger start position. */
  start?: string;
  delay?: number;
  /** Overrides the per-mode default. */
  stagger?: number;
};

export function SplitHeading({
  as = 'h2',
  id,
  mode,
  children,
  className,
  start = 'top 82%',
  delay = 0,
  stagger,
}: SplitHeadingProps) {
  const ref = useRef<HTMLElement>(null);
  const motionOK = useMotionOK();

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!motionOK) {
      gsap.set(el, { opacity: 1 });
      return;
    }

    // Hide before first paint; JS-off users are unaffected because this only
    // ever runs on the client.
    gsap.set(el, { opacity: 0 });

    let split: SplitResult | null = null;
    let trigger: ScrollTrigger | null = null;
    let cancelled = false;

    const build = () => {
      if (cancelled || !el) return;

      split?.revert();
      split = splitText(el, {
        chars: mode.startsWith('chars'),
        // Words hinging in 3D overflow their line box in both directions;
        // an overflow-hidden line mask would shear them off.
        lines: mode !== 'words-flip',
      });

      const { chars, words, lines, lineInners } = split;
      const tl = gsap.timeline({ paused: true, delay });

      switch (mode) {
        case 'chars-blur': {
          gsap.set(lineInners, { yPercent: 110 });
          gsap.set(chars, { filter: 'blur(14px)', opacity: 0.15 });
          tl.to(lineInners, {
            yPercent: 0,
            duration: 1.4,
            stagger: stagger ?? 0.11,
            ease: 'expo.out',
          }).to(
            chars,
            { filter: 'blur(0px)', opacity: 1, duration: 1.2, stagger: 0.012, ease: 'power2.out' },
            0.15
          );
          break;
        }

        case 'words-flip': {
          // The hinge sits on the baseline and slightly behind the glyph, so
          // words swing up into place rather than spinning in the air. The
          // perspective lives on the element itself because this mode runs
          // without line wrappers.
          gsap.set(el, { perspective: 900 });
          gsap.set(words, {
            transformOrigin: '50% 100% -0.35em',
            rotateX: -92,
            opacity: 0,
            y: '0.14em',
          });
          tl.to(words, {
            rotateX: 0,
            opacity: 1,
            y: 0,
            duration: 1.25,
            stagger: stagger ?? 0.055,
            ease: 'power4.out',
          });
          break;
        }

        case 'lines-rise': {
          gsap.set(lineInners, { yPercent: 115, opacity: 0 });
          tl.to(lineInners, {
            yPercent: 0,
            opacity: 1,
            duration: 1.35,
            stagger: stagger ?? 0.1,
            ease: 'expo.out',
          });
          break;
        }

        case 'chars-scatter': {
          gsap.set(chars, {
            opacity: 0,
            // Deterministic scatter — index-derived, never Math.random, so a
            // remount looks identical.
            x: (i: number) => (i % 2 ? 1 : -1) * (12 + (i % 7) * 6),
            y: (i: number) => (i % 3 ? -1 : 1) * (18 + (i % 5) * 9),
            rotate: (i: number) => (i % 2 ? 1 : -1) * (6 + (i % 4) * 3),
          });
          tl.to(chars, {
            opacity: 1,
            x: 0,
            y: 0,
            rotate: 0,
            duration: 1.15,
            stagger: stagger ?? 0.018,
            ease: 'power3.out',
          });
          break;
        }

        case 'mask-wipe': {
          gsap.set(lines, { clipPath: 'inset(0% 100% 0% 0%)' });
          tl.to(lines, {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.15,
            stagger: stagger ?? 0.13,
            ease: 'power3.inOut',
          });
          break;
        }
      }

      gsap.set(el, { opacity: 1 });

      trigger?.kill();
      trigger = ScrollTrigger.create({
        trigger: el,
        start,
        once: true,
        onEnter: () => {
          tl.play();
          // Hand the DOM back clean once the motion is finished.
          tl.eventCallback('onComplete', () => {
            split?.revert();
            split = null;
          });
        },
      });
    };

    // Line breaks are measured, so they are only correct after the webfont
    // has actually swapped in.
    const fonts = document.fonts?.ready ?? Promise.resolve();
    fonts.then(build).catch(build);

    // Re-split on width changes, but only while the reveal is still pending —
    // once it has played the element is plain text and needs nothing.
    let width = 0;
    let frame = 0;
    const observer = new ResizeObserver(([entry]) => {
      const next = Math.round(entry?.contentRect.width ?? 0);
      if (next === width) return;
      width = next;
      if (!split) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(build);
    });
    observer.observe(el);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      trigger?.kill();
      split?.revert();
      gsap.set(el, { clearProps: 'opacity' });
    };
  }, [mode, start, delay, stagger, motionOK]);

  return createElement(as, { ref, id, className: cn(className) }, children);
}
