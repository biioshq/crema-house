'use client';

import Link from 'next/link';
import { useRef, type ComponentType, type SVGProps } from 'react';
import { ArrowRight } from 'lucide-react';
import { Magnetic } from '@/components/motion/Magnetic';
import { Button } from '@/components/ui/button';
import { Blossom, Daisy } from '@/components/illustrations/Florals';
import { Sprig } from '@/components/illustrations/Foliage';
import { Heart, Sparkle } from '@/components/illustrations/Doodles';
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

type Pressed = {
  Art: ComponentType<SVGProps<SVGSVGElement>>;
  /** Size and a small tilt, so no two pressed flowers sit the same way. */
  className: string;
};

/**
 * The pressed flowers tucked into each card's corner, cycled by index. They
 * alternate sides with the card (right on even cards, left on odd ones) and
 * hang mostly outside the surface, so they never sit on the quote itself.
 */
const PRESSED: readonly Pressed[] = [
  { Art: Daisy, className: 'size-16 rotate-[14deg] sm:size-20' },
  { Art: Blossom, className: 'size-16 -rotate-[10deg] sm:size-24' },
  { Art: Sprig, className: 'h-10 w-20 -rotate-[28deg] sm:h-12 sm:w-24' },
];

/**
 * Wraps the last word of the heading in the clay italic accent. The heading
 * stays a plain string prop; the accent is purely presentational.
 */
function accentLastWord(text: string) {
  const at = text.trimEnd().lastIndexOf(' ');
  if (at < 0) return <em className="accent">{text}</em>;
  return (
    <>
      {text.slice(0, at + 1)}
      <em className="accent">{text.slice(at + 1)}</em>
    </>
  );
}

/**
 * SECTION "Voices"
 *
 * Not a testimonial rail. The cards are pages from a scrapbook, each with a
 * pressed flower in one corner, and each one's rotation is a pure function of
 * how far it sits from the centre of the viewport: they turn towards you as
 * they arrive, lie flat as they pass, and turn away again. Scroll position
 * drives all of it, so the motion is reversible, frame-accurate, and never
 * "plays" twice.
 *
 * The rotation is computed from cached offsets rather than a per-frame
 * getBoundingClientRect on every card, so scrolling never forces layout.
 *
 * Text reveals are declarative (`data-text`) and run by the shared
 * RevealRunner, as are the flowers (`data-ill`). This component only owns
 * the card surfaces: their lift-in and the scroll-driven tilt.
 */
export function Voices({
  items = VOICES,
  eyebrow = 'Voices',
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
          // that leans hard reads as broken rather than as deep; the tilt
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

      // Entrance: the paper lifts in, then hands over to the scroll rotation.
      // The words on it reveal on their own through `data-text`.
      cards.forEach((card) => {
        gsap.fromTo(
          card.querySelector('.voice-card-surface'),
          { opacity: 0, y: 42, scale: 0.97 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.4,
            ease: 'power4.out',
            scrollTrigger: { trigger: card, start: 'top 86%', once: true },
          }
        );
      });

      return () => trigger.kill();
    },
    [motionOK, isDesktop, items],
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
          <header className="relative mx-auto max-w-[46rem] text-center">
            <p data-text="write" className="eyebrow">
              {eyebrow}
            </p>
            <h2 id="voices-heading" data-text="flip" data-text-start="top 84%" className="mt-5 text-h2">
              {accentLastWord(heading)}
            </h2>
            {/* A little spark of warmth beside the heading, from tablet up. */}
            <Sparkle
              data-ill
              data-ill-delay="0.5"
              className="pointer-events-none absolute -top-2 right-2 hidden size-7 sm:block lg:-right-6"
            />
          </header>
        )}

        {/* Perspective lives on the container so every page shares one
            vanishing point; otherwise each would rotate in its own world. */}
        <div
          className={[
            'voices-stack relative flex flex-col items-center gap-12 lg:gap-16',
            showHeader ? 'mt-14 lg:mt-20' : '',
          ].join(' ')}
          style={{ perspective: 1600 }}
        >
          {items.map((voice, index) => {
            const right = index % 2 === 0;
            const pressed = PRESSED[index % PRESSED.length]!;
            const { Art } = pressed;
            const Mark = index % 2 === 0 ? Heart : Sparkle;

            return (
              <figure
                key={voice.name}
                className="voice-card relative w-full max-w-[36rem] will-change-transform lg:max-w-[42rem]"
                style={{
                  transformStyle: 'preserve-3d',
                  // Alternating offsets keep the column from reading as a list,
                  // but only where there is room for them. On a phone the card
                  // already spans the gutters, so any offset pushes it off-screen.
                  translate: isDesktop ? `${voice.offset * 0.7}% 0` : undefined,
                }}
              >
                <div className="voice-card-surface card-surface relative rounded-lg px-8 pt-9 pb-9 sm:px-12 sm:pt-10 sm:pb-11">
                  {/* Quotation mark, set as a graphic rather than as
                      punctuation: large enough that the quote reads as set
                      inside it. It sits on the side away from the flower. */}
                  <span
                    aria-hidden
                    data-text="pop"
                    data-text-delay="0.2"
                    className={[
                      'voice-mark pointer-events-none absolute -top-3 font-display text-[8rem] leading-none font-normal text-clay/35 italic select-none sm:text-[10rem]',
                      right ? 'left-5 sm:left-8' : 'right-5 sm:right-8',
                    ].join(' ')}
                  >
                    &ldquo;
                  </span>

                  <blockquote className="relative">
                    <p
                      data-text="words"
                      className="display-face text-[clamp(1.4rem,2.7vw,2.15rem)] leading-[1.4] text-ink"
                    >
                      {voice.quote}
                    </p>
                  </blockquote>

                  {/* No divider: the gap and a tiny inked heart or spark do
                      the separating. The index sits in the caption row rather
                      than pinned to a corner, since on a one-line quote an
                      absolute index collides with the attribution. */}
                  <figcaption
                    data-text="fade"
                    data-text-delay="0.25"
                    className="mt-9 flex flex-wrap items-center gap-x-3 gap-y-2"
                  >
                    <Mark className="size-4 shrink-0" />
                    <span className="font-sans text-[0.78rem] text-ink uppercase">{voice.name}</span>
                    <span className="font-sans text-[0.8rem] text-ink-soft normal-case">
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

                {/* The pressed flower, tucked over the top corner. It lives
                    outside the surface so the paper's lift-in and the
                    flower's own draw-on never fight over opacity. */}
                <Art
                  data-ill
                  data-ill-delay="0.35"
                  className={[
                    'pointer-events-none absolute -top-7 z-10 sm:-top-9',
                    // Mirrored with the CSS `scale` property on the left, which
                    // leaves `transform` free for the runner's own tweens.
                    right ? '-right-2 sm:-right-7' : '-left-2 -scale-x-100 sm:-left-7',
                    pressed.className,
                  ].join(' ')}
                />
              </figure>
            );
          })}
        </div>

        {cta && (
          <div data-text="fade" className="voices-cta mt-12 flex justify-center lg:mt-16">
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
