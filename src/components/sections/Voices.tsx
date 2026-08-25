'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { SplitHeading } from '@/components/motion/SplitHeading';
import { Magnetic } from '@/components/motion/Magnetic';
import { Button } from '@/components/ui/button';
import { gsap, ScrollTrigger, useGsap } from '@/hooks/useGsap';
import { useIsDesktop, useMotionOK } from '@/hooks/useMediaQuery';
import { VOICES, type Voice } from '@/lib/voices';

type VoicesProps = {
  /** Defaults to all five. */
  items?: readonly Voice[];
  eyebrow?: string;
  heading?: string;
  cta?: { label: string; href: string };
  showHeader?: boolean;
  id?: string;
};

/**
 * SECTION 05 — "Voices"
 *
 * Not a testimonial rail. The cards are pages, hung off a single gold thread
 * that runs the height of the section, and each one's rotation is a pure
 * function of how far it sits from the centre of the viewport: they turn
 * towards you as they arrive, lie flat as they pass, and turn away again.
 * Scroll position drives all of it, so the motion is reversible,
 * frame-accurate, and never "plays" twice.
 *
 * The rotation is computed from cached offsets rather than a per-frame
 * getBoundingClientRect on every card, so scrolling never forces layout.
 */
export function Voices({
  items = VOICES,
  eyebrow = '05 — Voices',
  heading = 'What the room says back.',
  cta,
  showHeader = true,
  id = 'voices',
}: VoicesProps) {
  const rootRef = useRef<HTMLElement>(null);
  const motionOK = useMotionOK();
  const isDesktop = useIsDesktop();

  useGsap(
    () => {
      const root = rootRef.current;
      if (!root || !motionOK) return;

      const cards = gsap.utils.toArray<HTMLElement>('.voice-card');
      if (!cards.length) return;

      // Cached geometry, refreshed whenever ScrollTrigger recalculates.
      let metrics: Array<{ top: number; height: number }> = [];

      const measure = () => {
        metrics = cards.map((card) => {
          const rect = card.getBoundingClientRect();
          return { top: rect.top + window.scrollY, height: rect.height };
        });
      };

      const setters = cards.map((card) => ({
        rotateX: gsap.quickSetter(card, 'rotationX', 'deg'),
        rotateY: gsap.quickSetter(card, 'rotationY', 'deg'),
        rotateZ: gsap.quickSetter(card, 'rotationZ', 'deg'),
        z: gsap.quickSetter(card, 'z', 'px'),
      }));

      const update = () => {
        const viewport = window.innerHeight;
        const centre = window.scrollY + viewport / 2;

        for (let i = 0; i < cards.length; i += 1) {
          const metric = metrics[i];
          const setter = setters[i];
          const voice = items[i];
          if (!metric || !setter || !voice) continue;

          // Four transform writes per card per scroll tick, for cards that are
          // nowhere near the screen. The last transform simply stays where it
          // was, which is invisible by definition.
          const screenTop = metric.top - window.scrollY;
          if (screenTop + metric.height < -200 || screenTop > viewport + 200) continue;

          // -1 well below the fold, 0 dead centre, +1 well above it.
          const distance = (metric.top + metric.height / 2 - centre) / viewport;
          const t = Math.max(-1.4, Math.min(1.4, distance));
          const side = voice.offset < 0 ? -1 : 1;

          // A third of the amplitude of the dark version. On paper, a card
          // that leans hard reads as broken rather than as deep — the tilt
          // only has to be enough to catch the shadow.
          setter.rotateX(-t * 4.5);
          setter.rotateY(side * Math.abs(t) * 3);
          setter.rotateZ(side * t * 0.6);
          setter.z(-Math.abs(t) * 42);
        }
      };

      measure();
      update();

      const trigger = ScrollTrigger.create({
        trigger: root,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: update,
        onRefresh: () => {
          measure();
          update();
        },
      });

      // The thread draws itself down the section before the pages arrive.
      gsap.fromTo(
        '.voices-thread',
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: '.voices-stack',
            start: 'top 78%',
            end: 'bottom 82%',
            scrub: 1,
          },
        }
      );

      // Entrance — the pages lift in, then hand over to the scroll rotation.
      cards.forEach((card) => {
        gsap
          .timeline({ scrollTrigger: { trigger: card, start: 'top 86%', once: true } })
          .fromTo(
            card.querySelector('.voice-card-surface'),
            { opacity: 0, y: 42, scale: 0.97 },
            { opacity: 1, y: 0, scale: 1, duration: 1.4, ease: 'power4.out' },
            0
          )
          .fromTo(
            card.querySelector('.voice-mark'),
            { opacity: 0, scale: 0.8, rotate: -6 },
            { opacity: 1, scale: 1, rotate: 0, duration: 1.6, ease: 'power4.out' },
            0.2
          );
      });

      if (cta) {
        gsap.fromTo(
          '.voices-cta',
          { opacity: 0, y: 22 },
          {
            opacity: 1,
            y: 0,
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: { trigger: '.voices-cta', start: 'top 94%', once: true },
          }
        );
      }

      return () => trigger.kill();
    },
    [motionOK, isDesktop, items, Boolean(cta)],
    rootRef
  );

  return (
    <section
      ref={rootRef}
      id={id}
      aria-labelledby={showHeader ? 'voices-heading' : undefined}
      aria-label={showHeader ? undefined : 'Voices'}
      className="relative isolate overflow-hidden py-section"
    >
      {/* A broad band of oat, so this reads as a different room from the
          gallery above it. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(180deg, rgb(243 238 229 / 0) 0%, rgb(243 238 229 / 0.9) 18%, rgb(243 238 229 / 0.9) 82%, rgb(243 238 229 / 0) 100%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[12%] -z-10 h-[76%]"
        style={{
          background:
            'radial-gradient(44% 40% at 50% 40%, rgb(252 249 243 / 0.55) 0%, rgb(241 231 213 / 0.32) 52%, transparent 76%)',
        }}
      />

      <div className="shell">
        {showHeader && (
          <header className="mx-auto max-w-[46rem] text-center">
            <p className="eyebrow">{eyebrow}</p>
            <SplitHeading
              as="h2"
              id="voices-heading"
              mode="mask-wipe"
              start="top 84%"
              className="mt-7 text-h2"
            >
              {heading}
            </SplitHeading>
          </header>
        )}

        {/* Perspective lives on the container so every page shares one
            vanishing point — otherwise each would rotate in its own world. */}
        <div
          className={[
            'voices-stack relative flex flex-col items-center gap-10 lg:gap-14',
            showHeader ? 'mt-14 lg:mt-20' : '',
          ].join(' ')}
          style={{ perspective: 1600 }}
        >
          {/* The thread the pages hang from. */}
          <span
            aria-hidden
            className="voices-thread pointer-events-none absolute inset-y-0 left-1/2 hidden w-px origin-top -translate-x-1/2 lg:block"
            style={{
              background:
                'linear-gradient(180deg, transparent, rgb(196 154 82 / 0.42) 12%, rgb(196 154 82 / 0.42) 88%, transparent)',
            }}
          />

          {items.map((voice, index) => (
            <figure
              key={voice.name}
              className="voice-card relative w-full max-w-[36rem] will-change-transform lg:max-w-[42rem]"
              style={{
                transformStyle: 'preserve-3d',
                // Alternating offsets keep the column from reading as a list —
                // but only where there is room for them. On a phone the card
                // already spans the gutters, so any offset pushes it off-screen.
                translate: isDesktop ? `${voice.offset * 0.7}% 0` : undefined,
              }}
            >
              <div className="voice-card-surface card-surface relative rounded-lg px-8 pt-9 pb-9 sm:px-12 sm:pt-10 sm:pb-11">
                {/* Quotation mark, set as a graphic rather than as punctuation —
                    large enough that the quote reads as set *inside* it. */}
                <span
                  aria-hidden
                  className="voice-mark display-face pointer-events-none absolute -top-2 left-5 text-[8rem] leading-none text-gold/25 select-none sm:left-8 sm:text-[10rem]"
                >
                  &ldquo;
                </span>

                <blockquote className="relative">
                  <p className="display-face text-[clamp(1.4rem,2.7vw,2.15rem)] leading-[1.4] text-ink">
                    {voice.quote}
                  </p>
                </blockquote>

                <div aria-hidden className="mt-9 h-px w-full bg-hair-soft" />

                {/* The index sits in the caption row rather than pinned to a
                    corner — on a one-line quote an absolute index collides
                    with the attribution. */}
                <figcaption className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span aria-hidden className="h-px w-8 shrink-0 bg-gold" />
                  <span className="font-sans text-micro text-ink uppercase">{voice.name}</span>
                  <span className="font-sans text-[0.68rem] tracking-wide-sm text-mute normal-case">
                    {voice.detail}
                  </span>
                  <span
                    aria-hidden
                    className="ml-auto hidden font-sans text-micro text-faint tabular-nums sm:block"
                  >
                    {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
                  </span>
                </figcaption>
              </div>
            </figure>
          ))}
        </div>

        {cta && (
          <div className="voices-cta reveal mt-12 flex justify-center lg:mt-16">
            <Magnetic strength={0.28} padding={38}>
              <Button asChild size="lg" variant="outline">
                <Link href={cta.href}>
                  {cta.label}
                  <ArrowRight className="size-4" strokeWidth={1.5} />
                </Link>
              </Button>
            </Magnetic>
          </div>
        )}
      </div>
    </section>
  );
}
