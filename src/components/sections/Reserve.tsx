'use client';

import { useRef } from 'react';
import { ArrowUpRight, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Magnetic } from '@/components/motion/Magnetic';
import { Motes } from '@/components/motion/Motes';
import { Blossom } from '@/components/illustrations/Florals';
import { Sprig } from '@/components/illustrations/Foliage';
import { gsap } from '@/hooks/useGsap';
import { useIsoLayoutEffect } from '@/hooks/useIsoLayoutEffect';
import { useHasFinePointer, useMotionOK } from '@/hooks/useMediaQuery';
import { CONTACT, HOURS } from '@/lib/site';

/**
 * "Reservations"
 *
 * The quietest panel on the site and the brightest: a single sheet of white
 * laid on the paper, with a soft warm spot that follows the pointer across it
 * so the room lights up where you are looking. The four clay hairlines that
 * used to frame the sheet are gone; a coffee flower laid over one corner and
 * a sprig at the other do the framing now, which is the only kind of line
 * this page still draws.
 *
 * Every piece of copy reveals through `data-text` and both drawings through
 * `data-ill`, so the only thing this component animates itself is the
 * spotlight.
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
          {/* Laid over the corners of the sheet, mostly outside it, so neither
              drawing can sit on a word however the copy wraps. */}
          <Blossom
            data-ill
            data-ill-delay="0.3"
            className="pointer-events-none absolute -top-6 -left-3 z-10 h-auto w-16 -rotate-12 sm:-top-8 sm:-left-6 sm:w-24 lg:w-28"
          />
          <Sprig
            data-ill
            data-ill-delay="0.6"
            className="pointer-events-none absolute -right-2 -bottom-5 z-10 h-8 w-auto rotate-[8deg] sm:-right-5 sm:-bottom-7 sm:h-11"
          />

          {showHeader && (
            <>
              <p data-text="write" className="eyebrow">
                Reservations
              </p>

              <h2
                id="reserve-heading"
                data-text="scatter"
                data-text-start="top 76%"
                className="mx-auto mt-5 max-w-[12em] text-h2"
              >
                Come and sit for a <em className="accent">while</em>.
              </h2>
            </>
          )}

          <p
            data-text="words"
            className="mx-auto mt-9 max-w-[46ch] text-balance font-sans text-lede text-ink-soft/80"
          >
            Two tables are held back every evening for people who did not plan
            ahead. The rest, we would love you to book.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
            <span data-text="fade">
              <Magnetic strength={0.32} padding={44}>
                <Button asChild size="xl" variant="gilt">
                  <a href={`mailto:${CONTACT.email}?subject=Table%20reservation`}>
                    Reserve a table
                    <ArrowUpRight className="size-4" strokeWidth={1.5} />
                  </a>
                </Button>
              </Magnetic>
            </span>

            <span data-text="fade">
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

          {/* Hours. Each day is its own reveal, so they arrive across the row
              rather than as one block of numbers. */}
          <dl className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-3">
            {HOURS.map((entry) => (
              <div key={entry.days} data-text="fade" className="text-center">
                <dt className="font-sans text-micro text-mute uppercase">{entry.days}</dt>
                <dd className="mt-2 font-sans text-label tracking-wide-sm text-ink tabular-nums">
                  {entry.time}
                </dd>
              </div>
            ))}
          </dl>

          <p data-text="fade" className="mt-12 font-sans text-micro text-faint uppercase">
            {CONTACT.addressLines.join(' · ')}
          </p>
        </div>
      </div>
    </section>
  );
}
