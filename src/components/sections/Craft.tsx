'use client';

import { useRef } from 'react';
import { BackgroundVideo } from '@/components/media/BackgroundVideo';
import { SplitHeading } from '@/components/motion/SplitHeading';
import { Motes } from '@/components/motion/Motes';
import { gsap, useGsap } from '@/hooks/useGsap';
import { useMotionOK } from '@/hooks/useMediaQuery';
import { VIDEOS } from '@/lib/media';

const STEPS = [
  {
    index: '01',
    line: 'Crafted slowly.',
    note: 'Ninety hours from green bean to finished cup. There is no faster way that is also a better way.',
  },
  {
    index: '02',
    line: 'Roasted perfectly.',
    note: 'Drum-roasted in twelve-kilo batches, profiled by ear and by nose, stopped on the second crack.',
  },
  {
    index: '03',
    line: 'Served beautifully.',
    note: 'Poured into warmed porcelain. Never paper, never in a hurry, never to anyone standing up.',
  },
] as const;

/**
 * SECTION 04 — "The Craft"
 *
 * The room where the work happens. Everything before this section is the
 * result — a spread of the room, a vitrine of plates — so this one has to be
 * the process, and a process is something you watch rather than read about.
 *
 * The composition is a held shot and a moving column: the beans stay on screen
 * as one sticky frame down the left while the three steps pass it on the
 * right, so the footage reads as the constant and the copy as commentary over
 * it. On a phone the frame simply leads, full width, and the steps follow.
 *
 * Deliberately cheap to run. Sticky is CSS, not a ScrollTrigger pin, so there
 * is no spacer element and nothing to re-measure; the video decodes only once
 * it is near the viewport and pauses the moment it leaves; and every animated
 * property here is a transform, an opacity or a clip. The section adds no
 * pointer listener, no backdrop blur and no shadow interpolation to a page
 * that was already spending too much of its frame budget on all three.
 *
 * NUMBERING — one site-wide sequence, and no sub-sequence that could be
 * mistaken for it: 01 Hero, 02 The Room, 03 The Menu, 04 The Craft, 05 Voices,
 * 06 Reservations. The three steps below are numbered 01/02/03 and set as
 * "01 / 03" precisely so they read as three of three rather than as sections.
 * A sub-page takes the number of the home section it expands; it never starts
 * a sequence of its own.
 */
