'use client';

import { useRef, type ComponentType, type ReactNode, type SVGProps } from 'react';
import { SplitHeading, type SplitMode } from '@/components/motion/SplitHeading';
import { Motes } from '@/components/motion/Motes';
import { Blossom, CupBouquet, Daisy, Tulip } from '@/components/illustrations/Florals';
import { Sprig } from '@/components/illustrations/Foliage';
import { gsap, useGsap } from '@/hooks/useGsap';
import { useMotionOK } from '@/hooks/useMediaQuery';

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  lede?: ReactNode;
  /** This page's coordinate in the one site-wide sequence: 01 Hero, 02 The
   *  Room, 03 The Menu, 04 The Craft, 05 Voices, 06 Reservations. A sub-page
   *  takes the number of the home section it expands rather than starting a
   *  sequence of its own, so "the menu is 03" is true on both pages. */
  numeral?: string;
  mode?: SplitMode;
  id?: string;
};

type Ornament = {
  Art: ComponentType<SVGProps<SVGSVGElement>>;
  /** Sized by height so the eyebrow row keeps its baseline on every page. */
  className: string;
  /** Reveal mode for the lede, varied with the drawing. */
  lede: 'lines' | 'words';
};

/**
 * One drawing per masthead, chosen by the page's numeral.
 *
 * Every sub-page shares this component, so without a map they would all open
 * with the same ornament and the four headers would read as one template with
 * the words swapped. Keyed on the numeral rather than on a new prop because
 * the numeral is the one thing each page already declares about itself.
 *
 * The pieces are picked so that no page shows the same drawing twice: the
 * menu's own `CupBouquet` only renders with the section header it hides on
 * /menu, and the pressed flowers on /voices are Blossom and Sprig.
 */
const ORNAMENTS: Record<string, Ornament> = {
  // Our story
  '02': { Art: Blossom, className: 'h-14 w-auto sm:h-16 lg:h-20', lede: 'lines' },
  // The menu
  '03': { Art: CupBouquet, className: 'h-16 w-auto sm:h-20 lg:h-24', lede: 'words' },
  // Voices
  '05': { Art: Daisy, className: 'h-12 w-auto sm:h-14 lg:h-16', lede: 'words' },
  // Reservations
  '06': { Art: Tulip, className: 'h-16 w-auto sm:h-20 lg:h-24', lede: 'lines' },
};

const FALLBACK: Ornament = {
  Art: Sprig,
  className: 'mb-1 h-8 w-auto sm:h-10',
  lede: 'lines',
};

/**
 * Sets the last word of the title in the clay italic accent. The pages pass a
 * plain string, so the emphasis is applied here rather than asked of them.
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
 * The masthead every sub-page opens with.
 *
 * Sub-pages have no hero footage to fall into, so the header does that work
 * instead: a tall band of paper lit from above, the page numeral engraved
 * into it, dust hanging in the light, and a drawing tucked beside the
 * handwritten label like something inked in the margin.
 *
 * The text and the drawing are revealed declaratively (`data-text`,
 * `data-ill`) by the shared RevealRunner; all this component still owns is
 * the numeral's scroll drift, which is a parallax rather than a reveal.
 */
export function PageHeader({
  eyebrow,
  title,
  lede,
  numeral,
  mode = 'lines-rise',
  id = 'page-heading',
}: PageHeaderProps) {
  const rootRef = useRef<HTMLElement>(null);
  const motionOK = useMotionOK();

  const ornament = (numeral && ORNAMENTS[numeral]) || FALLBACK;
  const { Art } = ornament;

  useGsap(
    () => {
      if (!motionOK || !numeral) return;

      // Drift only — no opacity ramp. The header sits at scroll 0, so a
      // scrubbed fade-in would leave the numeral invisible exactly where it
      // is meant to be read.
      gsap.fromTo(
        '.page-numeral',
        { yPercent: 8 },
        {
          yPercent: -14,
          ease: 'none',
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.4,
          },
        }
      );
    },
    [motionOK, numeral],
    rootRef
  );

  return (
    <header
      ref={rootRef}
      className="relative isolate overflow-hidden pt-[calc(5rem+var(--spacing-section))] pb-section lg:pt-[calc(5.5rem+var(--spacing-section))]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(56% 58% at 32% 12%, rgb(252 249 243 / 0.55) 0%, rgb(241 231 213 / 0.42) 48%, transparent 78%)',
        }}
      />
      <Motes count={7} opacity={0.5} seed={0x7a11} className="-z-10" />

      {numeral && (
        <span
          aria-hidden
          className="page-numeral display-face pointer-events-none absolute -top-6 right-[-3vw] -z-10 text-[26vw] leading-none text-ink/5 lining-nums select-none lg:right-[3vw] lg:text-[13vw]"
        >
          {numeral}
        </span>
      )}

      <div className="shell">
        {/* The label and its drawing share a row, so the ornament can never
            land on the title however narrow the page gets. */}
        <div className="flex flex-wrap items-end gap-x-5 gap-y-2">
          <p data-text="write" className="eyebrow">
            {eyebrow}
          </p>
          <Art
            data-ill
            data-ill-delay="0.35"
            className={`pointer-events-none shrink-0 ${ornament.className}`}
          />
        </div>

        <SplitHeading
          as="h1"
          id={id}
          mode={mode}
          start="top 98%"
          className="mt-6 max-w-[13em] text-h1"
        >
          {accentLastWord(title)}
        </SplitHeading>

        {lede && (
          <p
            data-text={ornament.lede}
            className="mt-9 max-w-[52ch] font-sans text-lede text-ink-soft/80"
          >
            {lede}
          </p>
        )}
      </div>
    </header>
  );
}
