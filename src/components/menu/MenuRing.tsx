'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { RingCard } from '@/components/menu/RingCard';
import { gsap, useGsap } from '@/hooks/useGsap';
import { useHasFinePointer, useMotionOK } from '@/hooks/useMediaQuery';
import type { MenuItem } from '@/lib/menu';

/** One full revolution, unattended. Slow enough to read a plate as it passes. */
const REVOLUTION_SECONDS = 54;

/**
 * How far the ring turns across the section's whole scroll pass, in degrees.
 *
 * Two card-steps at ten plates. Enough that scrolling visibly *drives* the
 * ring — the page and the vitrine are the same gesture — without racing the
 * idle spin into a blur.
 */
const SCROLL_SWEEP = 72;

/** Degrees of ring per pixel of drag. Tuned so a plate-to-plate flick is a
    comfortable thumb's width on a phone rather than a whole forearm. */
const DEGREES_PER_PIXEL = 0.32;

/** How far a pointer must travel before the ring treats it as a drag rather
    than a click on the plate underneath it. */
const DRAG_THRESHOLD = 5;

/** How much of the release velocity is carried into the settle. */
const FLICK_CARRY = 0.13;

/** The settle after any hand-off — drag, arrow, or focus. */
const SETTLE = { duration: 1.05, ease: 'power3.out' } as const;

/** Below this many plates a cylinder reads as a fan, so the ring stands down. */
const MIN_PLATES = 5;

const DEG = Math.PI / 180;

type MenuRingProps = {
  items: readonly MenuItem[];
};

/**
 * THE VITRINE, AS A TURNTABLE
 *
 * The plates stand on a cylinder rather than in a grid: each one is rotated to
 * its own share of the circle and pushed out along the radius, and the whole
 * stage turns inside a perspective. The plate facing you is nearest the
 * viewer, so the projection alone makes it the largest and the sharpest —
 * nothing is scaled by hand. Its neighbours are caught mid-turn, and the far
 * half of the ring is simply not drawn, because every slot carries
 * `backface-visibility: hidden`. At ten plates that leaves five in view, which
 * is the arrangement the whole composition is tuned around.
 *
 * Four things here are deliberate rather than incidental:
 *
 * 1. **One clock.** The idle turn rides `gsap.ticker` — the same ticker that
 *    already drives Lenis, which drives ScrollTrigger. A second
 *    `requestAnimationFrame` loop would beat against it. Because
 *    `lagSmoothing(0)` is set site-wide, the delta handed to a tick is the
 *    *real* elapsed time, so a backgrounded tab returns with minutes in it;
 *    the delta is clamped or the ring teleports on the visitor's return.
 * 2. **Angle is the single source of truth.** Idle, scroll and hand are three
 *    numbers that sum to one angle, and one `render()` writes the frame from
 *    it. Nothing else touches a transform, so the three can never disagree.
 * 3. **The resting arrangement is markup, not GSAP.** Each slot's own
 *    `rotateY(...) translateZ(...)` is an inline style written by React.
 *    `gsap.context().revert()` restores pre-context inline styles on every
 *    Strict Mode cleanup, so a ring assembled by `gsap.set` would take itself
 *    apart on the second mount — and under reduced motion, where no timeline
 *    runs at all, it would never have been assembled in the first place.
 * 4. **Turned-away plates keep their tab stop.** They are hidden to the eye
 *    and to the pointer, never to the keyboard: focusing one turns the ring to
 *    bring it round, and holds it there. A carousel that skips its own
 *    contents when tabbed is just a list with most of the list missing.
 */
