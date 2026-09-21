import type { SVGProps } from 'react';

/**
 * Doodles.
 *
 * The small marks a barista leaves in the margin of a chalkboard menu: steam
 * over a cup, a wobbly underline, a sparkle, a heart, a bean, an arrow pointing
 * at the good stuff, a loop-de-loop. They share the house illustration style
 * with `Florals` and `Foliage`, so all three sets can sit side by side:
 *
 *   - Outlines are inked at 1.6px with `vector-effect: non-scaling-stroke`, so
 *     a sparkle at 12px and steam at 160px carry the same pen weight as each
 *     other and as the flowers around them.
 *   - Flat colour sits *behind* the ink and is knocked 1-3 viewBox units off
 *     register, like a cheap two-colour print. The offset lives on a wrapping
 *     `<g transform>` rather than on the fill itself, because the motion
 *     runner scales every `.ill-pop` from its own centre and would otherwise
 *     have to fight a transform it did not set.
 *   - Paths are drawn by hand (no `<circle>`/`<ellipse>`), so nothing is ever
 *     quite round.
 *
 * Ink colour: outlines stroke `currentColor`, and every root `<svg>` sets the
 * presentation attribute `color="var(--color-cocoa)"`. A presentation attribute
 * loses to any class, so the default is cocoa (matching the other sets), yet a
 * section can re-ink one doodle with a utility such as `text-clay` or
 * `text-clay` (the Squiggle under a clay accent word, say) without a prop.
 *
 * Motion hooks, all inert until the section puts `data-ill` on the root (see
 * RevealRunner): `.ill-draw` outlines draw on, `.ill-pop` fills scale in,
 * `.ill-sway` groups rock about their base, `.ill-twinkle` pulses and
 * `.ill-spin` turns slowly. Without `data-ill` everything renders statically.
 *
 * The roots are `overflow="visible"` because a swaying steam curl or a
 * twinkling sparkle briefly leaves its viewBox, and a clipped doodle looks
 * like a rendering bug rather than a hand-drawn mark.
 */

/** The shared pen: every outline in the set is drawn with exactly this. */
const INK = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  vectorEffect: 'non-scaling-stroke',
} as const;

/** Defaults every doodle's root carries; the caller's props win over all of them. */
const ROOT = {
  'aria-hidden': true,
  focusable: 'false',
  color: 'var(--color-cocoa)',
  overflow: 'visible',
} as const;

/** Sway rocks about the bottom centre of its own group, like a stem in a breeze. */
const SWAY_ORIGIN = { transformOrigin: '50% 100%', transformBox: 'fill-box' } as const;
/** Twinkle and spin turn about the middle of the shape. */
const CENTRE_ORIGIN = { transformOrigin: '50% 50%', transformBox: 'fill-box' } as const;

type DoodleProps = SVGProps<SVGSVGElement>;

/* ------------------------------------------------------------------ */
/* Steam                                                              */
/* ------------------------------------------------------------------ */

/*
 * Each curl is split into its wavy rise (which also carries the blush wash)
 * and the little spiral it ends in (ink only). Keeping the wash off the spiral
 * is what stops the colour reading as a drop shadow: it is a smear of colour
 * that missed the line, not a copy of it.
 */
const STEAM_CURLS = [
  {
    rise: 'M14 74 C8 66 20 60 14 51 C9 43 19 37 16 29',
    curl: ' C14.8 24.6 9.2 24.8 9.6 28.8 C10 31.8 13.8 32 14.2 29.4',
  },
  {
    rise: 'M30 75 C23 66 37 58 30 47 C24 38 36 30 32 20',
    curl: ' C30.6 15 24.2 15.6 24.8 20.4 C25.3 24 29.8 24.2 30.2 21.2',
  },
  {
    rise: 'M46 74 C41 67 51 61 46 53 C42 46 50 41 47.6 34.6',
    curl: ' C46.4 31 41.8 31.6 42.2 35.2 C42.6 38 46 38 46.4 35.8',
  },
] as const;

/**
 * Three wavy steam curls rising from an unseen cup, the middle one tallest,
 * each ending in a small spiral, with a blush wash printed slightly off the
 * ink. Each curl sways on its own.
 *
 * viewBox 60×80 (3:4); the base of the curls sits on the bottom edge, so
 * place it directly above a cup, a heading or a frame edge. Reads from 24px
 * wide; looks best at 40-120px wide.
 */
