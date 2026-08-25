'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { RevealImage } from '@/components/media/RevealImage';
import { SplitHeading } from '@/components/motion/SplitHeading';
import { Counter } from '@/components/motion/Counter';
import { BeanDust } from '@/components/motion/BeanDust';
import { Magnetic } from '@/components/motion/Magnetic';
import { Button } from '@/components/ui/button';
import { gsap, useGsap } from '@/hooks/useGsap';
import { useIsoLayoutEffect } from '@/hooks/useIsoLayoutEffect';
import { useHasFinePointer, useMotionOK } from '@/hooks/useMediaQuery';
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
 * Signature move: a travelling mask. The interior unmasks upward while the
 * photograph inside counter-scales, a second frame wipes in sideways over
 * it, and the whole stack tilts in 3D against the pointer. The heading hinges
 * up word by word — nothing here repeats the hero's per-letter blur.
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

    const rotateX = gsap.quickTo(tilt, 'rotationX', { duration: 1, ease: 'power3.out' });
    const rotateY = gsap.quickTo(tilt, 'rotationY', { duration: 1, ease: 'power3.out' });
    const insetX = inset ? gsap.quickTo(inset, 'x', { duration: 1.2, ease: 'power3.out' }) : null;
    const insetY = inset ? gsap.quickTo(inset, 'y', { duration: 1.2, ease: 'power3.out' }) : null;

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;

      const rect = tilt.getBoundingClientRect();
      const nx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const ny = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);

      // Clamped so a pointer far outside the frame does not over-rotate it.
      const cx = Math.max(-1.6, Math.min(1.6, nx));
      const cy = Math.max(-1.6, Math.min(1.6, ny));

      rotateY(cx * 4.2);
      rotateX(-cy * 3.2);
      // The inset lives closer to the viewer, so it travels further.
      insetX?.(-cx * 16);
      insetY?.(-cy * 12);
    };

    const onLeave = () => {
      gsap.to(tilt, { rotationX: 0, rotationY: 0, duration: 1.2, ease: 'power3.out' });
      if (inset) gsap.to(inset, { x: 0, y: 0, duration: 1.2, ease: 'power3.out' });
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);

    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, [motionOK, finePointer]);

  // --- Scroll choreography ------------------------------------------------
  useGsap(
    () => {
      if (!motionOK) return;

      // Columns travel at different rates — the image lags, the copy leads.
      gsap.fromTo(
        '.story-media',
        { yPercent: 5 },
        {
          yPercent: -5,
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
        { yPercent: 16, opacity: 0 },
        {
          yPercent: -16,
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
        .fromTo('.story-body', { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 1.1 }, 0.55)
        .fromTo('.story-rule', { scaleX: 0 }, { scaleX: 1, duration: 1.3, ease: 'power3.inOut' }, 0.7)
        .fromTo(
          '.story-stat',
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 1, stagger: 0.12 },
          0.85
        )
        .fromTo(
          '.story-caption',
          { opacity: 0, y: 26 },
          { opacity: 1, y: 0, duration: 1 },
          0.4
        )
        .fromTo('.story-cta', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1 }, 1.05);
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
      <BeanDust count={10} opacity={0.38} seed={0x51ce} className="z-0" />

      {/* Oversized section numeral, sunk into the background. */}
      <span
        aria-hidden
        className="story-numeral display-face pointer-events-none absolute -top-4 right-[-2vw] z-0 text-[26vw] leading-none text-porcelain/[0.028] select-none lg:right-[3vw] lg:text-[16vw]"
      >
        02
      </span>

      <div className="shell relative z-10">
        <div className="flex flex-col gap-16 lg:flex-row lg:items-start lg:justify-between lg:gap-[6%]">
          {/* ------------------------------ Media ------------------------------ */}
          <div className="story-media relative w-full lg:w-[52%]">
            <div className="relative flex gap-5 lg:gap-7">
              {/* Vertical caption running up the outer edge */}
              <p className="story-caption hidden shrink-0 self-end pb-2 font-sans text-micro text-ash uppercase opacity-0 [writing-mode:vertical-rl] lg:block lg:rotate-180">
                {CONTACT.addressLines[0]} · Bandra West
              </p>

              <div
                ref={tiltRef}
                className="relative w-full will-change-transform"
                style={{ transformStyle: 'preserve-3d', perspective: 1200 }}
              >
                <RevealImage
                  asset={IMAGES.cafe}
                  alt="The room at Crèma House — warm lamplight over timber tables and a brick wall"
                  direction="up"
                  edge
                  parallax={6}
                  sizes="(min-width: 1024px) 52vw, 92vw"
                  objectPosition="48% 58%"
                  className="aspect-[4/5] rounded-md shadow-lift"
                />

                {/* A detail from the bar, wiping in over the corner. */}
                {/* Pushed to the outer corner so it never collides with the vertical
                    caption running up the left edge. */}
                <div className="story-inset absolute right-3 -bottom-8 w-[42%] will-change-transform sm:-right-8 sm:-bottom-14 sm:w-[40%] lg:-right-14 lg:-bottom-16 lg:w-[38%]">
                  <RevealImage
                    asset={IMAGES.espresso}
                    alt="A single espresso, crema settling"
                    direction="right"
                    delay={0.35}
                    scaleFrom={1.3}
                    sizes="(min-width: 1024px) 20vw, 40vw"
                    className="aspect-square rounded-md border border-crema/10 shadow-lift"
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-md"
                    style={{ boxShadow: 'inset 0 1px 0 0 rgb(250 246 239 / 0.10)' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ------------------------------ Copy ------------------------------- */}
          <div className="story-copy relative w-full pt-6 lg:w-[40%] lg:pt-[4vw]">
            <p className="story-eyebrow eyebrow opacity-0">02 — The Room</p>

            <SplitHeading
              as="h2"
              mode="words-flip"
              start="top 80%"
              id="story-heading"
              className="mt-7 text-h2"
            >
              A room built around one{' '}
              <em className="text-gilt not-italic">obsession</em>.
            </SplitHeading>

            <SplitHeading
              as="p"
              mode="lines-rise"
              start="top 84%"
              stagger={0.075}
              className="mt-9 max-w-[46ch] font-sans text-lede text-crema/80"
            >
              We took a corner unit on Ashworth Lane, stripped it back to brick, and
              pointed every lamp at the bar. Nothing hangs on the walls that
              isn&rsquo;t about the cup.
            </SplitHeading>

            <p className="story-body mt-6 max-w-[46ch] font-sans text-body text-ash opacity-0">
              Green beans land on Tuesday. They are roasted Wednesday, rested four
              days, and pulled no sooner than Sunday — never before the sugars have
              settled.
            </p>

            <div className="story-rule mt-12 h-px w-full origin-left bg-linear-to-r from-clay via-clay/60 to-transparent" />

            {/* ----------------------------- Stats ----------------------------- */}
            <dl className="mt-10 grid grid-cols-3 gap-x-5 gap-y-8 sm:gap-x-8">
              {STATS.map((stat) => (
                <div key={stat.label} className="story-stat opacity-0">
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <Counter
                      value={stat.value}
                      className="display-face text-[clamp(2.4rem,5vw,3.4rem)] text-porcelain"
                    />
                    <span
                      aria-hidden
                      className="mt-3 block h-px w-7 bg-gold/70"
                    />
                    <span
                      aria-hidden
                      className="mt-3 block max-w-[16ch] text-balance font-sans text-[0.6rem] leading-[1.5] tracking-wide-sm text-ash uppercase"
                    >
                      {stat.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>

            <div className="story-cta mt-12 opacity-0">
              <Magnetic strength={0.3} padding={36}>
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
