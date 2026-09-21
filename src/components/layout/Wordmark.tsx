import type { SVGProps } from 'react';
import { SITE } from '@/lib/site';
import { cn } from '@/lib/utils';

/**
 * The same pen the doodles are inked with — see Doodles.tsx. Repeated here
 * rather than imported because the mark is brand chrome, not an illustration:
 * it must never pick up `data-ill`, and RevealRunner's `clearProps: 'all'`
 * would strip a logo that did.
 */
const INK = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  vectorEffect: 'non-scaling-stroke',
} as const;

/** The saucer, drawn by hand so it is never quite round. */
const SAUCER =
  'M20 2.4 C29.9 2.2 37.8 10.1 37.6 20.2 C37.4 30 29.6 37.8 19.8 37.6 C10 37.4 2.2 29.4 2.4 19.6 C2.6 10 10.2 2.6 20 2.4 Z';

/** The cup inside it, a little off-centre of the saucer, as a real one is. */
const CUP =
  'M20.1 7.9 C26.8 7.7 32.3 13.2 32.1 20.1 C31.9 26.7 26.5 32.2 19.9 32.1 C13.2 32 7.8 26.4 7.9 19.8 C8 13.2 13.5 8 20.1 7.9 Z';

/**
 * THE MARK — a cup of coffee seen from above.
 *
 * A saucer, the cup inside it, the coffee printed a shade off register, and
 * the crema turned through it in one stroke. Drawn in the same language as the
 * illustrations: paths rather than `<circle>`, so nothing is quite round, flat
 * colour knocked off the ink like a cheap two-colour print, and outlines at a
 * `non-scaling-stroke` 1.6 so the pen weight is identical at 28px in the nav
 * and at 120px anywhere else.
 *
 * It is built to survive small. The saucer ring reads as a halo rather than a
 * ring at 28px, which is the point — it is what separates the mark from
 * whatever is behind it before the scrim does.
 */
export function CupMark({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden
      focusable="false"
      color="var(--color-cocoa)"
      className={className}
      {...props}
    >
      {/* Flat colour first, knocked off register — see the note in Doodles. */}
      <g transform="translate(1.1 -0.9)">
        <path d={CUP} fill="var(--color-clay)" />
      </g>

      {/* The saucer is inked lighter than the cup: at a glance the mark should
          read as one solid disc with a ring around it, not as two equal
          circles. */}
      <path {...INK} d={SAUCER} strokeOpacity={0.45} />
      <path {...INK} d={CUP} />

      {/* The crema, turned through the surface in a single opening spiral. Set
          in the card white rather than a tint, because at 28px anything softer
          than full contrast against the clay disappears entirely. */}
      <path
        d="M19.6 20.8 C18.3 18.9 20.3 16.7 22.6 17.6 C25.5 18.7 25.9 22.6 23.1 24.4 C19.8 26.6 15.1 24.1 14.7 19.8 C14.2 14.7 19.3 11 24.6 12.3"
        fill="none"
        stroke="var(--color-card)"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeOpacity={0.92}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

type WordmarkProps = {
  className?: string;
};

/**
 * THE LOCKUP
 *
 * The mark, then the name in the display face with the house beneath it.
 *
 * What was here before was the brand set twice in the text face at label size,
 * tracked out — which is the one thing the rest of this site is at pains not to
 * be, and which the footer already contradicts by setting the same name in
 * Fraunces. This agrees with the footer: Fraunces, soft and wonky, is the
 * brand's voice, and the small tracked sans is demoted to the line under it
 * where a sub-line belongs.
 */
export function Wordmark({ className }: WordmarkProps) {
  return (
    <span className={cn('relative flex items-center gap-2.5 select-none', className)}>
      <CupMark className="size-7 shrink-0 transition-transform duration-500 ease-luxe group-hover:-rotate-6 sm:size-8" />

      <span className="flex flex-col gap-[0.15rem]">
        <span className="display-face block text-[1.1rem] leading-none text-ink sm:text-[1.2rem]">
          {SITE.nameShort}
        </span>
        {/* The one place the house still tracks a label out: a sub-line under a
            display word has to span roughly its width to lock to it, and at
            this size there is no other way to get there.

            Set in ink-soft rather than mute. Mute is a caption colour — at
            ten pixels, tracked, over footage it is a line you have to go
            looking for, which is exactly what this lockup was before. */}
        <span className="block font-sans text-[0.62rem] leading-none font-semibold tracking-[0.34em] text-ink-soft transition-colors duration-300 group-hover:text-clay-deep">
          HOUSE
        </span>
      </span>
    </span>
  );
}