export function Steam({ className, ...props }: DoodleProps) {
  return (
    <svg viewBox="0 0 60 80" {...ROOT} className={className} {...props}>
      {STEAM_CURLS.map(({ rise, curl }) => (
        <g key={rise} className="ill-sway" style={SWAY_ORIGIN}>
          <g transform="translate(2.4 -1.4)">
            <path
              className="ill-pop"
              d={rise}
              fill="none"
              stroke="var(--color-blush)"
              strokeWidth={3}
              strokeLinecap="round"
            />
          </g>
          <path className="ill-draw" {...INK} d={rise + curl} />
        </g>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Squiggle                                                           */
/* ------------------------------------------------------------------ */

/**
 * A hand-drawn wavy underline to sit under a single word or a short phrase.
 * Seven crests of slightly uneven height, finishing with a small flick.
 *
 * viewBox 200×20 with `preserveAspectRatio="none"`: it is one inked stroke
 * with a non-scaling pen, so it can be stretched to any word's width without
 * the line thickening. Give it `width: 100%` of the word (or a little more)
 * and a height of roughly 0.2-0.3em (10-18px); taller than that and the waves
 * turn into a zigzag. The ink is cocoa like the rest of the set; under a
 * clay accent word add `text-clay` so the line matches the word.
 */
export function Squiggle({ className, ...props }: DoodleProps) {
  return (
    <svg viewBox="0 0 200 20" preserveAspectRatio="none" {...ROOT} className={className} {...props}>
      {/* The one mark in the set that stretches: it is sized to whatever word
          it sits under, so its box is scaled non-uniformly. A non-scaling
          stroke cannot be measured inside a box like that (DrawSVG says so,
          in the console, on every page that draws one), so this stroke scales
          with the box and is set thin enough that the stretch never shows. */}
      <path
        className="ill-draw"
        {...INK}
        vectorEffect={undefined}
        strokeWidth={2.4}
        d="M2 13 C7.3 13 7.3 5.4 12.5 5.4 C19.3 5.4 19.3 15.8 26 15.8 C32.8 15.8 32.8 4.6 39.5 4.6 C46.8 4.6 46.8 16.2 54 16.2 C60.8 16.2 60.8 5.2 67.5 5.2 C74.8 5.2 74.8 15.4 82 15.4 C88.8 15.4 88.8 4.2 95.5 4.2 C102.8 4.2 102.8 16 110 16 C116.5 16 116.5 5.6 123 5.6 C130.3 5.6 130.3 15.2 137.5 15.2 C144.3 15.2 144.3 4.8 151 4.8 C158.3 4.8 158.3 15.8 165.5 15.8 C172 15.8 172 6 178.5 6 C184.3 6 184.3 11.5 190 11.5 C193.5 11.5 193.5 9 197 9"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Sparkle                                                            */
/* ------------------------------------------------------------------ */

const SPARKLE =
  'M16 2.6 C16.9 10.4 19.4 13.6 29.2 15.7 C19.6 17.4 17.3 20.3 16.2 29.6 C14.9 20.5 12.5 17.9 2.8 16.3 C12.3 14.4 14.8 11.1 16 2.6 Z';

/**
 * A four-point star with softly pinched sides and a butter fill printed off
 * register. The arms are deliberately a little uneven.
 *
 * viewBox 32×32 (1:1). Still crisp at 12px; best at 14-40px, scattered in
 * twos and threes near a heading or a handwritten note. `motion` picks the
 * idle loop the runner plays once it has appeared: a soft pulse (`twinkle`,
 * the default) or a very slow turn (`spin`).
 */
export function Sparkle({
  className,
  motion = 'twinkle',
  ...props
}: DoodleProps & { motion?: 'twinkle' | 'spin' }) {
  return (
    <svg viewBox="0 0 32 32" {...ROOT} className={className} {...props}>
      <g className={motion === 'spin' ? 'ill-spin' : 'ill-twinkle'} style={CENTRE_ORIGIN}>
        <g transform="translate(1.6 1.3)">
          <path className="ill-pop" fill="var(--color-butter)" d={SPARKLE} />
        </g>
        <path className="ill-draw" {...INK} d={SPARKLE} />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Heart                                                              */
/* ------------------------------------------------------------------ */

const HEART =
  'M18.2 29.4 C11 24 3.4 18.4 3.7 10.9 C3.9 5.8 7.8 2.9 11.8 3.3 C14.9 3.6 17 5.9 18.2 8.9 C19.5 5.4 22.2 3 25.6 3.2 C29.8 3.4 32.7 6.9 32.3 11.4 C31.7 18.8 24.8 24 18.2 29.4 Z';

/**
 * A plump, slightly lopsided heart in cherry, printed off register down and
 * to the left, with a white shine on the left lobe. Its idle loop is a soft
 * heartbeat (`ill-twinkle`).
 *
 * viewBox 36×32 (9:8). Reads from 14px; best at 16-48px, e.g. beside a
 * "house favourite" sticker or a handwritten note.
 */
export function Heart({ className, ...props }: DoodleProps) {
  return (
    <svg viewBox="0 0 36 32" {...ROOT} className={className} {...props}>
      <g className="ill-twinkle" style={CENTRE_ORIGIN}>
        <g transform="translate(-1.6 1.8)">
          <path className="ill-pop" fill="var(--color-cherry)" d={HEART} />
          <path
            className="ill-pop"
            d="M8.2 11.4 C8.3 9 9.6 7.5 11.8 7.3"
            fill="none"
            stroke="var(--color-card)"
            strokeWidth={1.6}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </g>
        <path className="ill-draw" {...INK} d={HEART} />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Bean                                                               */
/* ------------------------------------------------------------------ */

const BEAN =
  'M16.4 3.4 C22.4 4 25.6 11.4 25 20.2 C24.4 29.4 20 36.6 14 36.5 C8.2 36.4 4.8 29.2 5.2 20.4 C5.6 11.2 10.2 2.8 16.4 3.4 Z';

/**
 * A single coffee bean: a slightly egg-shaped oval with an S-shaped crease,
 * a clay fill printed off register and a faint shine on its shoulder.
 *
 * viewBox 30×40 (3:4), drawn upright; rotate it with a utility class
 * (`rotate-12`, `-rotate-45`...) so a scatter of beans never repeats. Reads
 * from 14px tall; best at 18-56px, floating in section backgrounds (pair with
 * `data-ill-float` for parallax).
 */
export function Bean({ className, ...props }: DoodleProps) {
  return (
    <svg viewBox="0 0 30 40" {...ROOT} className={className} {...props}>
      <g transform="translate(1.8 1.4)">
        <path className="ill-pop" fill="var(--color-clay)" d={BEAN} />
        <path
          className="ill-pop"
          d="M8.8 15.4 C9 12.4 10 10 11.8 8.4"
          fill="none"
          stroke="var(--color-card)"
          strokeOpacity={0.7}
          strokeWidth={1.6}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </g>
      <path className="ill-draw" {...INK} d={BEAN} />
      <path className="ill-draw" {...INK} d="M15.6 6.4 C12 11 18.8 15.4 15.2 20.4 C11.8 25 17.8 28.6 14 33.6" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Arrow                                                              */
/* ------------------------------------------------------------------ */

/**
 * A hand-drawn arrow for handwritten notes: it sets off from the top left,
 * throws one loop, and lands at the bottom right with an open, slightly
 * uneven head. Ink only, no fill.
 *
 * viewBox 120×72 (5:3). Its tail is at the top left, where the note goes, and
 * it points right and a little down. `flip` mirrors it horizontally so it points
 * left instead (tail at the top right). The mirror lives on an inner group,
 * so the root stays free for CSS transforms such as a rotate utility. Reads from
 * 48px wide; best at 60-140px.
 */
export function Arrow({ className, flip = false, ...props }: DoodleProps & { flip?: boolean }) {
  return (
    <svg viewBox="0 0 120 72" {...ROOT} className={className} {...props}>
      <g transform={flip ? 'matrix(-1 0 0 1 120 0)' : undefined}>
        <path
          className="ill-draw"
          {...INK}
          d="M6 18 C24 6 44 8 51 24 C56 37 45 46 40.4 37.6 C36 29.4 56 22.6 73 33.4 C85 41 95 50.6 110 55.6"
        />
        <path
          className="ill-draw"
          {...INK}
          d="M101.8 46.4 C104.8 49.8 107.4 52.8 110 55.6 C106.2 57.4 102.6 58.6 98.2 59.6"
        />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Swirl                                                              */
/* ------------------------------------------------------------------ */

/**
 * A little loop-de-loop flourish: a curl, a lazy dip, one tall loop with a
 * butter centre, and a curl at the other end. It sits wherever a hairline used
 * to divide two thoughts, or finishes off a handwritten line.
 *
 * viewBox 120×44 (30:11). Reads from 48px wide; best at 64-180px.
 */
export function Swirl({ className, ...props }: DoodleProps) {
  return (
    <svg viewBox="0 0 120 44" {...ROOT} className={className} {...props}>
      <g transform="translate(1.8 1.4)">
        <path
          className="ill-pop"
          fill="var(--color-butter)"
          d="M52.8 7.4 C58.6 8 59.2 17 54.4 23 C47.6 20.6 45.4 8.8 52.8 7.4 Z"
        />
      </g>
      <path
        className="ill-draw"
        {...INK}
        d="M6 29 C3.8 25.6 6.8 21.6 10.6 22.8 C14.4 24 13.8 29.6 19 31 C29 33.6 42 31.6 50 25.6 C58.8 18.4 61.6 6.6 53.4 5.2 C45 3.8 42.4 18 55 25.2 C64.6 30.4 83 33.2 97 29.6 C103 28 107.4 24.2 111.6 25 C115.4 25.8 115 31.2 111.2 31"
      />
    </svg>
  );
}
