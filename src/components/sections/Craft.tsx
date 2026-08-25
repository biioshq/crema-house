'use client';

import { useRef } from 'react';
import { BackgroundVideo } from '@/components/media/BackgroundVideo';
import { gsap, ScrollTrigger, useGsap } from '@/hooks/useGsap';
import { useMotionOK } from '@/hooks/useMediaQuery';
import { VIDEOS } from '@/lib/media';
import { cn } from '@/lib/utils';

const PHRASES = [
  {
    index: '01',
    line: 'Crafted Slowly.',
    note: 'Ninety hours from green bean to finished cup. There is no faster way that is also a better way.',
  },
  {
    index: '02',
    line: 'Roasted Perfectly.',
    note: 'Drum-roasted in twelve-kilo batches, profiled by ear and by nose, stopped on the second crack.',
  },
  {
    index: '03',
    line: 'Served Beautifully.',
    note: 'Poured into warmed porcelain. Never paper, never in a hurry, never to anyone standing up.',
  },
] as const;

/**
 * How much scroll each phrase owns, as a fraction of the pinned panel's own
 * height — and the section height derived from it.
 *
 * These two must stay in lockstep. When they drift, the pin releases while a
 * phrase is still on screen and the last statement slides away mid-sentence,
 * which is exactly what was happening on mobile.
 */
const SEGMENT_RATIO = 0.62;
const SECTION_HEIGHT = 1 + PHRASES.length * SEGMENT_RATIO;

/**
 * Letters as individual inline-blocks, hidden from assistive tech.
 *
 * Grouped into non-wrapping words first: inline-block characters are
 * independent line-break opportunities, so without the word wrapper a narrow
 * viewport would happily break "Beautifully." in half.
 */
function Letters({ text }: { text: string }) {
  return (
    <span aria-hidden>
      {text.split(' ').map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block whitespace-nowrap">
          {Array.from(word).map((character, index) => (
            <span key={index} className="craft-char inline-block will-change-transform">
              {character}
            </span>
          ))}
          {wordIndex < text.split(' ').length - 1 && (
            <span className="craft-char inline-block w-[0.26em]" />
          )}
        </span>
      ))}
    </span>
  );
}

/**
 * SECTION 04 — "The Craft"
 *
 * The beans loop is pinned for the length of three screens while three
 * statements hand over to each other above it. Each letter hinges in on its
 * own axis and hinges back out on the way past.
 *
 * The phrases are driven by *toggled* timelines rather than a scrubbed one:
 * that keeps the letter motion at a constant, deliberate speed no matter how
 * fast the wheel is turning, and makes scrubbing backwards look as composed
 * as scrubbing forwards.
 */
export function Craft() {
  const rootRef = useRef<HTMLElement>(null);
  const motionOK = useMotionOK();

  useGsap(
    () => {
      const root = rootRef.current;
      if (!root || !motionOK) return;

      // Footage drifts and slowly closes in across the whole pin.
      gsap.fromTo(
        '.craft-video',
        { scale: 1.16, yPercent: -2 },
        {
          scale: 1,
          yPercent: 2,
          ease: 'none',
          scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: 1.2 },
        }
      );

      // Measured from the pinned panel itself, not from window.innerHeight:
      // the panel is sized in `svh`, while innerHeight tracks the *current*
      // viewport, so on a phone with a collapsing URL bar the two disagree
      // and every phrase boundary lands in the wrong place.
      const sticky = root.querySelector<HTMLElement>('.craft-sticky');
      const segment = () => (sticky?.offsetHeight ?? window.innerHeight) * SEGMENT_RATIO;

      gsap.utils.toArray<HTMLElement>('.craft-phrase').forEach((phrase, index) => {
        const chars = phrase.querySelectorAll<HTMLElement>('.craft-char');
        const note = phrase.querySelector<HTMLElement>('.craft-note');
        const label = phrase.querySelector<HTMLElement>('.craft-label');
        const rail = root.querySelector<HTMLElement>(`.craft-rail-fill[data-index="${index}"]`);

        const tl = gsap.timeline({ paused: true });

        tl.fromTo(
          chars,
          { rotateX: -96, y: '0.42em', opacity: 0 },
          { rotateX: 0, y: 0, opacity: 1, duration: 0.95, stagger: 0.028, ease: 'power4.out' },
          0
        )
          .fromTo(
            label,
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
            0.05
          )
          .fromTo(
            note,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' },
            0.42
          );

        if (rail) gsap.set(rail, { scaleY: 0, transformOrigin: 'top' });

        ScrollTrigger.create({
          trigger: root,
          start: () => `top+=${index * segment()} top`,
          end: () => `top+=${(index + 1) * segment()} top`,
          invalidateOnRefresh: true,
          onToggle: (self) => {
            if (self.isActive) tl.play();
            else tl.reverse();

            if (rail) {
              gsap.to(rail, {
                scaleY: self.isActive ? 1 : 0,
                duration: 0.6,
                ease: 'power2.out',
                overwrite: true,
              });
            }
          },
        });
      });
    },
    [motionOK],
    rootRef
  );

  return (
    <section
      ref={rootRef}
      id="craft"
      aria-label="How the coffee is made"
      className="relative"
      style={motionOK ? { height: `calc(100svh * ${SECTION_HEIGHT})` } : undefined}
    >
      <div
        className={cn(
          'craft-sticky overflow-hidden',
          motionOK ? 'sticky top-0 h-[100svh]' : 'relative py-section'
        )}
      >
        {/* Footage */}
        <div className="craft-video absolute inset-0 will-change-transform">
          <BackgroundVideo
            src={VIDEOS.beans}
            playbackRate={0.55}
            className="[filter:brightness(0.5)_saturate(0.85)]"
          />
        </div>

        {/* Grade */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgb(10 7 5 / 0.94) 0%, rgb(10 7 5 / 0.62) 26%, rgb(10 7 5 / 0.60) 74%, rgb(10 7 5 / 0.96) 100%)',
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(70% 55% at 50% 50%, rgb(10 7 5 / 0.55) 0%, rgb(10 7 5 / 0.20) 55%, transparent 80%)',
          }}
        />

        {/* Phrases */}
        <div className={cn('relative h-full', motionOK && 'grid place-items-center')}>
          <div className="w-full text-center">
            {PHRASES.map((phrase, index) => (
              <div
                key={phrase.index}
                data-index={index}
                className={cn(
                  'craft-phrase px-gutter',
                  motionOK
                    ? 'absolute inset-x-0 top-1/2 -translate-y-1/2'
                    : 'relative py-14 first:pt-0 last:pb-0'
                )}
                style={{ perspective: 900 }}
              >
                <p className="craft-label eyebrow">{phrase.index} — The Craft</p>

                <h2
                  aria-label={phrase.line}
                  className="mt-7 text-display text-porcelain"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <Letters text={phrase.line} />
                </h2>

                <p className="craft-note mx-auto mt-8 max-w-[44ch] text-balance font-sans text-lede text-crema/75">
                  {phrase.note}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Progress rail */}
        {motionOK && (
          <div
            aria-hidden
            className="absolute top-1/2 right-[max(1.25rem,4vw)] hidden -translate-y-1/2 flex-col gap-3 sm:flex"
          >
            {PHRASES.map((phrase, index) => (
              <span key={phrase.index} className="relative block h-14 w-px bg-crema/12">
                <span
                  data-index={index}
                  className="craft-rail-fill absolute inset-0 block origin-top bg-gold-lit"
                />
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
