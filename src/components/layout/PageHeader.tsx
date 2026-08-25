'use client';

import { useRef, type ReactNode } from 'react';
import { SplitHeading, type SplitMode } from '@/components/motion/SplitHeading';
import { Motes } from '@/components/motion/Motes';
import { gsap, useGsap } from '@/hooks/useGsap';
import { useMotionOK } from '@/hooks/useMediaQuery';

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  lede?: ReactNode;
  /** This page's coordinate in the one site-wide sequence: 01 Hero, 02 The
   *  Room, 03 The Menu, 04 The Craft, 05 Voices, 06 Reservations. A sub-page
   *  takes the number of the home section it expands rather than starting a
   *  sequence of its own, so "the menu is 03" is true on both pages. */
  numeral?: string;
  mode?: SplitMode;
  id?: string;
};

/**
 * The masthead every sub-page opens with.
 *
 * Sub-pages have no hero footage to fall into, so the header does that work
 * instead: a tall band of paper lit from above, the page numeral engraved
 * into it, dust hanging in the light, and the title arriving on the page's
 * own reveal mode. Triggers fire immediately here rather than on scroll —
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
        .timeline({ delay: 0.2 })
        .fromTo('.page-eyebrow', { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.9 }, 0)
        .fromTo('.page-lede', { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 1.1 }, 0.6)
        .fromTo(
          '.page-rule',
          { scaleX: 0 },
          { scaleX: 1, duration: 1.5, ease: 'power3.inOut' },
          0.45
        );

      if (numeral) {
        // Drift only — no opacity ramp. The header sits at scroll 0, so a
        // scrubbed fade-in would leave the numeral invisible exactly where it
        // is meant to be read.
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
      className="relative isolate overflow-hidden pt-[calc(5rem+var(--spacing-section))] pb-section lg:pt-[calc(5.5rem+var(--spacing-section))]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(56% 58% at 32% 12%, rgb(252 249 243 / 0.55) 0%, rgb(241 231 213 / 0.42) 48%, transparent 78%)',
        }}
      />
      <Motes count={7} opacity={0.5} seed={0x7a11} className="-z-10" />

      {numeral && (
        <span
          aria-hidden
          className="page-numeral display-face pointer-events-none absolute -top-6 right-[-3vw] -z-10 text-[26vw] leading-none text-ink/5 lining-nums select-none lg:right-[3vw] lg:text-[13vw]"
        >
          {numeral}
        </span>
      )}

      <div className="shell">
        <p className="page-eyebrow eyebrow reveal">{eyebrow}</p>

        <SplitHeading
          as="h1"
          id={id}
          mode={mode}
          start="top 98%"
          className="mt-8 max-w-[13em] text-h1"
        >
          {title}
        </SplitHeading>

        {lede && (
          <p className="page-lede reveal mt-10 max-w-[54ch] font-sans text-lede text-ink-soft/80">
            {lede}
          </p>
        )}

        <div className="page-rule rule-gold mt-10 origin-left" />
      </div>
    </header>
  );
}
