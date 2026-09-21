'use client';

import { useRef } from 'react';
import { BackgroundVideo } from '@/components/media/BackgroundVideo';
import { Motes } from '@/components/motion/Motes';
import { Bean, Sparkle, Steam } from '@/components/illustrations/Doodles';
import { Vine } from '@/components/illustrations/Foliage';
import { gsap, useGsap } from '@/hooks/useGsap';
import { useMotionOK } from '@/hooks/useMediaQuery';
import { VIDEOS } from '@/lib/media';
import { SITE } from '@/lib/site';

const STEPS = [
  {
    index: 1,
    line: 'Crafted slowly.',
    note: 'Ninety hours from green bean to finished cup. There is no faster way that is also a better way.',
  },
  {
    index: 2,
    line: 'Roasted perfectly.',
    note: 'Drum-roasted in twelve-kilo batches, profiled by ear and by nose, stopped on the second crack.',
  },
  {
    index: 3,
    line: 'Served beautifully.',
    note: 'Poured into warmed porcelain. Never paper, never in a hurry, never to anyone standing up.',
  },
] as const;

/**
 * "The Craft"
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
 * Text is revealed by the site-wide RevealRunner through `data-text`, and the
 * inked doodles (steam, beans, sparkles, the vine) through `data-ill`. The
 * only choreography left here is what the runner cannot know about: the
 * frame's clip reveal and the vine growing down the steps with the scroll.
 *
 * Deliberately cheap to run. Sticky is CSS, not a ScrollTrigger pin, so there
 * is no spacer element and nothing to re-measure; the video decodes only once
 * it is near the viewport and pauses the moment it leaves; and every animated
 * property here is a transform, an opacity or a clip.
 *
 * The steps are labelled "no. 1" to "no. 3" in the hand face, so they read
 * as a recipe card's steps rather than as another numbered section.
 */
