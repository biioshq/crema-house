'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { BackgroundVideo } from '@/components/media/BackgroundVideo';
import { Magnetic } from '@/components/motion/Magnetic';
import { Button } from '@/components/ui/button';
import { gsap, useGsap } from '@/hooks/useGsap';
import { useIsoLayoutEffect } from '@/hooks/useIsoLayoutEffect';
import { useHasFinePointer, useMotionOK } from '@/hooks/useMediaQuery';
import { VIDEOS } from '@/lib/media';
import { SITE } from '@/lib/site';

/** The footage is 16:9. */
const VIDEO_AR = 16 / 9;

/**
 * Where the sculpted lettering sits inside the frame, normalised to it.
 *
 * Measured off the footage: "The" caps begin about 8.5% down, "of Coffee" ends
 * about 98.5% down, and horizontally the words run from roughly 20% to 98.5%.
 * Everything outside that box is wall, table and falling beans — croppable.
 */
const TEXT = { top: 0.085, bottom: 0.985, left: 0.2, right: 0.985 };

/**
 * Fill the frame without cutting the words.
 *
 * `object-fit: cover` always crops the overflowing axis from *both* ends
 * equally, which is exactly wrong here: the frame carries a generous empty
 * margin on one side of the lettering and almost none on the other. So the
 * crop is aimed instead — the visible window slides until it holds the whole
 * text box, and is only centred on the text when the window is genuinely too
 * small to contain it. That is the difference between "of Coffee" sitting a
 * few pixels inside the bottom edge and being sliced off it.
 *
 * Returns the `object-position` percentage for the cropped axis.
 */
function aimCrop(visible: number, near: number, far: number): number {
  // How far the window can travel inside the source.
  const travel = 1 - visible;
  if (travel <= 0.0001) return 0.5;

  const span = far - near;
  const start =
    visible >= span
      ? // Roomy: anywhere between flush with the far edge of the text and
        // flush with the near edge works. Sit in the middle of that range.
        (far - visible + near) / 2
      : // Tight: nothing can hold all of it, so lose as little as possible
        // from each end.
        (near + far) / 2 - visible / 2;

  return Math.min(Math.max(start, 0), travel) / travel;
}

/**
 * HERO
 *
 * The footage carries the headline — the words are set in the film — so the
 * one thing this section must never do is crop them. It is full-bleed all the
 * same: `cover` fills the screen edge to edge with no bars, and `aimCrop`
 * points the crop at the empty margins so the lettering survives it.
 *
 * Two consequences worth knowing before editing:
 *
 * - The picture carries no transform once it has landed. A pointer drift or a
 *   scroll dolly would push the words back out of frame, so the motion lives
 *   in the copy instead.
 * - Nothing heavy sits over the lower sixth. "of Coffee" runs along the foot
 *   of the frame, so the copy is held clear of it and stands on a soft oval of
 *   its own rather than on a full-width wash.
 */