export function Craft() {
  const rootRef = useRef<HTMLElement>(null);
  const motionOK = useMotionOK();

  useGsap(
    () => {
      if (!motionOK) return;

      // --- Header ---------------------------------------------------------
      gsap
        .timeline({ scrollTrigger: { trigger: '.craft-head', start: 'top 84%', once: true } })
        .fromTo('.craft-eyebrow', { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.9 }, 0)
        .fromTo('.craft-aside', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1 }, 0.45)
        .fromTo(
          '.craft-head-rule',
          { scaleX: 0 },
          { scaleX: 1, duration: 1.4, ease: 'power3.inOut' },
          0.3
        );

      // --- The frame ------------------------------------------------------
      // The mask opens upward while the footage inside settles back against
      // it — the same camera-landing move the photographs use, so the video
      // arrives in the site's own language rather than just switching on.
      gsap
        .timeline({ scrollTrigger: { trigger: '.craft-frame', start: 'top 86%', once: true } })
        .fromTo(
          '.craft-frame',
          { clipPath: 'inset(100% 0% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'power4.inOut' },
          0
        )
        .fromTo(
          '.craft-frame-inner',
          { scale: 1.16 },
          { scale: 1, duration: 1.9, ease: 'power3.out' },
          0
        )
        .fromTo('.craft-caption', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.9 }, 0.9);

      // --- The thread the steps hang from ---------------------------------
      gsap.fromTo(
        '.craft-thread',
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: '.craft-steps',
            start: 'top 74%',
            end: 'bottom 78%',
            scrub: 1,
          },
        }
      );

      // --- The steps -------------------------------------------------------
      gsap.utils.toArray<HTMLElement>('.craft-step').forEach((step) => {
        gsap
          .timeline({
            scrollTrigger: { trigger: step, start: 'top 86%', once: true },
            // Nothing here plays twice, so hand the element back without a
            // transform once it has arrived.
            onComplete: () => gsap.set(step, { clearProps: 'transform' }),
          })
          .fromTo(step, { opacity: 0, y: 56 }, { opacity: 1, y: 0, duration: 1.2 }, 0)
          .fromTo(
            step.querySelector('.craft-numeral'),
            { opacity: 0, y: 22 },
            { opacity: 1, y: 0, duration: 1.4, ease: 'power3.out' },
            0.05
          )
          .fromTo(
            step.querySelector('.craft-dot'),
            { scale: 0 },
            { scale: 1, duration: 0.7, ease: 'power3.out' },
            0.2
          )
          .fromTo(
            step.querySelector('.craft-rule'),
            { scaleX: 0 },
            { scaleX: 1, duration: 1.2, ease: 'power3.inOut' },
            0.35
          )
          .fromTo(
            step.querySelector('.craft-note'),
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 1 },
            0.55
          );
      });
    },
    [motionOK],
    rootRef
  );

  return (
    <section
      ref={rootRef}
      id="craft"
      aria-labelledby="craft-heading"
      // `overflow-x-clip`, never `overflow-hidden`: hidden on either axis turns
      // this element into a scroll container, and a sticky child inside a
      // scroll container that cannot scroll simply never sticks.
      className="relative isolate overflow-x-clip py-section"
    >
      {/* Two soft pools, off-centre and different sizes — the section is lit
          like a room, not like a lightbox. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[4%] -z-10 h-[54%]"
        style={{
          background:
            'radial-gradient(50% 44% at 24% 28%, rgb(252 249 243 / 0.5) 0%, transparent 70%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[56%]"
        style={{
          background:
            'radial-gradient(46% 44% at 80% 70%, rgb(241 231 213 / 0.8) 0%, transparent 72%)',
        }}
      />
      <Motes count={6} opacity={0.45} seed={0xc7af} className="-z-10" />

      <div className="shell">
        {/* -------------------------------- Head ------------------------------ */}
        <header className="craft-head">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
            <div className="w-full lg:max-w-[34rem]">
              <p className="craft-eyebrow eyebrow reveal">04 — The Craft</p>
              <SplitHeading
                as="h2"
                id="craft-heading"
                mode="lines-rise"
                start="top 84%"
                className="mt-7 max-w-[12em] text-h2"
              >
                Ninety hours, start to cup.
              </SplitHeading>
            </div>

            <p className="craft-aside reveal max-w-[38ch] font-sans text-body text-mute lg:pb-3 lg:text-right">
              None of this can be hurried, and we have stopped trying. The green
              beans land on a Tuesday. The first cup is not poured until Sunday.
            </p>
          </div>

          <div className="craft-head-rule rule-gold mt-9 origin-left lg:mt-12" />
        </header>

        {/* ------------------------------- Body ------------------------------- */}
        <div className="mt-12 grid grid-cols-1 gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-x-12 lg:gap-y-0">
          {/* ------------------------------ Media ----------------------------- */}
          <div className="lg:col-span-5">
            {/* Coupled to the navbar: the pill's unscrolled bottom edge sits
                at lg:pt-4 (1rem) + lg:h-[4.5rem] = 5.5rem, so this floor has to
                stay above that or the frame parks behind it. Raise both together. */}
            <div className="lg:sticky lg:top-28">
              <figure className="relative">
                {/* Sized by aspect on the small screens, where it is a band
                    across the top, and by viewport height once it becomes the
                    held shot — a fixed portrait ratio at this width is taller
                    than a 768px laptop viewport, and a sticky element taller
                    than the viewport stops being sticky. */}
                <div
                  className="craft-frame relative aspect-[16/10] overflow-hidden rounded-lg bg-sand shadow-lift sm:aspect-3/2 lg:aspect-auto lg:h-[min(58vh,32rem)]"
                  style={{ clipPath: 'inset(0% 0% 0% 0%)' }}
                >
                  <div className="craft-frame-inner absolute inset-0">
                    <BackgroundVideo
                      src={VIDEOS.beans}
                      playbackRate={0.8}
                      className="absolute inset-0"
                    />
                  </div>

                  {/* A whisper of light across the top and a settle of warmth
                      at the foot, so the footage sits in the page rather than
                      on it. */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(180deg, rgb(255 255 255 / 0.16) 0%, transparent 18%, transparent 48%, rgb(34 22 10 / 0.34) 78%, rgb(34 22 10 / 0.62) 100%)',
                    }}
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 sm:p-6">
                    <span aria-hidden className="block h-px w-10 bg-gold-lit/85" />
                    <p className="mt-3 font-sans text-[0.58rem] leading-none font-medium tracking-[0.3em] text-canvas/75 uppercase">
                      The roast
                    </p>
                    <p className="display-face mt-2 text-[clamp(1.05rem,2.4vw,1.5rem)] leading-tight text-canvas">
                      Twelve kilos, by ear
                    </p>
                  </div>

                  {/* The gold hairline that frames every lit surface here. */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-lg"
                    style={{ boxShadow: 'inset 0 0 0 1px rgb(196 154 82 / 0.28)' }}
                  />
                </div>

                <figcaption className="craft-caption reveal mt-6 flex items-start gap-4">
                  <span aria-hidden className="mt-1.5 h-px w-8 shrink-0 bg-gold/80" />
                  <span className="font-sans text-micro text-mute uppercase">
                    Sidama, Ethiopia · day four of the rest
                  </span>
                </figcaption>
              </figure>
            </div>
          </div>

          {/* ------------------------------ Steps ----------------------------- */}
          <div className="craft-steps relative lg:col-span-6 lg:col-start-7">
            {/* The thread the three steps hang from, drawn as you arrive. */}
            <span
              aria-hidden
              className="craft-thread pointer-events-none absolute inset-y-2 left-0 hidden w-px origin-top lg:block"
              style={{
                background:
                  'linear-gradient(180deg, transparent, rgb(196 154 82 / 0.4) 10%, rgb(196 154 82 / 0.4) 90%, transparent)',
              }}
            />

            <ol className="flex flex-col gap-14 lg:gap-[clamp(6rem,17vh,11rem)] lg:pb-[6vh] lg:pl-16">
              {STEPS.map((step) => (
                <li key={step.index} className="craft-step relative">
                  {/* The numeral is set behind the type, not beside it — and
                      only where there is room for it. At phone widths an 7rem
                      ghost lands squarely on the heading it is meant to sit
                      behind, which reads as a smudge rather than as depth. */}
                  <span
                    aria-hidden
                    className="craft-numeral display-face pointer-events-none absolute -top-[0.4em] -left-[0.06em] -z-10 hidden text-[7rem] leading-none text-ink/[0.07] select-none reveal lining-nums lg:block lg:text-[11rem]"
                  >
                    {step.index}
                  </span>

                  {/* The bead that pins this step to the thread. */}
                  <span
                    aria-hidden
                    className="craft-dot absolute top-[0.55rem] -left-16 hidden size-1.5 -translate-x-[calc(50%-0.5px)] rounded-full bg-gold lg:block"
                  />

                  <p className="font-sans text-micro text-gold-deep tabular-nums">
                    {step.index} <span className="text-faint">/ 03</span>
                  </p>

                  <SplitHeading
                    as="h3"
                    mode="lines-rise"
                    start="top 88%"
                    className="mt-5 max-w-[11em] text-h3"
                  >
                    {step.line}
                  </SplitHeading>

                  <div className="craft-rule mt-7 h-px w-full max-w-48 origin-left bg-linear-to-r from-gold/60 via-hair to-transparent" />

                  <p className="craft-note reveal mt-6 max-w-[38ch] font-sans text-body text-mute">
                    {step.note}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