export function MenuRing({ items }: MenuRingProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLUListElement>(null);
  const captionRef = useRef<HTMLParagraphElement>(null);

  const motionOK = useMotionOK();
  const finePointer = useHasFinePointer();

  const count = items.length;
  const step = 360 / count;

  useGsap(
    () => {
      const root = rootRef.current;
      const stage = stageRef.current;
      const caption = captionRef.current;
      const viewport = root?.querySelector<HTMLElement>('.menu-ring-viewport');
      if (!root || !stage || !viewport || count < MIN_PLATES) return;

      const slots = gsap.utils.toArray<HTMLElement>('.menu-ring-slot', stage);
      if (slots.length !== count) return;

      /** Everything that is not a tween or a ScrollTrigger — those the context
          reverts itself; a ticker callback and a DOM listener it does not. */
      const teardown: Array<() => void> = [];

      // `idle` accumulates on the ticker, `scroll` is scrubbed by the section's
      // pass through the viewport, and `hand` is whatever a drag, an arrow or a
      // focus has asked for. The frame is drawn from their sum and from nothing
      // else. `drive` fades the idle turn out under the pointer and back in
      // when it leaves, so a hover stops the ring without stopping the clock.
      const angle = { idle: 0, scroll: 0, hand: 0, drive: 1 };

      // The plate that is square-on at rest, and therefore the note already
      // rendered on the server. Starting at -1 would cross-fade the caption to
      // its own text on the first frame.
      let shown = 0;

      const render = () => {
        const spin = angle.idle + angle.scroll + angle.hand;
        stage.style.transform = `rotateY(${spin}deg)`;

        for (let i = 0; i < slots.length; i += 1) {
          // How square-on this plate is: 1 facing the viewer, 0 edge-on,
          // negative once it has turned its back.
          const facing = Math.cos((i * step + spin) * DEG);
          const front = facing > 0 ? facing : 0;

          const slot = slots[i];
          // Raised to a fractional power so the fall-off is gentle across the
          // front of the ring and steep only at the edges — a linear ramp dims
          // the two plates flanking the front one far more than the eye
          // expects, and the ring reads as lit by a spotlight.
          slot.style.opacity = (0.12 + 0.88 * Math.pow(front, 0.62)).toFixed(3);
          // The far half is invisible, so it must not be clickable either —
          // `backface-visibility` hides a card without lifting its hit area.
          slot.style.pointerEvents = facing > 0.35 ? 'auto' : 'none';
        }

        if (!caption) return;

        // Whichever plate is closest to square-on owns the caption. Rounding
        // the angle rather than scanning the slots keeps this O(1) and makes
        // the swap land exactly as the plate squares up.
        const index = ((Math.round(-spin / step) % count) + count) % count;
        if (index === shown) return;
        shown = index;

        const item = items[index];
        if (!motionOK) {
          caption.textContent = item.note;
          return;
        }

        // Cross-faded rather than swapped: the text changes while the plate is
        // still turning, and a hard cut draws the eye off the ring.
        gsap.to(caption, {
          opacity: 0,
          duration: 0.22,
          ease: 'power2.in',
          onComplete: () => {
            caption.textContent = item.note;
            gsap.to(caption, { opacity: 1, duration: 0.45, ease: 'power2.out' });
          },
        });
      };

      render();

      // --- The idle turn ---------------------------------------------------
      if (motionOK) {
        const perSecond = 360 / REVOLUTION_SECONDS;

        const tick = (_time: number, delta: number) => {
          if (angle.drive <= 0.001) return;
          // `lagSmoothing(0)` (SmoothScroll) means nothing clamps this delta,
          // so a tab left in the background hands back its entire absence at
          // once. A fiftieth of a second is the most the ring will accept.
          angle.idle += (Math.min(delta, 50) / 1000) * perSecond * angle.drive;
          render();
        };

        gsap.ticker.add(tick);
        teardown.push(() => gsap.ticker.remove(tick));

        // --- Driven by the page --------------------------------------------
        gsap.fromTo(
          angle,
          { scroll: -SCROLL_SWEEP / 2 },
          {
            scroll: SCROLL_SWEEP / 2,
            ease: 'none',
            onUpdate: render,
            scrollTrigger: {
              trigger: root,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.1,
            },
          }
        );

        // --- The assembly ---------------------------------------------------
        // The ring arrives already turning: it swings in from a quarter turn
        // back, so the first thing the visitor sees is the motion rather than a
        // static fan that then starts moving.
        gsap.fromTo(
          angle,
          { hand: -96 },
          {
            hand: 0,
            duration: 2.1,
            ease: 'power3.out',
            onUpdate: render,
            scrollTrigger: { trigger: root, start: 'top 82%', once: true },
          }
        );

        // The rise is put on the viewport rather than on the slots. A slot's
        // own transform is `translateY(-50%) rotateY(…) translateZ(…)`, and
        // that first term is what centres the plate on the axis; GSAP reads an
        // existing transform into its own `yPercent`, so any tween of `y` or
        // `yPercent` here would land on top of the -50% and leave every plate
        // hanging half a card low for good.
        gsap.fromTo(
          viewport,
          { opacity: 0, y: 44 },
          {
            opacity: 1,
            y: 0,
            duration: 1.5,
            ease: 'power3.out',
            scrollTrigger: { trigger: root, start: 'top 82%', once: true },
          }
        );
      }

      // --- Settling --------------------------------------------------------
      /** Turn to the nearest plate, carrying a little of the flick with it. */
      const settle = (carry = 0) => {
        const spin = angle.idle + angle.scroll + angle.hand;
        const target = Math.round((spin + carry) / step) * step;

        gsap.to(angle, {
          hand: angle.hand + (target - spin),
          ...SETTLE,
          // Reduced motion still gets to drive the ring; it simply does not
          // get a glide. Arriving is the useful part, the easing is not.
          duration: motionOK ? SETTLE.duration : 0,
          onUpdate: render,
          onComplete: render,
        });
      };

      /** Bring plate `index` square-on. */
      const turnTo = (index: number) => {
        const spin = angle.idle + angle.scroll + angle.hand;
        // The nearest equivalent angle, not the absolute one: without this the
        // ring unwinds the long way round whenever the spin has accumulated
        // past a full turn.
        const wanted = -index * step;
        const delta = ((((wanted - spin) % 360) + 540) % 360) - 180;

        gsap.to(angle, {
          hand: angle.hand + delta,
          ...SETTLE,
          duration: motionOK ? SETTLE.duration : 0,
          onUpdate: render,
          onComplete: render,
        });
      };

      const drive = (value: number) =>
        gsap.to(angle, {
          drive: value,
          duration: 0.5,
          ease: 'power2.out',
          // `auto`, never `true`. A blanket overwrite kills every other tween
          // of the same target — and `angle` is also the target of the scroll
          // scrub, so a single hover would stop the page from driving the ring
          // for the rest of the visit.
          overwrite: 'auto',
        });

      /** The scrub owns `scroll`; a hand never touches it. */
      const releaseHand = () => gsap.killTweensOf(angle, 'hand,drive');

      // --- The hand --------------------------------------------------------
      let tracking = false;
      let dragged = false;
      let startX = 0;
      let lastX = 0;
      let lastAt = 0;
      let velocity = 0;

      const onPointerDown = (event: PointerEvent) => {
        // Secondary buttons belong to the browser's own menu.
        if (event.button !== 0) return;
        tracking = true;
        dragged = false;
        startX = event.clientX;
        lastX = event.clientX;
        lastAt = event.timeStamp;
        velocity = 0;
        releaseHand();
        angle.drive = 0;
      };

      const onPointerMove = (event: PointerEvent) => {
        if (!tracking) return;

        // Nothing happens until the pointer has travelled far enough to be a
        // drag rather than a click. Capturing on `pointerdown` would be
        // simpler, but a captured pointer retargets the subsequent `click` to
        // the capturing element — so every plate would stop being a link.
        if (!dragged) {
          if (Math.abs(event.clientX - startX) < DRAG_THRESHOLD) return;
          dragged = true;
          viewport.setPointerCapture(event.pointerId);
          viewport.classList.add('is-dragging');
          lastX = event.clientX;
          lastAt = event.timeStamp;
          return;
        }

        const dx = event.clientX - lastX;
        const dt = event.timeStamp - lastAt;
        lastX = event.clientX;
        lastAt = event.timeStamp;

        const turn = dx * DEGREES_PER_PIXEL;
        angle.hand += turn;
        // Degrees per millisecond, smoothed — a raw last-frame sample makes a
        // flick's landing depend on whichever single event happened to arrive
        // as the finger lifted.
        if (dt > 0) velocity = velocity * 0.72 + (turn / dt) * 0.28;
        render();
      };

      const onPointerUp = (event: PointerEvent) => {
        if (!tracking) return;
        tracking = false;

        if (dragged) {
          viewport.classList.remove('is-dragging');
          if (viewport.hasPointerCapture(event.pointerId)) {
            viewport.releasePointerCapture(event.pointerId);
          }
          settle(velocity * FLICK_CARRY * 1000);
        }

        // Only a pointer still resting on the ring keeps it still.
        if (!finePointer || !viewport.matches(':hover')) drive(1);
      };

      // A drag that finishes over a plate still ends in a `click`, and that
      // plate is a link. Swallowed in the capture phase, before it reaches it.
      const onClick = (event: MouseEvent) => {
        if (!dragged) return;
        dragged = false;
        event.preventDefault();
        event.stopPropagation();
      };

      viewport.addEventListener('pointerdown', onPointerDown);
      viewport.addEventListener('pointermove', onPointerMove);
      viewport.addEventListener('pointerup', onPointerUp);
      viewport.addEventListener('pointercancel', onPointerUp);
      viewport.addEventListener('click', onClick, true);

      // --- The keyboard ----------------------------------------------------
      const onKeyDown = (event: KeyboardEvent) => {
        const forward = event.key === 'ArrowRight';
        const back = event.key === 'ArrowLeft';
        if (!forward && !back) return;
        event.preventDefault();
        releaseHand();
        settle(forward ? -step : step);
      };

      // A plate that is turned away is still in the tab order, so focus has to
      // be able to fetch it — otherwise tabbing walks through plates nobody can
      // see. `focusin` rather than `focus` because the event has to reach the
      // ring from the link inside the slot.
      const onFocusIn = (event: FocusEvent) => {
        // Anything focused inside the ring holds it still — otherwise the idle
        // turn carries the plate straight back off the front the moment it has
        // finished arriving, which is worse than never having turned at all.
        gsap.killTweensOf(angle, 'drive');
        angle.drive = 0;

        const slot = (event.target as HTMLElement | null)?.closest('.menu-ring-slot');
        if (!slot) return;
        const index = slots.indexOf(slot as HTMLElement);
        if (index >= 0) turnTo(index);
      };

      /** Only focus leaving the ring altogether hands the turn back. */
      const onFocusOut = (event: FocusEvent) => {
        const next = event.relatedTarget;
        if (next instanceof Node && root.contains(next)) return;
        if (finePointer && viewport.matches(':hover')) return;
        drive(1);
      };

      root.addEventListener('keydown', onKeyDown);
      root.addEventListener('focusin', onFocusIn);
      root.addEventListener('focusout', onFocusOut);

      // --- The pointer at rest ---------------------------------------------
      const onEnter = () => drive(0);
      const onLeave = () => {
        // A captured drag keeps running past the ring's edge; `pointerup` is
        // what hands the turn back, not the pointer leaving.
        if (!tracking) drive(1);
      };

      if (finePointer && motionOK) {
        viewport.addEventListener('pointerenter', onEnter);
        viewport.addEventListener('pointerleave', onLeave);
      }

      teardown.push(() => {
        viewport.removeEventListener('pointerdown', onPointerDown);
        viewport.removeEventListener('pointermove', onPointerMove);
        viewport.removeEventListener('pointerup', onPointerUp);
        viewport.removeEventListener('pointercancel', onPointerUp);
        viewport.removeEventListener('click', onClick, true);
        viewport.removeEventListener('pointerenter', onEnter);
        viewport.removeEventListener('pointerleave', onLeave);
        root.removeEventListener('keydown', onKeyDown);
        root.removeEventListener('focusin', onFocusIn);
        root.removeEventListener('focusout', onFocusOut);
      });

      // --- The controls ----------------------------------------------------
      // Bound here rather than through React because they do nothing except
      // drive the ring, and the ring's angle lives in this closure.
      const nudge = (direction: number) => () => {
        releaseHand();
        settle(direction * step);
      };
      const prev = root.querySelector<HTMLButtonElement>('[data-ring-prev]');
      const next = root.querySelector<HTMLButtonElement>('[data-ring-next]');
      const onPrev = nudge(1);
      const onNext = nudge(-1);
      prev?.addEventListener('click', onPrev);
      next?.addEventListener('click', onNext);
      teardown.push(() => {
        prev?.removeEventListener('click', onPrev);
        next?.removeEventListener('click', onNext);
      });

      return () => teardown.forEach((off) => off());
    },
    [count, step, items, motionOK, finePointer],
    rootRef
  );

  // Too few plates to close a cylinder. The section falls back to the grid it
  // already knows how to draw rather than showing three cards on a wheel.
  if (count < MIN_PLATES) return null;

  return (
    <div ref={rootRef} className="menu-ring relative isolate">
      <div
        className="menu-ring-viewport relative"
        role="group"
        aria-roledescription="carousel"
        aria-label="The menu, on a turning stand"
      >
        {/* The warmth the ring stands in. Wider than the ring itself, so its
            edges finish inside the section rather than against it. */}
        <span aria-hidden className="menu-ring-floor" />

        <ul ref={stageRef} role="list" className="menu-ring-stage">
          {items.map((item, index) => (
            <li
              key={item.id}
              className="menu-ring-slot"
              style={{
                // The resting arrangement, in the markup rather than in a
                // timeline — see the note at the head of this file.
                transform: `translateY(-50%) rotateY(${index * step}deg) translateZ(var(--menu-ring-radius))`,
              }}
            >
              <RingCard item={item} />
            </li>
          ))}
        </ul>
      </div>

      {/* Under the ring: the note belonging to whichever plate is square-on,
          and the two controls. The note is the reward for watching — the plate
          itself only has room for a name and a price. */}
      <div className="menu-ring-foot">
        <button type="button" data-ring-prev className="menu-ring-nav" aria-label="Previous dish">
          <ChevronLeft className="size-4" strokeWidth={1.6} aria-hidden />
        </button>

        <p
          ref={captionRef}
          className="menu-ring-caption font-sans text-[0.9rem] leading-relaxed text-mute"
          aria-live="off"
        >
          {items[0]?.note}
        </p>

        <button type="button" data-ring-next className="menu-ring-nav" aria-label="Next dish">
          <ChevronRight className="size-4" strokeWidth={1.6} aria-hidden />
        </button>
      </div>
    </div>
  );
}
