'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { RevealImage } from '@/components/media/RevealImage';
import { Counter } from '@/components/motion/Counter';
import { Magnetic } from '@/components/motion/Magnetic';
import { Button } from '@/components/ui/button';
import { Daisy } from '@/components/illustrations/Florals';
import { CoffeeBranch } from '@/components/illustrations/Foliage';
import { Arrow, Squiggle } from '@/components/illustrations/Doodles';
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
 * "The Room"
 *
 * A spread, not a section. The photograph sits in the outer half of the page
 * with a second frame overlapping its corner, and the copy holds a narrow
 * column against acres of paper. The plates float (the shadow is what does
 * the work) and lean fractionally towards the pointer.
 *
 * The hand-made layer is drawn over the top like pencil on a proof: a coffee
 * branch tucked over the photo's corner, a scribbled note pointing at the
 * espresso, a squiggle under the one word that matters and a daisy beside the
 * numbers. Every piece of text and ink is revealed by the shared runner via
 * `data-text` / `data-ill`; this component only owns the parallax, the
 * pointer tilt and the squiggle's placement.
 */
export function Story() {
  const rootRef = useRef<HTMLElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const underlineRef = useRef<HTMLSpanElement>(null);

  const motionOK = useMotionOK();
  const finePointer = useHasFinePointer();

  // --- Squiggle placement ---------------------------------------------------
  // The underline lives outside the heading (the runner splits and rebuilds
  // the heading's markup, which would orphan anything nested in it), so it is
  // pinned under the accent word by measurement: once now, again when the
  // webfonts land, and whenever the heading reflows.
  useIsoLayoutEffect(() => {
    const heading = headingRef.current;
    const underline = underlineRef.current;
    const frame = heading?.parentElement;
    if (!heading || !underline || !frame) return;

    const place = () => {
      const word = heading.querySelector('em');
      if (!word) return;
      const box = frame.getBoundingClientRect();
      // A single word never wraps, so its last client rect is the word.
      const rects = word.getClientRects();
      const rect = rects[rects.length - 1] ?? word.getBoundingClientRect();
      if (!rect.width) return;

      const width = rect.width * 1.04;

      underline.style.left = `${rect.left - box.left - rect.height * 0.04}px`;
      underline.style.top = `${rect.bottom - box.top - rect.height * 0.14}px`;
      underline.style.width = `${width}px`;
      // Height comes from the width, not from the word: the squiggle's viewBox
      // is 200x20, and DrawSVG has to measure the path to draw it on — which
      // it cannot do on a non-scaling pen inside a box that has been stretched
      // unevenly (Chrome warns and the length comes back wrong). Holding the
      // 10:1 ratio keeps the scale uniform, and at this type size it lands
      // within a pixel or two of where a share of the cap height would.
      underline.style.height = `${width / 10}px`;
    };

    place();
    const observer = new ResizeObserver(place);
    observer.observe(heading);
    let alive = true;
    document.fonts?.ready.then(() => alive && place());

    return () => {
      alive = false;
      observer.disconnect();
    };
  }, []);

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

  // --- Scroll parallax ----------------------------------------------------
  useGsap(
    () => {
      if (!motionOK) return;

      // The columns travel at different rates: the plates lag, the copy leads.
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

      <div className="shell relative z-10">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-[7%]">
          {/* ------------------------------ Media ------------------------------ */}
          {/* Bottom padding keeps room for the inset and the note that hang
              below the photograph, so neither can drift into the copy. */}
          <div className="story-media relative w-full pb-20 sm:pb-24 lg:w-[50%] lg:pb-28">
            <div className="relative flex gap-6 lg:gap-8">
              {/* Vertical caption running up the outer edge */}
              <p
                data-text="fade"
                className="hidden shrink-0 self-end pb-2 font-sans text-micro text-mute uppercase [writing-mode:vertical-rl] lg:block lg:rotate-180"
              >
                {CONTACT.addressLines[0]} · Bandra West
              </p>

              <div
                ref={tiltRef}
                className="relative w-full will-change-transform"
                style={{ transformStyle: 'preserve-3d', perspective: 1100 }}
              >
                <RevealImage
                  asset={IMAGES.cafe}
                  alt="The room at Crèma House: warm lamplight over timber tables and a brick wall"
                  direction="up"
                  edge
                  parallax={6}
                  sizes="(min-width: 1024px) 50vw, 92vw"
                  objectPosition="48% 58%"
                  className="aspect-[4/5] rounded-lg shadow-lift"
                />

                {/* A coffee branch laid over the top corner of the print, the
                    way a sprig gets tucked into a frame. */}
                <CoffeeBranch
                  data-ill
                  data-ill-delay="0.5"
                  className="pointer-events-none absolute -top-8 -left-3 z-10 h-auto w-[44%] max-w-[18rem] -rotate-12 sm:-top-12 sm:-left-8 lg:-top-14 lg:-left-12"
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

                {/* The margin note: scribbled under the photograph, its arrow
                    curling up at the espresso. Decorative, so hidden from
                    assistive tech (the inset's alt already says what it is). */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute right-[50%] -bottom-[4.75rem] flex items-end gap-1 sm:right-[46%] sm:-bottom-[5.5rem] lg:right-[38%] lg:-bottom-[6.25rem]"
                >
                  <p
                    data-text="pop"
                    data-text-delay="0.6"
                    className="font-hand text-[1.55rem] leading-none font-semibold whitespace-nowrap text-clay sm:text-[1.75rem] lg:text-[1.95rem]"
                  >
                    the good stuff
                  </p>
                  <Arrow
                    data-ill
                    data-ill-delay="0.9"
                    className="mb-3 h-auto w-11 shrink-0 -rotate-[28deg] sm:w-14 lg:w-16"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ------------------------------ Copy ------------------------------- */}
          <div className="relative w-full lg:w-[40%] lg:pt-[5vw]">
            <p data-text="write" className="eyebrow">
              The room
            </p>

            <div className="relative mt-4">
              <h2
                ref={headingRef}
                id="story-heading"
                data-text="flip"
                data-text-delay="0.1"
                className="text-h2"
              >
                A room built around one <em className="accent">obsession</em>.
              </h2>
              <span
                ref={underlineRef}
                aria-hidden
                className="pointer-events-none absolute top-full left-0 block h-4 w-0"
              >
                <Squiggle
                  data-ill
                  data-ill-delay="0.9"
                  className="block h-full w-full text-clay"
                />
              </span>
            </div>

            <p
              data-text="lines"
              data-text-stagger="0.075"
              className="mt-10 max-w-[44ch] font-sans text-lede text-ink-soft/85"
            >
              We took a corner unit on Ashworth Lane, stripped it back to brick, and
              pointed every lamp at the bar. Nothing hangs on the walls that
              isn&rsquo;t about the cup.
            </p>

            <p
              data-text="words"
              className="mt-7 max-w-[46ch] font-sans text-body text-mute"
            >
              Green beans land on Tuesday. They are roasted Wednesday, rested four
              days, and pulled no sooner than Sunday. Never before the sugars have
              settled.
            </p>

            {/* ----------------------------- Stats ----------------------------- */}
            <div className="relative mt-16">
              <Daisy
                data-ill
                data-ill-delay="0.3"
                className="pointer-events-none absolute -top-12 right-0 h-auto w-10 rotate-12 sm:w-12"
              />

              <dl className="grid grid-cols-3 gap-x-5 gap-y-8 sm:gap-x-8">
                {STATS.map((stat) => (
                  // The counter rewrites its own digits, so the reveal sits on
                  // this static wrapper rather than on the number.
                  <div key={stat.label} data-text="fade">
                    <dt className="sr-only">{stat.label}</dt>
                    <dd>
                      <Counter
                        value={stat.value}
                        className="display-face text-[clamp(2.6rem,5.2vw,3.6rem)] text-ink"
                      />
                      <span
                        aria-hidden
                        className="mt-3 block max-w-[16ch] text-balance font-sans text-[0.8rem] leading-snug text-mute"
                      >
                        {stat.label}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div data-text="fade" className="mt-10">
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
