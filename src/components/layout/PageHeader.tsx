'use client';

import { useRef, type ReactNode } from 'react';
import { SplitHeading, type SplitMode } from '@/components/motion/SplitHeading';
import { BeanDust } from '@/components/motion/BeanDust';
import { gsap, useGsap } from '@/hooks/useGsap';
import { useMotionOK } from '@/hooks/useMediaQuery';

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  lede?: ReactNode;
  /** Big faint numeral sunk into the background, matching the home sections. */
  numeral?: string;
  mode?: SplitMode;
  id?: string;
};

/**
 * The masthead every sub-page opens with.
 *
 * Sub-pages have no hero video to fall into, so the header does that work
 * instead: a tall band of near-black with a single warm pool of light, the
 * page numeral sunk into it, and the title arriving on the page's own
 * reveal mode. Triggers fire immediately here rather than on scroll —
 * this content is above the fold by definition.
 */
export function PageHeader({
  eyebrow,
  title,
  lede,
  numeral,
  mode = 'lines-rise',
  id = 'page-heading',
}: PageHeaderProps) {
  const rootRef = useRef<HTMLElement>(null);
  const motionOK = useMotionOK();

  useGsap(
    () => {
      if (!motionOK) return;

      gsap
        .timeline({ delay: 0.15 })
        .fromTo('.page-eyebrow', { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.9 }, 0)
        .fromTo('.page-lede', { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 1.1 }, 0.55)
        .fromTo(
          '.page-rule',
          { scaleX: 0 },
          { scaleX: 1, duration: 1.4, ease: 'power3.inOut' },
          0.4
        );

      if (numeral) {
        // Drift only — no opacity ramp. The header sits at scroll 0, so a
        // scrubbed fade-in would leave the numeral invisible exactly where
        // it is meant to be read.
        gsap.fromTo(
          '.page-numeral',
          { yPercent: 8 },
          {
            yPercent: -14,
            ease: 'none',
            scrollTrigger: {
              trigger: rootRef.current,
              start: 'top top',
              end: 'bottom top',
              scrub: 1.4,
            },
          }
        );
      }
    },
    [motionOK, numeral],
    rootRef
  );

  return (
    <header
      ref={rootRef}
      className="relative isolate overflow-hidden pt-[calc(4.5rem+var(--spacing-section))] pb-section lg:pt-[calc(5rem+var(--spacing-section))]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(58% 62% at 50% 18%, rgb(192 138 62 / 0.16) 0%, rgb(120 80 34 / 0.06) 46%, transparent 76%)',
        }}
      />
      <BeanDust count={9} opacity={0.3} seed={0x7a11} className="-z-10" />

      {numeral && (
        <span
          aria-hidden
          className="page-numeral display-face pointer-events-none absolute -top-6 right-[-3vw] -z-10 text-[26vw] leading-none text-porcelain/[0.05] select-none lg:right-[2vw] lg:text-[15vw]"
        >
          {numeral}
        </span>
      )}

      <div className="shell">
        <p className="page-eyebrow eyebrow opacity-0">{eyebrow}</p>

        <SplitHeading
          as="h1"
          id={id}
          mode={mode}
          start="top 98%"
          className="mt-7 max-w-[14em] text-h1"
        >
          {title}
        </SplitHeading>

        {lede && (
          <p className="page-lede mt-9 max-w-[54ch] font-sans text-lede text-crema/75 opacity-0">
            {lede}
          </p>
        )}

        <div className="page-rule mt-14 h-px w-full origin-left bg-linear-to-r from-clay via-clay/50 to-transparent" />
      </div>
    </header>
  );
}
