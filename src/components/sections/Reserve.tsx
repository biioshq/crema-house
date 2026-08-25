'use client';

import { useRef } from 'react';
import { ArrowUpRight, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Magnetic } from '@/components/motion/Magnetic';
import { SplitHeading } from '@/components/motion/SplitHeading';
import { EmberField } from '@/components/motion/EmberField';
import { gsap, useGsap } from '@/hooks/useGsap';
import { useIsoLayoutEffect } from '@/hooks/useIsoLayoutEffect';
import { useHasFinePointer, useMotionOK } from '@/hooks/useMediaQuery';
import { CONTACT, HOURS } from '@/lib/site';

/**
 * SECTION 07 — "Reservations"
 *
 * The darkest panel on the page, lit from two sources: embers rising through
 * it, and a spotlight that follows the pointer. The spotlight is the
 * section's signature — the room literally lights up where you are looking,
 * and the gold frame around the panel draws itself in as you arrive.
 */
type ReserveProps = {
  /** The /reserve page supplies its own masthead. */
  showHeader?: boolean;
};

export function Reserve({ showHeader = true }: ReserveProps) {
  const rootRef = useRef<HTMLElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);

  const motionOK = useMotionOK();
  const finePointer = useHasFinePointer();

  // --- Pointer spotlight --------------------------------------------------
  useIsoLayoutEffect(() => {
    if (!motionOK || !finePointer) return;

    const root = rootRef.current;
    const spot = spotRef.current;
    if (!root || !spot) return;

    const moveX = gsap.quickTo(spot, 'x', { duration: 0.9, ease: 'power3.out' });
    const moveY = gsap.quickTo(spot, 'y', { duration: 0.9, ease: 'power3.out' });

    const onMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      moveX(event.clientX - rect.left);
      moveY(event.clientY - rect.top);
    };

    const onEnter = () => gsap.to(spot, { opacity: 1, duration: 0.9, ease: 'power2.out' });
    const onLeave = () => gsap.to(spot, { opacity: 0, duration: 1.1, ease: 'power2.out' });

    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerenter', onEnter);
    root.addEventListener('pointerleave', onLeave);

    return () => {
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerenter', onEnter);
      root.removeEventListener('pointerleave', onLeave);
    };
  }, [motionOK, finePointer]);

  // --- Frame + copy -------------------------------------------------------
  useGsap(
    () => {
      if (!motionOK) return;

      const tl = gsap.timeline({
        scrollTrigger: { trigger: rootRef.current, start: 'top 70%', once: true },
      });

      // The frame draws itself: verticals first, then horizontals.
      tl.fromTo(
        ['.reserve-edge-l', '.reserve-edge-r'],
        { scaleY: 0 },
        { scaleY: 1, duration: 1.4, ease: 'power3.inOut', stagger: 0.08 },
        0
      )
        .fromTo(
          ['.reserve-edge-t', '.reserve-edge-b'],
          { scaleX: 0 },
          { scaleX: 1, duration: 1.4, ease: 'power3.inOut', stagger: 0.08 },
          0.25
        )
        .fromTo('.reserve-eyebrow', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.9 }, 0.5)
        .fromTo('.reserve-sub', { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 1.1 }, showHeader ? 1.0 : 0.6)
        .fromTo(
          '.reserve-action',
          { opacity: 0, y: 26 },
          { opacity: 1, y: 0, duration: 1.1, stagger: 0.1 },
          1.15
        )
        .fromTo('.reserve-hours', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1 }, 1.3);
    },
    [motionOK, showHeader],
    rootRef
  );

  return (
    <section
      ref={rootRef}
      id="reserve"
      aria-labelledby={showHeader ? 'reserve-heading' : undefined}
      aria-label={showHeader ? undefined : 'Book a table'}
      className="relative isolate overflow-hidden bg-espresso pb-section"
    >
      {/* Embers */}
      <EmberField className="z-0 opacity-80" />

      {/* Pointer spotlight */}
      <div
        ref={spotRef}
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 z-0 size-[46rem] -translate-x-1/2 -translate-y-1/2 opacity-0 will-change-transform"
        style={{
          background:
            'radial-gradient(circle, rgb(192 138 62 / 0.24) 0%, rgb(120 80 34 / 0.10) 38%, transparent 68%)',
        }}
      />

      {/* Standing warmth from below, so the panel is never flat black. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[55%]"
        style={{
          background:
            'radial-gradient(70% 100% at 50% 100%, rgb(120 80 34 / 0.16) 0%, transparent 72%)',
        }}
      />

      <div className="shell relative z-10">
        <div className="relative px-[6%] py-[clamp(3.5rem,9vw,7rem)] text-center">
          {/* Drawn frame */}
          <span
            aria-hidden
            className="reserve-edge-t absolute inset-x-0 top-0 h-px origin-left bg-linear-to-r from-transparent via-gold/45 to-transparent"
          />
          <span
            aria-hidden
            className="reserve-edge-b absolute inset-x-0 bottom-0 h-px origin-right bg-linear-to-r from-transparent via-gold/45 to-transparent"
          />
          <span
            aria-hidden
            className="reserve-edge-l absolute inset-y-0 left-0 w-px origin-top bg-linear-to-b from-transparent via-gold/35 to-transparent"
          />
          <span
            aria-hidden
            className="reserve-edge-r absolute inset-y-0 right-0 w-px origin-bottom bg-linear-to-b from-transparent via-gold/35 to-transparent"
          />

          {showHeader && (
            <>
              <p className="reserve-eyebrow eyebrow opacity-0">07 — Reservations</p>

              <SplitHeading
                as="h2"
                id="reserve-heading"
                mode="chars-blur"
                start="top 76%"
                className="mx-auto mt-8 max-w-[13em] text-display"
              >
                Come and sit for a while.
              </SplitHeading>
            </>
          )}

          <p className="reserve-sub mx-auto max-w-[46ch] text-balance font-sans text-lede text-crema/75 opacity-0">
            Two tables are held back every evening for people who did not plan
            ahead. The rest, we would love you to book.
          </p>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
            <span className="reserve-action opacity-0">
              <Magnetic strength={0.34} padding={44}>
                <Button
                  asChild
                  size="xl"
                  variant="gilt"
                  data-cursor-label="Book"
                  className="shadow-[0_0_60px_-12px_rgb(231_178_105/0.45)]"
                >
                  <a href={`mailto:${CONTACT.email}?subject=Table%20reservation`}>
                    Reserve a table
                    <ArrowUpRight className="size-4" strokeWidth={1.5} />
                  </a>
                </Button>
              </Magnetic>
            </span>

            <span className="reserve-action opacity-0">
              <Magnetic strength={0.28} padding={34}>
                <Button asChild size="xl" variant="outline">
                  <a href={CONTACT.phoneHref}>
                    <Phone className="size-3.5" strokeWidth={1.5} />
                    {CONTACT.phone}
                  </a>
                </Button>
              </Magnetic>
            </span>
          </div>

          {/* Hours */}
          <dl className="reserve-hours mx-auto mt-16 grid max-w-3xl grid-cols-1 gap-x-10 gap-y-5 opacity-0 sm:grid-cols-3">
            {HOURS.map((entry) => (
              <div key={entry.days} className="text-center">
                <dt className="font-sans text-micro text-ash uppercase">{entry.days}</dt>
                <dd className="mt-2 font-sans text-label tracking-wide-sm text-crema tabular-nums">
                  {entry.time}
                </dd>
              </div>
            ))}
          </dl>

          <p className="reserve-hours mt-10 font-sans text-micro text-ember uppercase opacity-0">
            {CONTACT.addressLines.join(' · ')}
          </p>
        </div>
      </div>
    </section>
  );
}
