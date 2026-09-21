'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { Sparkle } from '@/components/illustrations/Doodles';
import { Blossom } from '@/components/illustrations/Florals';
import { Sprig } from '@/components/illustrations/Foliage';
import { BackgroundVideo } from '@/components/media/BackgroundVideo';
import { Magnetic } from '@/components/motion/Magnetic';
import { Button } from '@/components/ui/button';
import { gsap, useGsap } from '@/hooks/useGsap';
import { useIsoLayoutEffect } from '@/hooks/useIsoLayoutEffect';
import { useHasFinePointer, useMotionOK } from '@/hooks/useMediaQuery';
import { VIDEOS } from '@/lib/media';
import { SITE } from '@/lib/site';

/** The footage's intrinsic size. */
const VIDEO = { width: 1280, height: 720 };

/**
 * Where the sculpted lettering sits inside the frame, normalised to it.
 *
 * Measured off the footage across the whole loop, not off one frame: the
 * camera breathes over the ten seconds, so the box is the *union* of where the
 * words reach at their most spread. "The" caps begin about 10% down, "of
 * Coffee" runs all the way to the bottom edge, and the words span roughly 15%
 * to 89% across. Everything outside that is wall, table and falling beans —
 * croppable.
 *
 * Now that the landscape framing shows the frame whole, only the horizontal
 * pair is still consulted — it decides the narrowest screen on which a crop
 * could ever have held the words, and therefore where the portrait fallback
 * takes over. Re-measure whenever the footage is replaced.
 */
const TEXT = { top: 0.1, bottom: 0.995, left: 0.15, right: 0.89 };

/**
 * Below this aspect the screen is portrait: the footage is so much wider than
 * the section that covering it would leave a quarter of the frame's width on
 * screen and nothing readable. That case gets the stacked layout — the picture
 * as a band at the head of the section, the copy on paper beneath it.
 *
 * Everything above it covers. Always. No bars, on any axis, at any size.
 */
const STACK_BELOW_ASPECT = 1.2;

/**
 * Breathing room kept between the lettering and the edge of the section, as a
 * share of it — stacked layouts only, where it is free.
 *
 * Sizing the band so the words fit *exactly* leaves them flush against both
 * edges, which reads as cut even though every letter is there.
 */
const TEXT_MARGIN = 0.03;

/**
 * When a cover crop cannot hold the whole headline, which end pays.
 *
 * At 0.5 the loss is split evenly. Above it, more comes off the top — which is
 * what you want here: the top of the frame is "The", a small article with
 * empty wall above it, while the bottom is "of Coffee" set large. Losing a
 * little off an article reads as framing; losing the same off the payoff line
 * reads as a mistake.
 */
