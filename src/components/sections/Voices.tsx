'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { SplitHeading } from '@/components/motion/SplitHeading';
import { BeanDust } from '@/components/motion/BeanDust';
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
 * Not a testimonial rail. Five glass panels float at different offsets and
 * each one's rotation is a pure function of how far it sits from the centre
 * of the viewport: they turn towards you as they arrive, lie flat as they
 * pass, and turn away again. Scroll position drives the whole thing, so the
 * motion is reversible, frame-accurate, and never "plays" twice.
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

          // -1 well below the fold, 0 dead centre, +1 well above it.
          const distance = (metric.top + metric.height / 2 - centre) / viewport;
          const t = Math.max(-1.4, Math.min(1.4, distance));
          const side = voice.offset < 0 ? -1 : 1;

          setter.rotateX(-t * 13);
          setter.rotateY(side * Math.abs(t) * 9);
          setter.rotateZ(side * t * 1.6);
          setter.z(-Math.abs(t) * 90);
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

      // Entrance — the panels lift in, then hand over to the scroll rotation.
      cards.forEach((card) => {
        gsap.fromTo(
          card.querySelector('.voice-card-surface'),
          { opacity: 0, y: 46, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.3,
            ease: 'power4.out',
            scrollTrigger: { trigger: card, start: 'top 88%', once: true },
          }
        );
      });

      if (cta) {
        gsap.fromTo(
          '.voices-cta',
          { opacity: 0, y: 24 },
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
      {/* Something worth seeing *through* the glass. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[10%] -z-10 h-[80%]"
        style={{
          background:
            'radial-gradient(52% 44% at 50% 42%, rgb(192 138 62 / 0.26) 0%, rgb(120 80 34 / 0.12) 45%, transparent 74%)',
        }}
      />
      <BeanDust count={9} opacity={0.32} seed={0x901c} className="-z-10" />

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

        {/* Perspective lives on the container so all five panels share one
            vanishing point — otherwise each would rotate in its own world. */}
        <div
          className={[
            'relative flex flex-col items-center gap-14 lg:gap-20',
            showHeader ? 'mt-20 lg:mt-28' : '',
          ].join(' ')}
          style={{ perspective: 1500 }}
        >
          {items.map((voice, index) => (
            <figure
              key={voice.name}
              className="voice-card w-full max-w-[34rem] will-change-transform lg:max-w-[38rem]"
              style={{
                transformStyle: 'preserve-3d',
                // Alternating offsets keep the column from reading as a list —
                // but only where there is room for them. On a phone the card
                // already spans the gutters, so any offset pushes it off-screen.
                translate: isDesktop ? `${voice.offset * 0.55}% 0` : undefined,
              }}
            >
              <div className="voice-card-surface glass relative rounded-lg p-8 backdrop-blur-md sm:p-10">
                {/* Quotation mark, set as a graphic rather than punctuation. */}
                <span
                  aria-hidden
                  className="display-face absolute -top-1 left-6 text-[5rem] leading-none text-gold/30 select-none sm:left-8"
                >
                  &ldquo;
                </span>

                <blockquote className="relative">
                  <p className="display-face text-[clamp(1.3rem,2.5vw,1.95rem)] leading-[1.45] text-porcelain">
                    {voice.quote}
                  </p>
                </blockquote>

                {/* The index sits in the caption row rather than pinned to the
                    corner — on a one-line quote an absolute index collides
                    with the attribution. */}
                <figcaption className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span aria-hidden className="h-px w-8 shrink-0 bg-gold/70" />
                  <span className="font-sans text-micro text-crema uppercase">
                    {voice.name}
                  </span>
                  <span className="font-sans text-[0.65rem] tracking-wide-sm text-ash normal-case">
                    {voice.detail}
                  </span>
                  <span
                    aria-hidden
                    className="ml-auto hidden font-sans text-micro text-ember tabular-nums sm:block"
                  >
                    {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
                  </span>
                </figcaption>
              </div>
            </figure>
          ))}
        </div>

        {cta && (
          <div className="voices-cta mt-16 flex justify-center opacity-0 lg:mt-24">
            <Magnetic strength={0.3} padding={38}>
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