export function Hero() {
  const rootRef = useRef<HTMLElement>(null);

  const motionOK = useMotionOK();
  const finePointer = useHasFinePointer();

  // --- Aim the crop -------------------------------------------------------
  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const video = root.querySelector<HTMLVideoElement>('video');
    if (!video) return;

    const apply = () => {
      const { width, height } = root.getBoundingClientRect();
      if (!width || !height) return;

      const aspect = width / height;

      // Below about 5:4 the screen is so much narrower than the frame that a
      // cover crop would take most of the words with it. Nothing is worth
      // that, so the frame becomes a band at the head of the section and the
      // copy takes the paper underneath.
      if (aspect < 1.25) {
        video.style.objectFit = 'contain';
        video.style.objectPosition = '50% 0%';
        return;
      }

      video.style.objectFit = 'cover';

      if (aspect >= VIDEO_AR) {
        // Wider than the frame: cover scales to the width and crops height.
        const visible = VIDEO_AR / aspect;
        const p = aimCrop(visible, TEXT.top, TEXT.bottom);
        video.style.objectPosition = `50% ${(p * 100).toFixed(2)}%`;
      } else {
        // Taller than the frame: cover scales to the height and crops width.
        const visible = aspect / VIDEO_AR;
        const p = aimCrop(visible, TEXT.left, TEXT.right);
        video.style.objectPosition = `${(p * 100).toFixed(2)}% 50%`;
      }
    };

    apply();

    const observer = new ResizeObserver(apply);
    observer.observe(root);

    return () => observer.disconnect();
  }, []);

  // --- Entrance -----------------------------------------------------------
  useIsoLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (!motionOK) {
        gsap.set(
          ['.hero-stage', '.hero-eyebrow-text', '.hero-lede', '.hero-cta-item', '.hero-foot'],
          { opacity: 1 }
        );
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      // The push-in resolves *to* 1, never past it, so the frame is whole from
      // the moment it settles and stays whole.
      tl.fromTo(
        '.hero-stage',
        { opacity: 0, scale: 1.06 },
        { opacity: 1, scale: 1, duration: 2.2, ease: 'power2.out' },
        0
      )
        .fromTo('.hero-rule', { scaleX: 0 }, { scaleX: 1, duration: 1.5, ease: 'power3.inOut' }, 0.6)
        .fromTo('.hero-eyebrow-text', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 1 }, 0.75)
        .fromTo(
          '.hero-lede',
          { opacity: 0, y: 26, rotateX: -12 },
          { opacity: 1, y: 0, rotateX: 0, duration: 1.3 },
          0.95
        )
        .fromTo(
          '.hero-cta-item',
          { opacity: 0, y: 28, rotateX: -14 },
          { opacity: 1, y: 0, rotateX: 0, duration: 1.2, stagger: 0.11 },
          1.1
        )
        .fromTo('.hero-foot', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 1 }, 1.4);
    }, rootRef);

    return () => ctx.revert();
  }, [motionOK]);

  // --- Pointer parallax ---------------------------------------------------
  // The copy only. One listener, no React renders. The picture is deliberately
  // left out: every pixel it moved would be a pixel of the lettering lost.
  useIsoLayoutEffect(() => {
    if (!motionOK || !finePointer) return;

    const root = rootRef.current;
    if (!root) return;

    const front = root.querySelector<HTMLElement>('.hero-front');
    if (!front) return;

    const moveX = gsap.quickTo(front, 'x', { duration: 1.2, ease: 'power3.out' });
    const moveY = gsap.quickTo(front, 'y', { duration: 1.2, ease: 'power3.out' });
    const turnY = gsap.quickTo(front, 'rotationY', { duration: 1.4, ease: 'power3.out' });
    const turnX = gsap.quickTo(front, 'rotationX', { duration: 1.4, ease: 'power3.out' });

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      const nx = (event.clientX / window.innerWidth) * 2 - 1;
      const ny = (event.clientY / window.innerHeight) * 2 - 1;

      moveX(nx * -20);
      moveY(ny * -12);
      turnY(nx * 2.6);
      turnX(-ny * 1.8);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [motionOK, finePointer]);

  // --- Scroll hand-off ----------------------------------------------------
  useGsap(
    () => {
      if (!motionOK) return;

      gsap.to('.hero-front', {
        yPercent: -20,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.9,
        },
      });
    },
    [motionOK],
    rootRef
  );

  return (
    <section
      ref={rootRef}
      id="top"
      className="relative isolate h-svh min-h-140 w-full overflow-hidden"
      style={{ perspective: '1400px', backgroundColor: '#ebe4d8' }}
    >
      {/* ---------- The picture ----------
          `object-fit` and `object-position` are both set from JS — see
          `aimCrop`. Classes here would only fight it. */}
      <div className="hero-stage reveal absolute inset-0 will-change-[opacity,transform]">
        <BackgroundVideo src={VIDEOS.hero1} eager playbackRate={0.85} />
      </div>

      {/* Portrait only: the frame is a band at the head of the section there,
          so this returns the rest of the screen to paper. It starts below the
          deepest that band can reach, so it never touches the lettering. */}
      <div
        aria-hidden
        className="hero-paper pointer-events-none absolute inset-0 z-1"
        style={{
          background:
            'linear-gradient(180deg, rgb(248 245 239 / 0) 33%, rgb(248 245 239 / 0.9) 42%, rgb(248 245 239 / 1) 50%)',
        }}
      />

      {/* ---------- The copy ---------- */}
      <div
        className="hero-front absolute inset-x-0 z-10 will-change-transform"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="shell flex justify-center">
          <div className="relative flex flex-col items-center text-center">
            {/* The copy stands on a soft oval of its own rather than on a
                full-width wash — a wash deep enough to carry this type would
                also be deep enough to erase "of Coffee" along the foot of the
                frame.

                The oval is painted on its own box, inset well outside the
                text: a gradient that has to reach the edge of its element is
                still half-opaque when it gets there, and that shows up as a
                straight edge across the picture. Given room, it finishes. */}
            <span
              aria-hidden
              className="pointer-events-none absolute -inset-x-16 -inset-y-12 -z-10"
              style={{
                background:
                  'radial-gradient(54% 56% at 50% 50%, rgb(248 245 239 / 0.92) 0%, rgb(248 245 239 / 0.6) 55%, rgb(248 245 239 / 0) 80%)',
              }}
            />
            <div className="flex w-full items-center justify-center gap-4 sm:gap-6">
              <span className="hero-rule h-px w-[clamp(1.5rem,9vw,8rem)] origin-right bg-linear-to-l from-gold/60 to-transparent" />
              <span className="hero-eyebrow-text eyebrow reveal whitespace-nowrap">
                Mumbai · Single Origin
              </span>
              <span className="hero-rule h-px w-[clamp(1.5rem,9vw,8rem)] origin-left bg-linear-to-r from-gold/60 to-transparent" />
            </div>

            <p className="hero-lede reveal mt-6 max-w-[56ch] text-balance font-sans text-body text-ink-soft">
              Fourteen grams. Ninety-four degrees. Twenty-six seconds. A decade spent
              removing everything that isn&rsquo;t the cup.
            </p>

            {/* Stacked and equal-width on a phone — two pills of different
                widths read as an accident at that size. */}
            <div className="mt-7 flex w-full max-w-76 flex-col gap-3 sm:mt-8 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4">
              <span className="hero-cta-item reveal block w-full sm:w-auto">
                <Magnetic className="block w-full sm:w-auto" strength={0.3} padding={36}>
                  <Button asChild size="lg" variant="primary" className="w-full sm:w-auto">
                    <Link href="/menu">Explore the menu</Link>
                  </Button>
                </Magnetic>
              </span>
              <span className="hero-cta-item reveal block w-full sm:w-auto">
                <Magnetic className="block w-full sm:w-auto" strength={0.3} padding={36}>
                  <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                    <Link href="/reserve">Reserve a table</Link>
                  </Button>
                </Magnetic>
              </span>
            </div>

            <div className="hero-foot reveal mt-7 flex items-center gap-3">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full rounded-full bg-gold opacity-70 motion-safe:animate-pulse-soft" />
                <span className="relative inline-flex size-1.5 rounded-full bg-gold" />
              </span>
              <span className="font-sans text-micro font-medium text-ink uppercase">
                Open now · until 22:00
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* The headline is set in the film. This is the same sentence, for
          anyone who is not looking at it. */}
      <h1 className="sr-only">The Slow Art of Coffee</h1>
      <p className="sr-only">
        {SITE.name}. {SITE.description}
      </p>
    </section>
  );
}
