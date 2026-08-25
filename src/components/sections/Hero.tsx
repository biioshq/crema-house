'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import { BackgroundVideo } from '@/components/media/BackgroundVideo';
import { Magnetic } from '@/components/motion/Magnetic';
import { Button } from '@/components/ui/button';
import { useSmoothScroll } from '@/components/layout/SmoothScroll';
import { gsap, useGsap } from '@/hooks/useGsap';
import { useIsoLayoutEffect } from '@/hooks/useIsoLayoutEffect';
import { useHasFinePointer, useIsDesktop, useMotionOK } from '@/hooks/useMediaQuery';
import { usePointerTracking } from '@/hooks/usePointer';
import { splitText } from '@/lib/split';
import { VIDEOS } from '@/lib/media';
import { SITE } from '@/lib/site';

// Three.js never blocks first paint, and never ships to devices that will
// not run it well.
const BeanField = dynamic(
  () => import('@/components/three/BeanField').then((m) => m.BeanField),
  { ssr: false }
);

/**
 * HERO
 *
 * The composition is centred, not left-aligned: an eyebrow between two
 * hairlines, a two-line editorial headline, a lede, and two floating
 * actions. Four layers each answer the pointer at a different rate, so the
 * scene has depth rather than a single flat parallax.
 */
export function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const { scrollTo } = useSmoothScroll();

  const motionOK = useMotionOK();
  const isDesktop = useIsDesktop();
  const finePointer = useHasFinePointer();

  usePointerTracking();

  // The WebGL field is held back until after first paint so it never competes
  // with the hero's own entrance or with LCP.
  const [warm, setWarm] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setWarm(true), 700);
    return () => window.clearTimeout(id);
  }, []);

  const showBeans = warm && isDesktop && motionOK;

  // --- Entrance -----------------------------------------------------------
  useIsoLayoutEffect(() => {
    const title = titleRef.current;
    const ctx = gsap.context(() => {
      const split = title ? splitText(title, { chars: true, lines: false }) : null;

      if (!motionOK) {
        gsap.set(
          [
            '.hero-video-layer',
            '.hero-eyebrow-text',
            '.hero-lede',
            '.hero-cta-item',
            '.hero-foot',
          ],
          { opacity: 1, clearProps: 'transform,filter' }
        );
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      tl
        // The footage arrives slowly and keeps pushing in after it lands.
        .fromTo(
          '.hero-video-layer',
          { opacity: 0, scale: 1.34 },
          { opacity: 1, duration: 2.1, ease: 'power2.out' },
          0
        )
        .to('.hero-video-layer', { scale: 1.14, duration: 3.4, ease: 'power2.out' }, 0)

        .fromTo(
          '.hero-rule',
          { scaleX: 0 },
          { scaleX: 1, duration: 1.5, ease: 'power3.inOut' },
          0.3
        )
        .fromTo(
          '.hero-eyebrow-text',
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 1 },
          0.5
        )

        // Lines rise out of their masks…
        .fromTo(
          '.hero-line-inner',
          { yPercent: 120 },
          { yPercent: 0, duration: 1.5, stagger: 0.13, ease: 'expo.out' },
          0.55
        );

      // …while every letter independently resolves out of blur.
      if (split?.chars.length) {
        tl.fromTo(
          split.chars,
          { filter: 'blur(16px)', opacity: 0.2 },
          {
            filter: 'blur(0px)',
            opacity: 1,
            duration: 1.35,
            stagger: 0.013,
            ease: 'power2.out',
            onComplete: () => gsap.set(split.chars, { clearProps: 'filter,willChange' }),
          },
          0.72
        );
      }

      tl.fromTo('.hero-lede', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 1.2 }, 1.3)
        .fromTo(
          '.hero-cta-item',
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 1.1, stagger: 0.1 },
          1.45
        )
        .fromTo(
          '.hero-foot',
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 1, stagger: 0.12 },
          1.65
        );

      return () => split?.revert();
    }, rootRef);

    return () => ctx.revert();
  }, [motionOK]);

  // --- Pointer parallax ---------------------------------------------------
  // One ticker, six depths. Nothing here triggers a React render.
  useIsoLayoutEffect(() => {
    if (!motionOK || !finePointer) return;

    const root = rootRef.current;
    if (!root) return;

    const layers: Array<{ el: HTMLElement | null; x: number; y: number; rotate?: number }> = [
      { el: root.querySelector('.hero-video-mouse'), x: 18, y: 12 },
      { el: root.querySelector('.hero-aroma'), x: -46, y: -30 },
      { el: root.querySelector('.hero-copy-mouse'), x: -22, y: -14 },
      { el: root.querySelector('.hero-cta'), x: -12, y: -8 },
    ];

    const setters = layers
      .filter((layer): layer is { el: HTMLElement; x: number; y: number; rotate?: number } =>
        Boolean(layer.el)
      )
      .map((layer) => ({
        ...layer,
        setX: gsap.quickTo(layer.el, 'x', { duration: 1.1, ease: 'power3.out' }),
        setY: gsap.quickTo(layer.el, 'y', { duration: 1.1, ease: 'power3.out' }),
        setR: layer.rotate
          ? gsap.quickTo(layer.el, 'rotation', { duration: 1.4, ease: 'power3.out' })
          : null,
      }));

    let nx = 0;
    let ny = 0;

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      nx = (event.clientX / window.innerWidth) * 2 - 1;
      ny = (event.clientY / window.innerHeight) * 2 - 1;

      for (const layer of setters) {
        layer.setX(nx * layer.x);
        layer.setY(ny * layer.y);
        layer.setR?.(nx * (layer.rotate ?? 0));
      }
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [motionOK, finePointer]);

  // --- Scroll dolly-out ---------------------------------------------------
  useGsap(
    () => {
      if (!motionOK) return;

      gsap
        .timeline({
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.9,
          },
        })
        .to('.hero-video-scroll', { scale: 1.16, yPercent: 8, ease: 'none' }, 0)
        .to('.hero-copy', { yPercent: -14, opacity: 0, ease: 'none' }, 0)
        .to('.hero-foot-row', { opacity: 0, y: 30, ease: 'none' }, 0);
    },
    [motionOK],
    rootRef
  );

  return (
    <section
      ref={rootRef}
      id="top"
      className="relative isolate flex h-[100svh] min-h-[38rem] w-full items-center overflow-hidden"
    >
      {/* ---------- Layer 1 · footage ---------- */}
      <div className="hero-video-layer absolute inset-0 z-0 opacity-0 will-change-transform">
        <div className="hero-video-scroll size-full">
          <div className="hero-video-mouse size-full scale-[1.06]">
            <BackgroundVideo
              src={VIDEOS.hero}
              eager
              playbackRate={0.68}
              // Graded with a filter rather than an opaque cover, so the
              // footage keeps its warmth instead of going flat grey.
              className="[filter:brightness(0.34)_saturate(0.92)_contrast(1.06)]"
            />
          </div>
        </div>
      </div>

      {/* ---------- Layer 2 · grade ----------
          Dark at the edges for legibility, almost clear through the middle
          band where the aperture sits. */}
      <div
        aria-hidden
        className="absolute inset-0 z-[1]"
        style={{
          background:
            'linear-gradient(180deg, rgb(10 7 5 / 0.92) 0%, rgb(10 7 5 / 0.30) 34%, rgb(10 7 5 / 0.18) 52%, rgb(10 7 5 / 0.62) 78%, rgb(10 7 5 / 0.98) 100%)',
        }}
      />

      {/* ---------- Layer 3 · aroma ---------- */}
      <div aria-hidden className="hero-aroma absolute inset-0 z-[2] will-change-transform">
        <div
          className="absolute top-[46%] left-1/2 aspect-square w-[min(140vw,72rem)] -translate-x-1/2 -translate-y-1/2 motion-safe:animate-drift"
          style={{
            background:
              'radial-gradient(circle, rgb(192 138 62 / 0.13) 0%, rgb(120 80 34 / 0.06) 40%, transparent 68%)',
          }}
        />
        <div
          className="absolute top-[70%] left-[24%] aspect-square w-[min(70vw,30rem)] -translate-x-1/2 -translate-y-1/2"
          style={{
            background: 'radial-gradient(circle, rgb(231 178 105 / 0.09) 0%, transparent 66%)',
          }}
        />
      </div>

      {/* ---------- Layer 4 · beans ---------- */}
      {showBeans && (
        <BeanField className="pointer-events-none absolute inset-0 z-[3] opacity-50" />
      )}

      {/* ---------- Layer 4b · copy scrim ----------
          Sits low and wide, under the lede and the actions only. The
          headline band is left clear so the aperture keeps its full
          contrast against the footage. */}
      <div
        aria-hidden
        className="absolute inset-0 z-[4]"
        style={{
          background:
            'radial-gradient(72% 32% at 50% 74%, rgb(10 7 5 / 0.62) 0%, rgb(10 7 5 / 0.34) 52%, transparent 78%)',
        }}
      />

      {/* ---------- Layer 5 · composition ---------- */}
      <div className="hero-copy relative z-10 w-full will-change-transform">
        <div className="hero-copy-mouse shell flex flex-col items-center text-center">
          {/* Eyebrow between two hairlines */}
          <div className="flex w-full items-center justify-center gap-4 sm:gap-6">
            <span className="hero-rule h-px w-[clamp(1.5rem,10vw,9rem)] origin-right bg-linear-to-l from-gold/55 to-transparent" />
            <span className="hero-eyebrow-text eyebrow whitespace-nowrap opacity-0">
              Mumbai · Single Origin
            </span>
            <span className="hero-rule h-px w-[clamp(1.5rem,10vw,9rem)] origin-left bg-linear-to-r from-gold/55 to-transparent" />
          </div>

          {/* Headline with a live aperture cut into the second line */}
          <h1
            ref={titleRef}
            className="mt-7 text-display text-porcelain sm:mt-9"
            style={{ textShadow: '0 2px 40px rgb(10 7 5 / 0.55)' }}
          >
            <span className="split-line">
              <span className="hero-line-inner">The Slow Art</span>
            </span>
            <span className="split-line">
              <span className="hero-line-inner">of Coffee</span>
            </span>
          </h1>

          {/* Lede */}
          <p className="hero-lede mt-8 max-w-[46ch] text-balance font-sans text-lede text-crema/80 opacity-0 sm:mt-10">
            Fourteen grams. Ninety-four degrees. Twenty-six seconds. A decade spent
            removing everything that isn&rsquo;t the cup.
          </p>

          {/* Floating actions */}
          {/* Stacked and equal-width on a phone — two pills of different
              widths read as an accident at this size. */}
          <div className="hero-cta mx-auto mt-10 flex w-full max-w-[19rem] flex-col gap-3 sm:mt-12 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4">
            <span className="hero-cta-item block w-full opacity-0 sm:w-auto">
              <Magnetic className="block w-full sm:w-auto" strength={0.3} padding={34}>
                <Button asChild size="lg" variant="primary" className="w-full sm:w-auto">
                  <Link href="/menu">Explore the menu</Link>
                </Button>
              </Magnetic>
            </span>
            <span className="hero-cta-item block w-full opacity-0 sm:w-auto">
              <Magnetic className="block w-full sm:w-auto" strength={0.3} padding={34}>
                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                  <Link href="/reserve">Reserve a table</Link>
                </Button>
              </Magnetic>
            </span>
          </div>
        </div>
      </div>

      {/* ---------- Layer 6 · footer rail ---------- */}
      <div className="hero-foot-row absolute inset-x-0 bottom-0 z-10 pb-7 sm:pb-9">
        <div className="shell flex items-end justify-between gap-6">
          <button
            type="button"
            onClick={() => scrollTo('#story')}
            className="hero-foot group flex items-center gap-3 py-2 -my-2 opacity-0"
            aria-label="Scroll to the story"
          >
            <span className="relative block h-10 w-px overflow-hidden bg-crema/18">
              <span className="absolute inset-x-0 top-0 h-1/2 bg-linear-to-b from-transparent to-gold-lit motion-safe:animate-[drift_2.6s_ease-in-out_infinite_alternate]" />
            </span>
            <span className="font-sans text-micro text-ash uppercase transition-colors duration-500 group-hover:text-crema">
              Scroll
            </span>
            <ArrowDown
              className="size-3 text-gold transition-transform duration-500 group-hover:translate-y-1"
              strokeWidth={1.5}
            />
          </button>

          <div className="hero-foot hidden items-center gap-3 opacity-0 sm:flex">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full rounded-full bg-gold-lit opacity-70 motion-safe:animate-pulse-soft" />
              <span className="relative inline-flex size-1.5 rounded-full bg-gold-lit" />
            </span>
            <span className="font-sans text-micro text-ash uppercase">
              Open now · until 22:00
            </span>
          </div>
        </div>
      </div>

      {/* Screen-reader summary of a scene that is otherwise all decoration. */}
      <span className="sr-only">
        {SITE.name}. {SITE.description}
      </span>
    </section>
  );
}
