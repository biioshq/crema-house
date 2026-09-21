'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { gsap, ScrollTrigger, SplitText } from '@/lib/gsap';
import { useMotionOK } from '@/hooks/useMediaQuery';

/**
 * The one text/illustration reveal engine for the whole site.
 *
 * Mounted once in the root layout. Sections never import a motion component or
 * write a timeline: they mark an element `data-text="<mode>"` (or an inline SVG
 * `data-ill`) and this runner finds it, hides it, splits it, and plays it as it
 * scrolls into view. See DESIGN.md §4/§5 for the public attribute contract.
 *
 * The three things that make it safe rather than merely clever:
 *
 * 1. **Nothing is hidden by JavaScript.** The pre-hide is a CSS rule keyed on
 *    `[data-js]`, an attribute an inline <head> script sets — so copy is only
 *    ever invisible on a page where scripts actually run, the server HTML and
 *    the first client render agree (nothing for hydration to complain about),
 *    and a 3.5s timer in that same script un-hides everything if this runner
 *    never reports for duty.
 * 2. **Splitting waits for the webfont, but not forever.** Line breaks are
 *    measured, so a split taken before Fraunces swaps in is wrong. `fonts.ready`
 *    covers the normal case; the timeout covers the case where a font never
 *    arrives, because "headline stays invisible" is a far worse failure than
 *    "headline splits on the fallback metrics".
 * 3. **The split is temporary.** Each element is re-split on resize while its
 *    reveal is still pending, and reverted to plain text the moment the reveal
 *    finishes — no orphan spans, no stranded `will-change`, and the accessible
 *    name is SplitText's own `aria: 'auto'` handling throughout.
 *
 * Under `prefers-reduced-motion` this component does nothing at all, and the
 * matching CSS media query cancels the pre-hide, so the page is simply a
 * complete, still, fully visible document.
 */

/** ScrollTrigger start used when a section does not name one. */
const DEFAULT_START = 'top 88%';
/** Illustrations start a touch later than the copy they decorate. */
const DEFAULT_ILL_START = 'top 92%';
/** Auto-cascade between sibling reveals that carry no explicit delay. */
const CASCADE_STEP = 0.08;
/** How long a missing webfont may hold the page hostage before we split anyway. */
const FONT_TIMEOUT = 1200;

type Entry = {
  el: HTMLElement | SVGElement;
  /** Text entries re-split on resize; illustrations do not need to. */
  resplits: boolean;
  played: boolean;
  build: () => void;
  destroy: () => void;
  /** Play now if the element is on screen — see the bottom-of-page sweep. */
  settle: () => void;
};

/**
 * `clamp()` keeps a trigger position inside the scrollable range.
 *
 * Without it, anything in the last screenful of a page — the footer's bottom
 * bar, most obviously — asks to start when its top reaches 88% of the
 * viewport, a scroll position the page can never actually reach, so the reveal
 * never fires and the copy stays at opacity 0 forever. ScrollTrigger's clamp
 * pulls that position back to the end of the scroll and the reveal plays as
 * the reader arrives at the bottom.
 */
const clamped = (start: string) => (start.includes('clamp(') ? start : `clamp(${start})`);

