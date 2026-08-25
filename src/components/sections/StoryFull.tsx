'use client';

import { useRef } from 'react';
import { RevealImage } from '@/components/media/RevealImage';
import { SplitHeading } from '@/components/motion/SplitHeading';
import { Counter } from '@/components/motion/Counter';
import { Motes } from '@/components/motion/Motes';
import { gsap, useGsap } from '@/hooks/useGsap';
import { useMotionOK } from '@/hooks/useMediaQuery';
import { IMAGES } from '@/lib/media';
import { CONTACT } from '@/lib/site';

const STATS = [
  { value: 11, label: 'Years on the lane' },
  { value: 6, label: 'Origins on the bar' },
  { value: 92, label: 'Mean cupping score' },
  { value: 26, label: 'Seconds of extraction' },
] as const;

const CHAPTERS = [
  {
    index: 'i',
    title: 'The lease',
    image: 'cafe',
    alt: 'The room at Crèma House — timber tables under warm lamplight',
    direction: 'up',
    body: [
      'The unit had been a photocopy shop for nineteen years. It came with a suspended ceiling, four fluorescent tubes, and a carpet that we will not describe.',
      'We took all of it out. Behind the plasterboard was brick, and behind the brick was a window nobody had opened since the eighties. That window is now the best seat in the room.',
    ],
  },
  {
    index: 'ii',
    title: 'The roast',
    image: 'espresso',
    alt: 'A single espresso, crema still settling',
    direction: 'right',
    body: [
      'Twelve kilos at a time, in a drum, by ear. Green beans land on Tuesday and are roasted on Wednesday — never the same day, because a bean that has just travelled does not behave.',
      'We stop on the second crack. Then it rests four days. Coffee pulled before the sugars settle tastes like a good idea served too early.',
    ],
  },
  {
    index: 'iii',
    title: 'The rules',
    image: 'butter-croissant',
    alt: 'A butter croissant, thirty-six hours in the making',
    direction: 'left',
    body: [
      'No loyalty cards. No syrups that are not made here. Nothing served in paper unless you are genuinely walking out of the door with it.',
      'Two tables stay empty every evening for people who did not plan ahead — because the best afternoons here have always belonged to somebody who wandered in.',
    ],
  },
] as const;

/**
 * The long-form story page.
 *
 * The home page shows the abridged version; this is the whole thing, told in
 * three chapters that alternate side and reveal direction so the eye keeps
 * moving down the page rather than settling into a rhythm.
 */
export function StoryFull() {
  const rootRef = useRef<HTMLElement>(null);
  const motionOK = useMotionOK();

  useGsap(
    () => {
      if (!motionOK) return;

      gsap.utils.toArray<HTMLElement>('.chapter').forEach((chapter) => {
        gsap
          .timeline({ scrollTrigger: { trigger: chapter, start: 'top 78%', once: true } })
          .fromTo(
            chapter.querySelectorAll('.chapter-index'),
            { opacity: 0, x: -12 },
            { opacity: 1, x: 0, duration: 0.9 },
            0
          )
          .fromTo(
            chapter.querySelectorAll('.chapter-body'),
            { opacity: 0, y: 22 },
            { opacity: 1, y: 0, duration: 1.1, stagger: 0.1 },
            0.35
          )
          .fromTo(
            chapter.querySelectorAll('.chapter-rule'),
            { scaleX: 0 },
            { scaleX: 1, duration: 1.2, ease: 'power3.inOut' },
            0.2
          );
      });

      gsap.fromTo(
        '.story-stat',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.1,
          scrollTrigger: { trigger: '.story-stats', start: 'top 86%', once: true },
        }
      );
    },
    [motionOK],
    rootRef
  );

  return (
    <section ref={rootRef} className="relative isolate overflow-hidden pb-section">
      <Motes count={8} opacity={0.45} seed={0x51ce} className="-z-10" />

      <div className="shell">
        {/* ----------------------------- Chapters ---------------------------- */}
        <div className="flex flex-col gap-section">
          {CHAPTERS.map((chapter, index) => {
            const asset = IMAGES[chapter.image as keyof typeof IMAGES];
            const flipped = index % 2 === 1;

            return (
              <article
                key={chapter.index}
                className={[
                  'chapter flex flex-col gap-10 lg:items-center lg:gap-[7%]',
                  flipped ? 'lg:flex-row-reverse' : 'lg:flex-row',
                ].join(' ')}
              >
                <div className="w-full lg:w-[46%]">
                  <RevealImage
                    asset={asset}
                    alt={chapter.alt}
                    direction={chapter.direction}
                    edge={index === 0}
                    parallax={6}
                    sizes="(min-width: 1024px) 46vw, 92vw"
                    objectPosition={chapter.image === 'cafe' ? '48% 58%' : '50% 50%'}
                    className="aspect-[4/5] rounded-lg shadow-lift"
                  />
                </div>

                <div className="w-full lg:w-[47%]">
                  <p className="chapter-index eyebrow reveal">
                    Chapter {chapter.index}
                  </p>

                  <SplitHeading
                    as="h2"
                    mode="words-flip"
                    start="top 82%"
                    className="mt-6 text-h2"
                  >
                    {chapter.title}
                  </SplitHeading>

                  <div className="chapter-rule mt-8 h-px w-full origin-left bg-linear-to-r from-hair via-hair/60 to-transparent" />

                  {chapter.body.map((paragraph) => (
                    <p
                      key={paragraph.slice(0, 24)}
                      className="chapter-body reveal mt-6 max-w-[48ch] font-sans text-body text-ink-soft/85"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </article>
            );
          })}
        </div>

        {/* ------------------------------ Numbers ---------------------------- */}
        <div className="story-stats mt-section border-t border-hair/70 pt-9">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4 lg:gap-x-10">
            {STATS.map((stat) => (
              <div key={stat.label} className="story-stat reveal">
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <Counter
                    value={stat.value}
                    className="display-face text-[clamp(2.6rem,5vw,3.8rem)] text-ink"
                  />
                  <span aria-hidden className="mt-3 block h-px w-7 bg-gold" />
                  <span
                    aria-hidden
                    className="mt-3 block max-w-[16ch] text-balance font-sans text-[0.6rem] leading-[1.5] tracking-wide-sm text-mute uppercase"
                  >
                    {stat.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-9 font-sans text-micro text-faint uppercase">
            {CONTACT.addressLines.join(' · ')}
          </p>
        </div>
      </div>
    </section>
  );
}