const CROP_BIAS_TOP = 0.75;

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

    const frame = root.querySelector<HTMLElement>('.hero-frame');
    // Scoped to the frame, not the section: the blurred fill is a second
    // <video> and it renders first, so an unscoped query styles the wrong one.
    const video = frame?.querySelector<HTMLVideoElement>('video');
    if (!video || !frame) return;

    const apply = () => {
      const { width, height } = root.getBoundingClientRect();
      if (!width || !height) return;

      const cover = Math.max(width / VIDEO.width, height / VIDEO.height);
      const stacked = width / height < STACK_BELOW_ASPECT;

      // Place a box of `size` inside `box` so that the span between `near` and
      // `far` — the lettering — is shown as fully as possible, and never so
      // that a gap opens at either end.
      const place = (box: number, size: number, near: number, far: number, bias = 0.5) => {
        const a = near * size;
        const b = far * size;
        const span = b - a;

        // Fits: centre the words. Does not: split the shortfall, `bias` of it
        // taken off the near end.
        const offset = span <= box ? (box - span) / 2 - a : -(a + (span - box) * bias);

        // The clamp is the promise. Whatever the words want, the picture never
        // pulls away from an edge.
        return Math.min(Math.max(offset, box - size), 0);
      };

      let scale = cover;

      if (stacked) {
        // Portrait: shrink to whatever shows the whole headline, plus a margin
        // so it is not flush against the sides. The band is short either way,
        // so this costs nothing that was going to be seen.
        const fitsWords = Math.min(
          width / ((TEXT.right - TEXT.left) * VIDEO.width),
          height / ((TEXT.bottom - TEXT.top) * VIDEO.height)
        );
        scale = Math.min(cover, fitsWords * (1 - TEXT_MARGIN * 2));
        // ...but never below full width, or the band grows side bars.
        scale = Math.max(scale, width / VIDEO.width);
      }

      const w = VIDEO.width * scale;
      const h = VIDEO.height * scale;

      const x = place(width, w, TEXT.left, TEXT.right);
      const y = stacked ? 0 : place(height, h, TEXT.top, TEXT.bottom, CROP_BIAS_TOP);

      video.style.objectFit = 'fill';
      // The base stylesheet caps every video at `max-width: 100%`, which
      // silently clamps the width set below back to the container and quietly
      // undoes the whole calculation. It has to be lifted where the size is
      // deliberate.
      video.style.maxWidth = 'none';
      video.style.maxHeight = 'none';
      video.style.width = `${w.toFixed(2)}px`;
      video.style.height = `${h.toFixed(2)}px`;
      video.style.left = `${x.toFixed(2)}px`;
      video.style.top = `${y.toFixed(2)}px`;
      frame.style.inset = '0%';

      // Everything below the picture keys off this rather than a hard-coded
      // percentage. The band is about a quarter of a phone but nearly half of
      // a portrait tablet, and a fixed stop that clears the first cuts through
      // the second — taking "of Coffee" with it.
      root.style.setProperty('--hero-frame-bottom', `${(((y + h) / height) * 100).toFixed(2)}%`);

      // Where the sculpted words stop, and how much wall is left to the right
      // of them. The blossom stands in that margin: measured, never guessed,
      // because the margin is 140px on a wide desktop and nothing at all on a
      // narrow one, and a drawing that covers "of Coffee" is the one thing
      // this section may not do.
      const textRight = x + TEXT.right * w;
      root.style.setProperty('--hero-text-right', `${textRight.toFixed(2)}px`);
      root.style.setProperty('--hero-right-gap', `${Math.max(0, width - textRight).toFixed(2)}px`);

      root.classList.toggle('hero-stacked', stacked);
    };

    apply();

    const observer = new ResizeObserver(apply);
    observer.observe(root);

    return () => observer.disconnect();
  }, []);

  // --- Entrance -----------------------------------------------------------
  // The picture only. Every line of copy carries `data-text` and every drawing
  // `data-ill`, and the site-wide reveal runner plays those; their
  // `data-*-delay`s are timed to land while this push-in is settling.
  useIsoLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (!motionOK) {
        gsap.set('.hero-stage', { opacity: 1 });
        return;
      }

      // The push-in resolves *to* 1, never past it, so the frame is whole from
      // the moment it settles and stays whole.
      gsap.fromTo(
        '.hero-stage',
        { opacity: 0, scale: 1.06 },
        { opacity: 1, scale: 1, duration: 2.2, ease: 'power2.out' }
      );
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
      // The 35rem floor is itself capped at the viewport. A bare `min-h-140`
      // beats `h-svh` on any screen shorter than 560px — a landscape phone at
      // 740x360 got a 560px hero, 200px of it below the fold, which is where
      // both buttons and the foot of the filmed headline ended up. `min()`
      // makes the floor a no-op exactly there and changes nothing above it.
      className="relative isolate h-svh min-h-[min(35rem,100svh)] w-full overflow-hidden"
      style={{ perspective: '1400px', backgroundColor: '#ebe4d8' }}
    >
      {/* ---------- The picture ----------
          `object-fit` and `object-position` are both set from JS — see
          `aimCrop`. Classes here would only fight it. */}
      <div className="hero-stage reveal absolute inset-0 will-change-[opacity,transform]">
        {/* Whatever the frame does not cover is filled by the same footage,
            blown up and thrown out of focus. A blurred *still* cannot do this
            job: it is one average of the whole picture, so it meets the seam
            with the wrong colour. This matches in tone, in light and in
            motion, which is what makes the edges disappear. Scaled past the
            box because a blur of this radius pulls the frame's own edge inward
            and would otherwise show as a soft line. */}
        {/* Size and position are both written from JS: the rule depends on the
            section's measured shape, which no combination of `object-fit` and
            `object-position` can express. */}
        <div className="hero-frame absolute inset-0 overflow-hidden [&>video]:absolute">
          <BackgroundVideo src={VIDEOS.hero} eager playbackRate={0.85} />
        </div>
      </div>

      {/* Where the picture is a band at the head of the section, this returns
          the rest of the screen to paper. The gradient lives in globals.css so
          that it can key off `--hero-frame-bottom`: an inline one would win
          over that rule and pin the fade back to a fixed percentage, which is
          precisely what used to wash out "of Coffee" on a tablet. */}
      <div aria-hidden className="hero-paper pointer-events-none absolute inset-0 z-1" />

      {/* A spray of blossom standing in the wall to the right of the words.

          The near corner of the shot is out of focus and holds nothing but a
          bean and a shadow, which is the one place on this picture where
          something drawn can sit without competing with the sculpted
          lettering or the copy.

          Everything about where it lands is measured rather than guessed, in
          `.hero-bloom` in globals.css: it starts where the lettering ends
          (`--hero-text-right`), it is never wider than the wall that is left
          (`--hero-right-gap`, so it shrinks to nothing rather than creep over
          a letter), and it stands on the foot of the *picture*
          (`--hero-frame-bottom`) rather than the foot of the section, which is
          a different line once the layout stacks. */}
      <div aria-hidden className="hero-bloom pointer-events-none absolute z-5">
        <Blossom
          data-ill
          data-ill-delay="1.05"
          data-ill-float="14"
          className="h-auto w-full origin-bottom rotate-6"
        />
      </div>

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
            {/* A few sparkles scattered in the copy's own corners, where the
                eyebrow and the button row leave the box empty. They stay inside
                it on purpose: outside, they would drift onto the lettering. */}
            <Sparkle
              data-ill
              data-ill-delay="1.5"
              className="pointer-events-none absolute top-0 left-[4%] size-3.5 sm:left-[8%] sm:size-4"
            />
            <Sparkle
              data-ill
              data-ill-delay="1.7"
              className="pointer-events-none absolute top-[38%] right-0 hidden size-3 sm:block"
            />
            <Sparkle
              data-ill
              data-ill-delay="1.9"
              className="pointer-events-none absolute right-[6%] bottom-1 size-3 sm:right-[14%]"
            />

            {/* Two sprigs, mirrored, hold the eyebrow between them. */}
            <div className="flex w-full items-center justify-center gap-2.5 sm:gap-4">
              <Sprig
                flip
                data-ill
                data-ill-delay="0.5"
                className="h-auto w-12 shrink-0 sm:w-16"
              />
              <p data-text="write" data-text-delay="0.6" className="eyebrow whitespace-nowrap">
                Mumbai · single origin
              </p>
              <Sprig
                data-ill
                data-ill-delay="0.5"
                className="h-auto w-12 shrink-0 sm:w-16"
              />
            </div>

            <p
              data-text="words"
              data-text-delay="0.85"
              className="mt-5 max-w-[56ch] text-balance font-sans text-body text-ink-soft"
            >
              Fourteen grams. Ninety-four degrees. Twenty-six seconds. A decade spent
              removing everything that isn&rsquo;t the cup.
            </p>

            {/* Stacked and equal-width on a phone — two pills of different
                widths read as an accident at that size.

                The gap and the magnetism are a pair. Each pill leans towards
                the pointer, so a pointer parked between them pulls *both*
                inwards at once and the two pills meet in the middle: the lean
                has to stay smaller than half the gap. 0.18 of a 22px catch
                radius is about 4px of travel against a 32px gap, which reads
                as a nudge and can never close. */}
            <div className="mt-7 flex w-full max-w-76 flex-col gap-3 sm:mt-8 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-8">
              <span data-text="pop" data-text-delay="1.15" className="block w-full sm:w-auto">
                <Magnetic className="block w-full sm:w-auto" strength={0.18} padding={22}>
                  <Button asChild size="lg" variant="primary" className="w-full sm:w-auto">
                    <Link href="/menu">Explore the menu</Link>
                  </Button>
                </Magnetic>
              </span>
              <span data-text="pop" data-text-delay="1.27" className="block w-full sm:w-auto">
                <Magnetic className="block w-full sm:w-auto" strength={0.18} padding={22}>
                  <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                    <Link href="/reserve">Reserve a table</Link>
                  </Button>
                </Magnetic>
              </span>
            </div>

            <div data-text="fade" data-text-delay="1.5" className="mt-7 flex items-center gap-3">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full rounded-full bg-clay opacity-70 motion-safe:animate-pulse-soft" />
                <span className="relative inline-flex size-1.5 rounded-full bg-clay" />
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