export function Craft() {
  const rootRef = useRef<HTMLElement>(null);
  const motionOK = useMotionOK();

  useGsap(
    () => {
      if (!motionOK) return;

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
        );

      // --- The vine the steps hang from -----------------------------------
      // The runner inks it on; this clip lets it grow down the column only
      // as fast as the reader scrolls past the steps.
      gsap.fromTo(
        '.craft-vine',
        { clipPath: 'inset(0% 0% 100% 0%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          ease: 'none',
          scrollTrigger: {
            trigger: '.craft-steps',
            start: 'top 74%',
            end: 'bottom 78%',
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

      {/* A couple of stray beans, drifting at their own pace in the margins.
          Desktop only: at phone widths the margins are the gutter itself. */}
      <Bean
        data-ill
        data-ill-float="36"
        className="pointer-events-none absolute top-[6%] right-[4%] -z-10 hidden w-9 rotate-[28deg] lg:block"
      />
      <Bean
        data-ill
        data-ill-float="22"
        data-ill-delay="0.2"
        className="pointer-events-none absolute top-[9%] right-[8%] -z-10 hidden w-6 -rotate-[18deg] lg:block"
      />

      <div className="shell">
        {/* -------------------------------- Head ------------------------------ */}
        <header className="craft-head">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
            <div className="w-full lg:max-w-[34rem]">
              <div className="flex items-end gap-2">
                <p data-text="write" className="eyebrow">
                  The craft
                </p>
                {/* Steam off the eyebrow, as if the word had just been poured. */}
                <Steam data-ill data-ill-delay="0.3" className="-mb-1 h-11 w-auto shrink-0" />
              </div>
              <h2
                id="craft-heading"
                data-text="wipe"
                data-text-start="top 84%"
                className="mt-5 max-w-[12em] text-h2"
              >
                Ninety hours, start to <em className="accent">cup</em>.
              </h2>
            </div>

            <p
              data-text="words"
              className="max-w-[38ch] font-sans text-body text-mute lg:pb-3 lg:text-right"
            >
              None of this can be hurried, and we have stopped trying. The green
              beans land on a Tuesday. The first cup is not poured until Sunday.
            </p>
          </div>
        </header>

        {/* ------------------------------- Body ------------------------------- */}
        <div className="mt-12 grid grid-cols-1 gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-x-12 lg:gap-y-0">
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
                  {/* The mark in the middle of the frame.

                      Clay on roasted beans is a near-miss: both are warm and
                      the footage keeps throwing highlights through exactly
                      this range. So it gets a breath of shade of its own —
                      a soft pool, centred, that fades out long before the
                      edges — and the lighter clay rather than the base one. */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        'radial-gradient(46% 40% at 50% 42%, rgb(28 18 8 / 0.52) 0%, rgb(28 18 8 / 0.22) 52%, rgb(28 18 8 / 0) 78%)',
                    }}
                  />

                  <div className="pointer-events-none absolute inset-x-0 top-[41%] flex -translate-y-1/2 items-center justify-center gap-3 px-6 text-center lg:top-[45%]">
                    <Sparkle data-ill data-ill-delay="0.8" className="size-3.5 shrink-0" />
                    <p
                      data-text="words"
                      data-text-delay="0.6"
                      className="display-face text-[clamp(1.05rem,2.6vw,1.4rem)] tracking-[0.02em] text-clay-lit italic"
                      style={{ textShadow: '0 1px 3px rgb(28 18 8 / 0.55), 0 2px 16px rgb(28 18 8 / 0.8)' }}
                    >
                      {SITE.tagline}
                    </p>
                    <Sparkle data-ill data-ill-delay="1" className="size-3.5 shrink-0" />
                  </div>

                  <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 sm:p-6">
                    <p
                      data-text="write"
                      className="font-hand text-[1.35rem] leading-none font-semibold text-canvas/85"
                    >
                      The roast
                    </p>
                    <p
                      data-text="words"
                      className="display-face mt-1.5 text-[clamp(1.05rem,2.4vw,1.5rem)] leading-tight text-canvas"
                    >
                      Twelve kilos, by ear
                    </p>
                  </div>

                  {/* The clay hairline that frames every lit surface here. */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-lg"
                    style={{ boxShadow: 'inset 0 0 0 1px rgb(196 103 76 / 0.26)' }}
                  />
                </div>

                <figcaption data-text="fade" className="mt-5 font-sans text-micro text-mute uppercase">
                  Sidama, Ethiopia · day four of the rest
                </figcaption>
              </figure>
            </div>
          </div>

          {/* ------------------------------ Steps ----------------------------- */}
          <div className="craft-steps relative lg:col-span-6 lg:col-start-7">
            {/* The vine the three steps hang from: inked on by the runner,
                grown down the column by the scroll (see the clip above). */}
            <div
              aria-hidden
              className="craft-vine pointer-events-none absolute inset-y-0 -left-3 hidden lg:block"
            >
              <Vine orientation="vertical" data-ill className="h-full w-auto" />
            </div>

            {/* Two beans at the foot of the column, where the steps end. */}
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-14 right-3 flex items-end gap-1.5 lg:right-[8%] lg:-bottom-6"
            >
              <Bean data-ill className="w-6 -rotate-[24deg] lg:w-8" />
              <Bean data-ill data-ill-delay="0.15" className="w-5 rotate-[34deg] lg:w-6" />
            </div>

            <ol className="flex flex-col gap-14 lg:gap-[clamp(6rem,17vh,11rem)] lg:pb-[6vh] lg:pl-20">
              {STEPS.map((step) => (
                <li key={step.index} className="relative">
                  {/* The numeral is set behind the type, not beside it — and
                      only where there is room for it. At phone widths an 7rem
                      ghost lands squarely on the heading it is meant to sit
                      behind, which reads as a smudge rather than as depth. */}
                  <span
                    aria-hidden
                    data-text="fade"
                    className="display-face pointer-events-none absolute -top-[0.4em] -left-[0.06em] -z-10 hidden text-[7rem] leading-none text-ink/[0.07] select-none lining-nums lg:block lg:text-[11rem]"
                  >
                    {step.index}
                  </span>

                  <p
                    data-text="write"
                    className="font-hand text-[1.6rem] leading-none font-semibold text-clay"
                  >
                    no. {step.index}
                  </p>

                  <h3
                    data-text="flip"
                    className="mt-3 max-w-[11em] text-h3"
                  >
                    {step.line}
                  </h3>

                  <p data-text="lines" className="mt-5 max-w-[38ch] font-sans text-body text-mute">
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
