'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { RevealImage } from '@/components/media/RevealImage';
import { SplitHeading } from '@/components/motion/SplitHeading';
import { Counter } from '@/components/motion/Counter';
import { Magnetic } from '@/components/motion/Magnetic';
import { Button } from '@/components/ui/button';
import { gsap, useGsap } from '@/hooks/useGsap';
import { useIsoLayoutEffect } from '@/hooks/useIsoLayoutEffect';
import { useHasFinePointer, useMotionOK } from '@/hooks/useMediaQuery';
import { subscribePointer } from '@/lib/pointer';
import { IMAGES } from '@/lib/media';
import { CONTACT } from '@/lib/site';

const STATS = [
  { value: 11, label: 'Years on the lane' },
  { value: 6, label: 'Origins on the bar' },
  { value: 92, label: 'Mean cupping score' },
] as const;

/**
 * SECTION 02 — "The Room"
 *
 * A spread, not a section. The photograph sits in the outer half of the page
 * with a second frame overlapping its corner, the copy holds a narrow column
 * against acres of paper, and a gold rule draws itself across the gutter as
 * the two halves arrive. The plates float — the shadow is what does the
 * work — and lean fractionally towards the pointer.
 */
export function Story() {
  const rootRef = useRef<HTMLElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);

  const motionOK = useMotionOK();
  const finePointer = useHasFinePointer();

  // --- Pointer tilt -------------------------------------------------------
  useIsoLayoutEffect(() => {
    if (!motionOK || !finePointer) return;

    const root = rootRef.current;
    const tilt = tiltRef.current;
    if (!root || !tilt) return;

    const inset = root.querySelector<HTMLElement>('.story-inset');

    const rotateX = gsap.quickTo(tilt, 'rotationX', { duration: 1.1, ease: 'power3.out' });
    const rotateY = gsap.quickTo(tilt, 'rotationY', { duration: 1.1, ease: 'power3.out' });
    const insetX = inset ? gsap.quickTo(inset, 'x', { duration: 1.3, ease: 'power3.out' }) : null;
    const insetY = inset ? gsap.quickTo(inset, 'y', { duration: 1.3, ease: 'power3.out' }) : null;

    // One rect read per frame, taken in the shared store's read phase — never
    // inside the move event, where it would force a fresh layout each time.
    let rect: DOMRect | null = null;

    return subscribePointer({
      measure: () => {
        rect = tilt.getBoundingClientRect();
      },
      apply: (x, y) => {
        if (!rect) return;
        // A spread that is nowhere near the viewport does not need a transform
        // written to it sixty times a second.
        if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;

        const nx = (x - (rect.left + rect.width / 2)) / (rect.width / 2);
        const ny = (y - (rect.top + rect.height / 2)) / (rect.height / 2);

        // Clamped, so a pointer far outside the frame cannot over-rotate it.
        const cx = Math.max(-1.6, Math.min(1.6, nx));
        const cy = Math.max(-1.6, Math.min(1.6, ny));

        rotateY(cx * 5.5);
        rotateX(-cy * 4);
        // The inset lives closer to the viewer, so it travels further.
        insetX?.(-cx * 22);
        insetY?.(-cy * 16);
      },
      reset: () => {
        gsap.to(tilt, { rotationX: 0, rotationY: 0, duration: 1.3, ease: 'power3.out' });
        if (inset) gsap.to(inset, { x: 0, y: 0, duration: 1.3, ease: 'power3.out' });
      },
    });
  }, [motionOK, finePointer]);

  // --- Scroll choreography ------------------------------------------------
  useGsap(
    () => {
      if (!motionOK) return;

      // The columns travel at different rates — the plates lag, the copy leads.
      gsap.fromTo(
        '.story-media',
        { yPercent: 4 },
        {
          yPercent: -4,
          ease: 'none',
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        }
      );

      gsap.fromTo(
        '.story-numeral',
        { yPercent: 14, opacity: 0 },
        {
          yPercent: -14,
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.4,
          },
        }
      );

      // Copy, rule and stats arrive as one sequence.
      gsap
        .timeline({
          scrollTrigger: { trigger: '.story-copy', start: 'top 78%', once: true },
        })
        .fromTo('.story-eyebrow', { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.9 }, 0)
        .fromTo('.story-body', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1.1 }, 0.55)
        .fromTo(
          '.story-rule',
          { scaleX: 0 },
          { scaleX: 1, duration: 1.5, ease: 'power3.inOut' },
          0.7
        )
        .fromTo(
          '.story-stat',
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 1, stagger: 0.13 },
          0.85
        )
        .fromTo('.story-caption', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1 }, 0.4)
        .fromTo('.story-cta', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1 }, 1.05);
    },
    [motionOK],
    rootRef
  );

  return (
    <section
      ref={rootRef}
      id="story"
      aria-labelledby="story-heading"
      className="relative isolate overflow-hidden py-section"
    >
      {/* A single wide pool of light behind the spread, offset to the copy
          side so the page is never evenly lit. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-[70%]"
        style={{
          background:
            'radial-gradient(58% 52% at 80% 40%, rgb(252 249 243 / 0.55) 0%, rgb(241 231 213 / 0.3) 48%, transparent 74%)',
        }}
      />

      {/* Oversized section numeral, sunk into the paper. */}
      <span
        aria-hidden
        className="story-numeral display-face pointer-events-none absolute -top-4 right-[-2vw] -z-10 text-[26vw] leading-none text-ink/[0.035] lining-nums select-none lg:right-[3vw] lg:text-[15vw]"
      >
        02
      </span>

      <div className="shell relative z-10">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between lg:gap-[7%]">
          {/* ------------------------------ Media ------------------------------ */}
          <div className="story-media relative w-full lg:w-[50%]">
            <div className="relative flex gap-6 lg:gap-8">
              {/* Vertical caption running up the outer edge */}
              <p className="story-caption reveal hidden shrink-0 self-end pb-2 font-sans text-micro text-mute uppercase [writing-mode:vertical-rl] lg:block lg:rotate-180">
                {CONTACT.addressLines[0]} · Bandra West
              </p>

              <div
                ref={tiltRef}
                className="relative w-full will-change-transform"
                style={{ transformStyle: 'preserve-3d', perspective: 1100 }}
              >
                <RevealImage
                  asset={IMAGES.cafe}
                  alt="The room at Crèma House — warm lamplight over timber tables and a brick wall"
                  direction="up"
                  edge
                  parallax={6}
                  sizes="(min-width: 1024px) 50vw, 92vw"
                  objectPosition="48% 58%"
                  className="aspect-[4/5] rounded-lg shadow-lift"
                />

                {/* A detail from the bar, wiping in over the outer corner —
                    far enough out that it never collides with the caption
                    running up the inner edge. */}
                <div className="story-inset absolute right-3 -bottom-8 w-[42%] will-change-transform sm:-right-8 sm:-bottom-14 sm:w-[40%] lg:-right-16 lg:-bottom-16 lg:w-[38%]">
                  <RevealImage
                    asset={IMAGES.espresso}
                    alt="A single espresso, crema settling"
                    direction="right"
                    delay={0.35}
                    scaleFrom={1.28}
                    sizes="(min-width: 1024px) 19vw, 40vw"
                    className="aspect-square rounded-lg shadow-lift"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ------------------------------ Copy ------------------------------- */}
          <div className="story-copy relative w-full pt-10 lg:w-[40%] lg:pt-[5vw]">
            <p className="story-eyebrow eyebrow reveal">02 — The Room</p>

            <SplitHeading
              as="h2"
              mode="words-flip"
              start="top 80%"
              id="story-heading"
              className="mt-7 text-h2"
            >
              A room built around one <em className="text-gilt not-italic">obsession</em>.
            </SplitHeading>

            <SplitHeading
              as="p"
              mode="lines-rise"
              start="top 84%"
              stagger={0.075}
              className="mt-10 max-w-[44ch] font-sans text-lede text-ink-soft/85"
            >
              We took a corner unit on Ashworth Lane, stripped it back to brick, and
              pointed every lamp at the bar. Nothing hangs on the walls that
              isn&rsquo;t about the cup.
            </SplitHeading>

            <p className="story-body reveal mt-7 max-w-[46ch] font-sans text-body text-mute">
              Green beans land on Tuesday. They are roasted Wednesday, rested four
              days, and pulled no sooner than Sunday — never before the sugars have
              settled.
            </p>

            <div className="story-rule rule-gold mt-9 origin-left" />

            {/* ----------------------------- Stats ----------------------------- */}
            <dl className="mt-12 grid grid-cols-3 gap-x-5 gap-y-8 sm:gap-x-8">
              {STATS.map((stat) => (
                <div key={stat.label} className="story-stat reveal">
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <Counter
                      value={stat.value}
                      className="display-face text-[clamp(2.6rem,5.2vw,3.6rem)] text-ink"
                    />
                    <span aria-hidden className="mt-3 block h-px w-8 bg-gold/80" />
                    <span
                      aria-hidden
                      className="mt-3 block max-w-[16ch] text-balance font-sans text-[0.6rem] leading-[1.6] tracking-wide-sm text-mute uppercase"
                    >
                      {stat.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>

            <div className="story-cta reveal mt-9">
              <Magnetic strength={0.28} padding={36}>
                <Button asChild size="lg" variant="outline">
                  <Link href="/story">
                    Read the full story
                    <ArrowRight className="size-4" strokeWidth={1.5} />
                  </Link>
                </Button>
              </Magnetic>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
