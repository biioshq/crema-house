'use client';

import { useRef } from 'react';
import { ArrowUpRight, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Magnetic } from '@/components/motion/Magnetic';
import { SplitHeading } from '@/components/motion/SplitHeading';
import { Motes } from '@/components/motion/Motes';
import { gsap, useGsap } from '@/hooks/useGsap';
import { useIsoLayoutEffect } from '@/hooks/useIsoLayoutEffect';
import { useHasFinePointer, useMotionOK } from '@/hooks/useMediaQuery';
import { CONTACT, HOURS } from '@/lib/site';

/**
 * SECTION 06 — "Reservations"
 *
 * The quietest panel on the site and the brightest: a single sheet of white
 * laid on the paper, framed by four gold hairlines that draw themselves in as
 * you arrive. Dust hangs in the light above it, and a soft warm spot follows
 * the pointer across the sheet — the room lights up where you are looking.
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

    const moveX = gsap.quickTo(spot, 'x', { duration: 1, ease: 'power3.out' });
    const moveY = gsap.quickTo(spot, 'y', { duration: 1, ease: 'power3.out' });

    // Cached on entry rather than re-read on every move: the panel does not
    // move while the pointer is inside it, and a rect read per pointermove is
    // a forced layout per pointermove.
    let rect: DOMRect | null = null;

    const onMove = (event: PointerEvent) => {
      if (!rect) rect = root.getBoundingClientRect();
      moveX(event.clientX - rect.left);
      moveY(event.clientY - rect.top);
    };

    const onEnter = () => {
      rect = root.getBoundingClientRect();
      gsap.to(spot, { opacity: 1, duration: 1, ease: 'power2.out' });
    };
    const onLeave = () => gsap.to(spot, { opacity: 0, duration: 1.2, ease: 'power2.out' });

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

      // /reserve supplies its own masthead, so the eyebrow and the heading are
      // simply not in the tree there. Adding the tween regardless is not
      // harmless: GSAP warns for every missing target, and a tween with no
      // target still occupies its slot on the timeline.
      if (showHeader) {
        tl.fromTo(
          '.reserve-eyebrow',
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.9 },
          0.5
        );
      }

      // The frame draws itself: verticals first, then horizontals.
      tl.fromTo(
        ['.reserve-edge-l', '.reserve-edge-r'],
        { scaleY: 0 },
        { scaleY: 1, duration: 1.5, ease: 'power3.inOut', stagger: 0.08 },
        0
      )
        .fromTo(
          ['.reserve-edge-t', '.reserve-edge-b'],
          { scaleX: 0 },
          { scaleX: 1, duration: 1.5, ease: 'power3.inOut', stagger: 0.08 },
          0.25
        )
        .fromTo(
          '.reserve-sub',
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: 1.1 },
          showHeader ? 1.0 : 0.6
        )
        .fromTo(
          '.reserve-action',
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 1.1, stagger: 0.1 },
          1.15
        )
        .fromTo('.reserve-hours', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1 }, 1.3);
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
      className="relative isolate overflow-hidden pb-section"
    >
      <Motes count={10} opacity={0.55} seed={0xe11b} className="z-0" />

      {/* Pointer spotlight */}
      <div
        ref={spotRef}
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 z-0 -mt-88 -ml-88 size-176 opacity-0 will-change-transform"
        style={{
          background:
            'radial-gradient(circle, rgb(252 249 243 / 0.7) 0%, rgb(241 231 213 / 0.42) 34%, transparent 68%)',
        }}
      />

      {/* Standing warmth from below, so the panel is never flatly lit. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[60%]"
        style={{
          background:
            'radial-gradient(70% 100% at 50% 100%, rgb(241 231 213 / 0.8) 0%, transparent 74%)',
        }}
      />

      <div className="shell relative z-10">
        <div className="card-surface relative rounded-xl px-[6%] py-[clamp(4rem,10vw,8rem)] text-center">
          {/* Drawn frame, inset from the sheet's own edge. */}
          <span
            aria-hidden
            className="reserve-edge-t absolute inset-x-8 top-8 h-px origin-left bg-linear-to-r from-transparent via-gold/55 to-transparent"
          />
          <span
            aria-hidden
            className="reserve-edge-b absolute inset-x-8 bottom-8 h-px origin-right bg-linear-to-r from-transparent via-gold/55 to-transparent"
          />
          <span
            aria-hidden
            className="reserve-edge-l absolute inset-y-8 left-8 w-px origin-top bg-linear-to-b from-transparent via-gold/45 to-transparent"
          />
          <span
            aria-hidden
            className="reserve-edge-r absolute inset-y-8 right-8 w-px origin-bottom bg-linear-to-b from-transparent via-gold/45 to-transparent"
          />

          {showHeader && (
            <>
              <p className="reserve-eyebrow eyebrow reveal">06 — Reservations</p>

              <SplitHeading
                as="h2"
                id="reserve-heading"
                mode="chars-blur"
                start="top 76%"
                className="mx-auto mt-9 max-w-[12em] text-h2"
              >
                Come and sit for a while.
              </SplitHeading>
            </>
          )}

          <p className="reserve-sub reveal mx-auto mt-10 max-w-[46ch] text-balance font-sans text-lede text-ink-soft/80">
            Two tables are held back every evening for people who did not plan
            ahead. The rest, we would love you to book.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
            <span className="reserve-action reveal">
              <Magnetic strength={0.32} padding={44}>
                <Button asChild size="xl" variant="gilt">
                  <a href={`mailto:${CONTACT.email}?subject=Table%20reservation`}>
                    Reserve a table
                    <ArrowUpRight className="size-4" strokeWidth={1.5} />
                  </a>
                </Button>
              </Magnetic>
            </span>

            <span className="reserve-action reveal">
              <Magnetic strength={0.26} padding={34}>
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
          <dl className="reserve-hours reveal mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-3">
            {HOURS.map((entry) => (
              <div key={entry.days} className="text-center">
                <dt className="font-sans text-micro text-mute uppercase">{entry.days}</dt>
                <dd className="mt-2 font-sans text-label tracking-wide-sm text-ink tabular-nums">
                  {entry.time}
                </dd>
              </div>
            ))}
          </dl>

          <p className="reserve-hours reveal mt-12 font-sans text-micro text-faint uppercase">
            {CONTACT.addressLines.join(' · ')}
          </p>
        </div>
      </div>
    </section>
  );
}