const number = (value: string | undefined, fallback: number) => {
  if (value === undefined) return fallback;
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export function RevealRunner() {
  const motionOK = useMotionOK();
  const pathname = usePathname();
  const rescan = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Reduced motion: no timelines, and the CSS pre-hide is already cancelled
    // by its own media query. The page is static and entirely visible.
    if (!motionOK) return;

    const root = document.documentElement;
    const entries = new Map<Element, Entry>();
    const queue: Entry[] = [];

    let disposed = false;
    let fontsReady = false;
    /** Raised while we are rewriting the DOM, so our own splits do not
        retrigger the MutationObserver into an endless rescan. */
    let building = 0;

    // ----------------------------------------------------------------- text

    function createText(el: HTMLElement, autoDelay: number): Entry {
      const data = el.dataset;
      const mode = data.text || 'lines';
      const start = data.textStart || DEFAULT_START;
      const delay = number(data.textDelay, autoDelay);
      const stagger = data.textStagger === undefined ? undefined : number(data.textStagger, 0);

      let split: SplitText | null = null;
      let timeline: gsap.core.Timeline | null = null;
      let trigger: ScrollTrigger | null = null;

      const entry: Entry = {
        el,
        resplits: mode !== 'fade' && mode !== 'pop' && mode !== 'write',
        played: false,
        build,
        destroy,
        settle: () => {
          if (entry.played || !timeline || timeline.isActive() || timeline.progress() > 0) return;
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) timeline.play();
        },
      };

      /** Splitting hides the element again first: `data-text-ready` is what
          lifts the CSS pre-hide, so it goes back on only once the from-state
          is set and there is nothing left to flash. */
      const makeSplit = (type: string, mask?: 'lines' | 'words' | 'chars') =>
        SplitText.create(el, {
          type,
          mask,
          linesClass: 'rv-line',
          wordsClass: 'rv-word',
          charsClass: 'rv-char',
          // SplitText's own resize/font watcher is off: this runner already
          // owns both, and two of them fight over the same innerHTML.
          autoSplit: false,
        });

      function build() {
        if (disposed || entry.played) return;
        building += 1;

        timeline?.kill();
        trigger?.kill();
        split?.revert();
        split = null;
        el.removeAttribute('data-text-ready');
        gsap.set(el, { clearProps: 'all' });

        const tl = gsap.timeline({ paused: true, delay });

        switch (mode) {
          case 'words': {
            split = makeSplit('words,lines');
            gsap.set(split.words, { yPercent: 42, opacity: 0, filter: 'blur(8px)' });
            tl.to(split.words, {
              yPercent: 0,
              opacity: 1,
              filter: 'blur(0px)',
              duration: 0.95,
              stagger: stagger ?? 0.035,
              ease: 'power3.out',
            });
            break;
          }

          case 'chars': {
            // Words are split too, not for animation but so a wrapped line can
            // never break *inside* a word once the glyphs are inline-block.
            split = makeSplit('chars,words,lines');
            gsap.set(split.chars, { yPercent: 60, opacity: 0, rotate: 4 });
            tl.to(split.chars, {
              yPercent: 0,
              opacity: 1,
              rotate: 0,
              duration: 0.9,
              stagger: stagger ?? 0.016,
              ease: 'power3.out',
            });
            break;
          }

          case 'flip': {
            // The hinge sits on the baseline and slightly behind the glyph, so
            // words swing up into place rather than spinning in mid-air. No
            // line mask here: a word rotating in 3D overflows its line box in
            // both directions and a mask would shear it off.
            split = makeSplit('words,lines');
            gsap.set(el, { perspective: 900 });
            gsap.set(split.words, {
              transformOrigin: '50% 100% -0.35em',
              rotateX: -92,
              opacity: 0,
              y: '0.12em',
            });
            tl.to(split.words, {
              rotateX: 0,
              opacity: 1,
              y: 0,
              duration: 1.15,
              stagger: stagger ?? 0.055,
              ease: 'power4.out',
            });
            break;
          }

          case 'scatter': {
            split = makeSplit('chars,words,lines');
            gsap.set(split.chars, {
              opacity: 0,
              // Index-derived, never Math.random: a remount, a resize and the
              // server all agree on where a given letter comes from.
              x: (i: number) => (i % 2 ? 1 : -1) * (12 + (i % 7) * 6),
              y: (i: number) => (i % 3 ? -1 : 1) * (18 + (i % 5) * 9),
              rotate: (i: number) => (i % 2 ? 1 : -1) * (6 + (i % 4) * 3),
            });
            tl.to(split.chars, {
              opacity: 1,
              x: 0,
              y: 0,
              rotate: 0,
              duration: 1.05,
              stagger: stagger ?? 0.016,
              ease: 'power3.out',
            });
            break;
          }

          case 'wipe': {
            split = makeSplit('lines');
            // Negative top/bottom insets keep ascenders and descenders out of
            // the clip: the wipe is horizontal, so it has no business trimming
            // the tail of a "g".
            gsap.set(split.lines, { clipPath: 'inset(-0.25em 100% -0.3em -0.06em)' });
            tl.to(split.lines, {
              clipPath: 'inset(-0.25em -0.08em -0.3em -0.06em)',
              duration: 1,
              stagger: stagger ?? 0.12,
              ease: 'power3.inOut',
            });
            break;
          }

          case 'write': {
            // Handwriting is one continuous stroke, so this one does not split
            // at all — which also makes it the safe mode for nested markup.
            gsap.set(el, { clipPath: 'inset(-0.4em 100% -0.4em -0.1em)' });
            tl.to(el, {
              clipPath: 'inset(-0.4em -0.12em -0.4em -0.1em)',
              duration: 0.9,
              ease: 'power2.inOut',
            });
            break;
          }

          case 'pop': {
            gsap.set(el, { opacity: 0, scale: 0.85, rotate: -3, transformOrigin: '50% 50%' });
            tl.to(el, {
              opacity: 1,
              scale: 1,
              rotate: 0,
              duration: 0.8,
              // power3, not back: stickers settle, they do not boing.
              ease: 'power3.out',
            });
            break;
          }

          case 'fade': {
            gsap.set(el, { opacity: 0, y: 14 });
            tl.to(el, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' });
            break;
          }

          case 'lines':
          default: {
            split = makeSplit('lines', 'lines');
            gsap.set(split.lines, { yPercent: 108, opacity: 0 });
            tl.to(split.lines, {
              yPercent: 0,
              opacity: 1,
              duration: 1.1,
              stagger: stagger ?? 0.09,
              ease: 'expo.out',
            });
            break;
          }
        }

        tl.eventCallback('onComplete', () => {
          entry.played = true;
          split?.revert();
          split = null;
          // Hand the DOM back as plain text. The ready attribute stays, so the
          // CSS pre-hide does not grab the element again.
          gsap.set(el, { clearProps: 'all' });
          el.setAttribute('data-text-ready', '');
        });

        timeline = tl;
        el.setAttribute('data-text-ready', '');

        trigger = ScrollTrigger.create({
          trigger: el,
          start: clamped(start),
          once: true,
          onEnter: () => tl.play(),
        });

        building -= 1;
      }

      function destroy() {
        timeline?.kill();
        trigger?.kill();
        split?.revert();
        split = null;
        el.removeAttribute('data-text-ready');
        gsap.set(el, { clearProps: 'all' });
      }

      return entry;
    }

    // --------------------------------------------------------- illustrations

    function createIll(el: SVGElement): Entry {
      const data = el.dataset;
      const delay = number(data.illDelay, 0);
      const float = number(data.illFloat, 0);
      const start = data.illStart || DEFAULT_ILL_START;

      const draw = el.querySelectorAll('.ill-draw');
      const pop = el.querySelectorAll('.ill-pop');
      const sway = el.querySelectorAll('.ill-sway');
      const spin = el.querySelectorAll('.ill-spin');
      const twinkle = el.querySelectorAll('.ill-twinkle');

      let timeline: gsap.core.Timeline | null = null;
      let trigger: ScrollTrigger | null = null;
      let visibility: ScrollTrigger | null = null;
      let drift: gsap.core.Tween | null = null;
      let loops: gsap.core.Tween[] = [];

      const entry: Entry = {
        el,
        resplits: false,
        played: false,
        build,
        destroy,
        settle: () => {
          if (entry.played || !timeline || timeline.isActive() || timeline.progress() > 0) return;
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            entry.played = true;
            timeline.play();
          }
        },
      };

      function build() {
        if (disposed || entry.played) return;
        building += 1;

        timeline?.kill();
        trigger?.kill();
        visibility?.kill();
        drift?.kill();
        loops.forEach((loop) => loop.kill());
        loops = [];

        const tl = gsap.timeline({ paused: true, delay });

        if (draw.length) {
          gsap.set(draw, { drawSVG: '0%' });
          tl.to(draw, { drawSVG: '100%', duration: 1.1, stagger: 0.085, ease: 'power2.out' }, 0);
        }

        if (pop.length) {
          // fill-box is what makes `50% 50%` mean "the middle of this petal"
          // rather than "the middle of the whole viewBox".
          gsap.set(pop, {
            scale: 0,
            opacity: 0,
            transformOrigin: '50% 50%',
            transformBox: 'fill-box',
          });
          tl.to(
            pop,
            { scale: 1, opacity: 1, duration: 0.7, stagger: 0.055, ease: 'power3.out' },
            draw.length ? 0.25 : 0
          );
        }

        // An illustration with no marked parts still has to arrive somehow.
        if (!draw.length && !pop.length) {
          gsap.set(el, { opacity: 0, y: 12 });
          tl.to(el, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' });
        }

        if (sway.length) {
          loops.push(
            gsap.to(sway, {
              rotation: 3,
              duration: 2.9,
              ease: 'sine.inOut',
              yoyo: true,
              repeat: -1,
              stagger: 0.35,
              paused: true,
              // The group's own base, set by the component's inline style, is
              // the pivot; this just restates it for GSAP's transform cache.
              transformOrigin: '50% 100%',
              startAt: { rotation: -3, transformBox: 'fill-box' },
            })
          );
        }

        if (spin.length) {
          loops.push(
            gsap.to(spin, {
              rotation: 360,
              duration: 30,
              ease: 'none',
              repeat: -1,
              paused: true,
              transformOrigin: '50% 50%',
              startAt: { transformBox: 'fill-box' },
            })
          );
        }

        if (twinkle.length) {
          loops.push(
            gsap.to(twinkle, {
              scale: 1.16,
              opacity: 0.5,
              duration: 1.7,
              ease: 'sine.inOut',
              yoyo: true,
              repeat: -1,
              stagger: 0.45,
              paused: true,
              transformOrigin: '50% 50%',
              startAt: { transformBox: 'fill-box' },
            })
          );
        }

        timeline = tl;
        el.setAttribute('data-ill-ready', '');

        trigger = ScrollTrigger.create({
          trigger: el,
          start: clamped(start),
          once: true,
          onEnter: () => {
            tl.play();
            entry.played = true;
          },
        });

        if (loops.length) {
          // An endless tween on an illustration three screens away is pure
          // battery: the loops only run while the drawing is on screen.
          visibility = ScrollTrigger.create({
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            onToggle: (self) =>
              loops.forEach((loop) => (self.isActive ? loop.play() : loop.pause())),
          });
        }

        if (float) {
          drift = gsap.fromTo(
            el,
            { y: float * 0.5 },
            {
              y: -float * 0.5,
              ease: 'none',
              scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
            }
          );
        }

        building -= 1;
      }

      function destroy() {
        timeline?.kill();
        trigger?.kill();
        visibility?.kill();
        drift?.scrollTrigger?.kill();
        drift?.kill();
        loops.forEach((loop) => loop.kill());
        loops = [];
        el.removeAttribute('data-ill-ready');
        gsap.set(el, { clearProps: 'all' });
      }

      return entry;
    }

    // ------------------------------------------------------------- scanning

    function flush() {
      if (!fontsReady || disposed) return;
      while (queue.length) queue.shift()!.build();
    }

    function scan() {
      if (disposed) return;

      const texts = document.querySelectorAll<HTMLElement>('[data-text]:not([data-text-ready])');
      // Siblings that arrive together cascade: the first one goes on time, the
      // next a breath later. An explicit data-text-delay always wins.
      const seen = new Map<Element, number>();

      texts.forEach((el) => {
        if (entries.has(el)) return;
        // The contract forbids nesting; honouring it here means a stray nested
        // element is merely skipped rather than fighting its parent's split.
        if (el.parentElement?.closest('[data-text]')) return;
        if (!(el.textContent ?? '').trim()) return;

        const parent = el.parentElement ?? document.body;
        const index = seen.get(parent) ?? 0;
        seen.set(parent, index + 1);

        const entry = createText(el, index * CASCADE_STEP);
        entries.set(el, entry);
        queue.push(entry);
      });

      const ills = document.querySelectorAll<SVGElement>('[data-ill]:not([data-ill-ready])');
      ills.forEach((el) => {
        if (entries.has(el)) return;
        const entry = createIll(el);
        entries.set(el, entry);
        queue.push(entry);
      });

      flush();
    }

    rescan.current = scan;

    // ------------------------------------------------------------ lifecycle

    // Claim the page: the inline pre-hide script's 3.5s failsafe stands down
    // once this is set.
    root.setAttribute('data-reveal-live', '');

    const markFontsReady = () => {
      if (fontsReady || disposed) return;
      fontsReady = true;
      flush();
    };

    scan();

    if (document.fonts) {
      document.fonts.ready.then(markFontsReady).catch(markFontsReady);
    } else {
      markFontsReady();
    }
    const fontTimer = window.setTimeout(markFontsReady, FONT_TIMEOUT);

    let scanFrame = 0;
    const observer = new MutationObserver(() => {
      if (building > 0 || scanFrame) return;
      scanFrame = requestAnimationFrame(() => {
        scanFrame = 0;
        scan();
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Line breaks are a function of width, so a pending reveal has to be
    // re-split when the column changes. A reveal that has already played is
    // plain text again and needs nothing.
    /**
     * The bottom-of-page sweep.
     *
     * `clamp()` above pulls an out-of-reach start back inside the scrollable
     * range, but the last inch of the page is still the one place where a
     * reveal can be left un-played: smooth scrolling settles a fraction of a
     * pixel short of the maximum, and the footer's own height changes as its
     * content loads. This is the belt to that pair of braces — once the reader
     * is at the very bottom, anything still pending and on screen simply
     * plays. Nothing on this site is allowed to stay invisible.
     */
    const sweep = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 2 && window.scrollY < max - 4) return;
      entries.forEach((entry) => entry.settle());
    };
    window.addEventListener('scroll', sweep, { passive: true });
    ScrollTrigger.addEventListener('refresh', sweep);

    let lastWidth = window.innerWidth;
    let resizeTimer = 0;
    const onResize = () => {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        entries.forEach((entry) => {
          if (entry.resplits && !entry.played) entry.build();
        });
        ScrollTrigger.refresh();
      }, 180);
    };
    window.addEventListener('resize', onResize);

    return () => {
      disposed = true;
      rescan.current = null;
      observer.disconnect();
      window.removeEventListener('scroll', sweep);
      ScrollTrigger.removeEventListener('refresh', sweep);
      window.removeEventListener('resize', onResize);
      window.clearTimeout(fontTimer);
      window.clearTimeout(resizeTimer);
      cancelAnimationFrame(scanFrame);
      entries.forEach((entry) => entry.destroy());
      entries.clear();
      queue.length = 0;
      root.removeAttribute('data-reveal-live');
    };
  }, [motionOK]);

  // A route change swaps the whole page under the runner. Elements that
  // survive the navigation keep their `data-text-ready` and are skipped; the
  // new ones are picked up here (the MutationObserver would catch them too,
  // but this also re-measures the triggers once the new page has painted).
  useEffect(() => {
    if (!motionOK) return;
    const frame = requestAnimationFrame(() => {
      rescan.current?.();
      ScrollTrigger.refresh();
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, motionOK]);

  return null;
}
