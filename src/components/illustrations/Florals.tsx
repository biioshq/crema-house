import type { SVGProps } from 'react';

/**
 * Florals.
 *
 * The flowers of the house set: a daisy, a coffee-blossom spray, a tulip, and
 * the cup bouquet the menu is built around. They share the illustration style
 * with `Doodles` and `Foliage`, so the three files can sit side by side in one
 * composition:
 *
 *   - Outlines are inked at 1.6px with `vector-effect: non-scaling-stroke`, so
 *     a daisy at 28px and a bouquet at 180px carry the same pen weight as each
 *     other and as the doodles around them.
 *   - Flat colour sits *behind* the ink and is knocked 2-3 viewBox units off
 *     register, like a cheap two-colour print. The offset lives on a wrapping
 *     `<g transform>` rather than on the fill itself, because the motion runner
 *     scales every `.ill-pop` from its own centre and would otherwise have to
 *     fight a transform it did not set.
 *   - Stems are the one place the two layers are both strokes: a fat sage wash
 *     printed off the thin cocoa line, which reads as a smear of colour that
 *     missed the line rather than as a drop shadow.
 *   - Petals are hand-cut blades placed round the centre at uneven angles and
 *     slightly uneven lengths, so no flower is ever quite symmetrical and no
 *     two heads in a bouquet repeat.
 *
 * Ink colour: outlines stroke `currentColor`, and every root `<svg>` sets the
 * presentation attribute `color="var(--color-cocoa)"`. A presentation attribute
 * loses to any class, so the default is cocoa (matching the other sets), yet a
 * section can re-ink a flower with a utility such as `text-clay` without a prop.
 *
 * Motion hooks, all inert until the section puts `data-ill` on the root (see
 * RevealRunner): `.ill-draw` outlines draw on, `.ill-pop` fills scale in,
 * `.ill-sway` groups rock about their base. Every piece wraps its plant (not
 * its root) in `.ill-sway`, so a section is free to rotate the root with a
 * utility class the way Voices tilts its pressed flowers. Without `data-ill`
 * everything renders statically.
 *
 * The roots are `overflow="visible"` because a swaying stem briefly leaves its
 * viewBox, and a clipped flower looks like a rendering bug rather than a
 * hand-drawn mark.
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

/** Defaults every floral's root carries; the caller's props win over all of them. */
const ROOT = {
  'aria-hidden': true,
  focusable: 'false',
  color: 'var(--color-cocoa)',
  overflow: 'visible',
} as const;

/** Sway rocks about the bottom centre of its own group, like a stem in a breeze. */
const SWAY_ORIGIN = { transformOrigin: '50% 100%', transformBox: 'fill-box' } as const;

type FloralProps = SVGProps<SVGSVGElement>;

/* ------------------------------------------------------------------ */
/* Shared parts                                                       */
/* ------------------------------------------------------------------ */

/*
 * The heads are drawn about the origin rather than inside a viewBox, so the
 * same geometry can be dropped into a flower, a spray or a bouquet with one
 * `translate`/`scale` and still print at the pen weight of everything else.
 */

/** One daisy blade, pointing up, stopping at the collar of the centre. */
const DAISY_PETAL =
  'M0 -6.6 C-4.6 -9.6 -5.4 -15.4 -3 -20.6 C-1.7 -23.4 1.7 -23.6 3.1 -20.8 C5.6 -15.6 4.7 -9.8 0 -6.6 Z';
/** Nine blades at uneven angles and lengths: the daisy head, radius ~23. */
const DAISY_PETALS = [
  { a: 0, s: 1 },
  { a: 41, s: 1.06 },
  { a: 79, s: 0.94 },
  { a: 121, s: 1 },
  { a: 158, s: 1.04 },
  { a: 201, s: 0.96 },
  { a: 239, s: 1 },
  { a: 280, s: 1.05 },
  { a: 320, s: 0.95 },
] as const;
const DAISY_EYE =
  'M0 -6.8 C4 -7 7.2 -3.8 6.8 0.4 C6.4 4.4 3.3 7 -0.6 6.6 C-4.4 6.2 -7 3.1 -6.6 -0.9 C-6.3 -4.4 -3.5 -6.7 0 -6.8 Z';
/** Four seeds in the eye. Zero-length segments, so the round cap draws the dot. */
const DAISY_SEEDS = 'M-2.6 -2.2 L-2.5 -2.1 M2 -3.4 L2.1 -3.3 M2.6 1.8 L2.7 1.9 M-1.8 3 L-1.7 3.1';

/** One coffee-flower petal: a narrower lance than the daisy's blade. */
const COFFEE_PETAL =
  'M0 -4.4 C-3.2 -6.6 -4 -11.8 -1.9 -17.4 C-1.1 -19.5 1.1 -19.5 1.9 -17.4 C4 -11.8 3.2 -6.6 0 -4.4 Z';
/** Five lances: the star-shaped coffee flower, radius ~19. */
const COFFEE_PETALS = [
  { a: -8, s: 1 },
  { a: 64, s: 0.95 },
  { a: 140, s: 1.04 },
  { a: 214, s: 0.96 },
  { a: 288, s: 1 },
] as const;
const COFFEE_EYE =
  'M0 -4.6 C2.8 -4.8 5 -2.6 4.7 0.4 C4.4 3.2 2.2 5 -0.5 4.6 C-3.2 4.2 -4.9 2 -4.6 -0.8 C-4.4 -3.2 -2.4 -4.5 0 -4.6 Z';

/** An unopened bud: a teardrop about the origin, tip up. */
const BUD =
  'M0.4 -6.6 C4.2 -4.6 5.6 -0.6 4.4 2.8 C3.2 6.2 -0.6 7.4 -3.4 5.6 C-6.4 3.6 -5.6 -1.4 -2.6 -4.4 C-1.6 -5.4 -0.6 -6.2 0.4 -6.6 Z';

type Petal = { readonly a: number; readonly s: number };

/*
 * Each petal gets its own `<g transform>` and the class goes on the `<path>`
 * inside it. The runner gives `.ill-pop` a transform of its own, and letting it
 * own the path's transform outright means it can never clobber the rotation
 * that puts the petal where it belongs.
 */
function Petals({ d, petals, fill }: { d: string; petals: readonly Petal[]; fill?: string }) {
  return (
    <>
      {petals.map(({ a, s }) => (
        <g key={a} transform={`rotate(${a}) scale(${s})`}>
          {fill ? (
            <path className="ill-pop" fill={fill} d={d} />
          ) : (
            <path className="ill-draw" {...INK} d={d} />
          )}
        </g>
      ))}
    </>
  );
}

/**
 * A daisy head about the origin: white blades and a butter eye printed off
 * register, then the ink. `offset` is the mis-registration for this head, which
 * grows with the head so a small daisy is not knocked as far off as a large one.
 */
function DaisyHead({ offset }: { offset: string }) {
  return (
    <>
      <g transform={offset}>
        <Petals d={DAISY_PETAL} petals={DAISY_PETALS} fill="var(--color-card)" />
        <path className="ill-pop" fill="var(--color-butter)" d={DAISY_EYE} />
      </g>
      <Petals d={DAISY_PETAL} petals={DAISY_PETALS} />
      <path className="ill-draw" {...INK} d={DAISY_EYE} />
      <path className="ill-draw" {...INK} d={DAISY_SEEDS} />
    </>
  );
}

/** A five-petal coffee flower about the origin, built the same way. `eye` is the centre's fill. */
function CoffeeFlower({ offset, eye }: { offset: string; eye: string }) {
  return (
    <>
      <g transform={offset}>
        <Petals d={COFFEE_PETAL} petals={COFFEE_PETALS} fill="var(--color-card)" />
        <path className="ill-pop" fill={eye} d={COFFEE_EYE} />
      </g>
      <Petals d={COFFEE_PETAL} petals={COFFEE_PETALS} />
      <path className="ill-draw" {...INK} d={COFFEE_EYE} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Daisy                                                              */
/* ------------------------------------------------------------------ */

/** Stem and the two leaves the daisy stands on, drawn once per layer. */
const DAISY_STEM = 'M35.6 42 C34.2 52 36.8 60 35.8 71';
const DAISY_LEAVES = [
  'M35 52 C29 48.6 22.4 49.6 19.2 53.8 C24 58.4 31 58.6 35 54.6 Z',
  'M36 62 C41 58.4 47.2 58.6 50.6 62 C46.6 66.8 40.4 67.2 36.4 64.2 Z',
] as const;

/**
 * A single daisy: nine white blades round a butter eye with four seeds in it,
 * on a stem with a leaf to each side. The whole plant sways about the foot of
 * the stem.
 *
 * viewBox 72×72 (1:1), so it takes either a square utility (`size-16`) or a
 * height with `w-auto`. The stem ends on the bottom edge, which lines a row of
 * them up on a baseline (the footer garden). Reads from 24px; best at 28-80px.
 */
export function Daisy({ className, ...props }: FloralProps) {
  return (
    <svg viewBox="0 0 72 72" {...ROOT} className={className} {...props}>
      <g className="ill-sway" style={SWAY_ORIGIN}>
        <g transform="translate(2 2.4)">
          <path
            className="ill-pop"
            d={DAISY_STEM}
            fill="none"
            stroke="var(--color-sage)"
            strokeWidth={4}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          {DAISY_LEAVES.map((d) => (
            <path key={d} className="ill-pop" fill="var(--color-sage)" d={d} />
          ))}
        </g>
        <path className="ill-draw" {...INK} d={DAISY_STEM} />
        {DAISY_LEAVES.map((d) => (
          <path key={d} className="ill-draw" {...INK} d={d} />
        ))}

        <g transform="translate(35 26)">
          <DaisyHead offset="translate(1.8 2.2)" />
        </g>
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Blossom                                                            */
/* ------------------------------------------------------------------ */

/*
 * A coffee bush in flower, cut down to one sprig: an upright stem, a spur out
 * to the right carrying a second flower and a short spur down to a bud. The
 * spurs leave the stem at different heights on purpose; earlier drafts had them
 * cross at the same point and the junction inked itself into a knot.
 */
const BLOSSOM_STEMS = [
  { d: 'M24 70 C23 60 24 48 26.6 36', w: 4 },
  { d: 'M25 56 C33 54 42 49 48 44', w: 3.2 },
  { d: 'M24.4 62 C22.4 60 19.6 57.6 17.6 55', w: 2.8 },
] as const;
const BLOSSOM_LEAVES = [
  'M22 62 C17 58 10 58 7 62 C11 67 19 67 22.4 64 Z',
  'M30 58 C36 56 44 58 47 63 C41 67 33 65 30.4 61 Z',
] as const;

/**
 * A coffee-flower cluster: two white five-petal stars, one open wide with a
 * butter centre and one smaller with a clay one, plus a blush bud still closed,
 * on a leafy sprig. The sprig sways about the foot of its stem.
 *
 * viewBox 72×72 (1:1), matching `Daisy` so the two can be swapped in the same
 * slot (Voices alternates them card by card). The spray fills the box from the
 * lower left to the upper right and leaves the far corners open, which is what
 * lets it tuck into a card corner under a rotate utility. Reads from 28px;
 * best at 40-100px.
 */
export function Blossom({ className, ...props }: FloralProps) {
  return (
    <svg viewBox="0 0 72 72" {...ROOT} className={className} {...props}>
      <g className="ill-sway" style={SWAY_ORIGIN}>
        <g transform="translate(-1.8 2.2)">
          {BLOSSOM_STEMS.map(({ d, w }) => (
            <path
              key={d}
              className="ill-pop"
              d={d}
              fill="none"
              stroke="var(--color-sage)"
              strokeWidth={w}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {BLOSSOM_LEAVES.map((d) => (
            <path key={d} className="ill-pop" fill="var(--color-sage)" d={d} />
          ))}
        </g>
        {BLOSSOM_STEMS.map(({ d }) => (
          <path key={d} className="ill-draw" {...INK} d={d} />
        ))}
        {BLOSSOM_LEAVES.map((d) => (
          <path key={d} className="ill-draw" {...INK} d={d} />
        ))}

        <g transform="translate(15 51) rotate(-36)">
          <g transform="translate(-1.6 2.2)">
            <path className="ill-pop" fill="var(--color-blush)" d={BUD} />
          </g>
          <path className="ill-draw" {...INK} d={BUD} />
        </g>

        {/* The open flowers go on last so they sit over the greenery. */}
        <g transform="translate(28 24)">
          <CoffeeFlower offset="translate(1.8 2.2)" eye="var(--color-butter)" />
        </g>
        <g transform="translate(52 40) scale(0.7)">
          <CoffeeFlower offset="translate(2.6 3.2)" eye="var(--color-clay)" />
        </g>
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Tulip                                                              */
/* ------------------------------------------------------------------ */

/*
 * The bloom is three petals, not one cup with creases drawn on it: a side petal
 * each way and a front petal over the seam between them. Inked that way the
 * flower keeps its shape when the blush behind it is knocked off register,
 * because the register shift moves a whole petal rather than half a line.
 */
const TULIP_BLOOM = [
  'M20 51 C13 48 8.6 40 8.4 28 C8.2 17.6 12.4 10 16 7.4 C15 18 15.6 40 20 51 Z',
  'M20 51 C27 48 31.4 40 31.6 28 C31.8 17.6 27.6 10 24 7.4 C25 18 24.4 40 20 51 Z',
  'M20 52 C16 46 14.6 34 15.6 22 C16.4 12.4 18.4 7 20.2 6.4 C22 7 24 12.6 24.6 22.2 C25.4 34 24 46 20 52 Z',
] as const;
const TULIP_STEM = 'M20.4 52 C19.2 68 21.4 88 20.6 117';
const TULIP_LEAVES = [
  'M20 74 C12 70 5.6 78 4.4 92 C3.4 104 8 112 12.6 114.6 C10 100 12.6 84 20 74 Z',
  'M20.6 62 C27.4 60 33.6 68 35.2 80.6 C36.4 90.6 32.6 99 28.8 101.6 C30.6 89 27.4 72 20.6 62 Z',
] as const;

/**
 * A tulip: a three-petal blush bloom on a long stem with two strappy leaves,
 * one reaching down each side. The whole plant sways about the foot of the stem.
 *
 * viewBox 40×120 (1:3), so it is sized by height with `w-auto`. The stem runs
 * to the bottom edge to stand it on a baseline next to shorter flowers. Reads
 * from 40px tall; best at 56-140px.
 */
export function Tulip({ className, ...props }: FloralProps) {
  return (
    <svg viewBox="0 0 40 120" {...ROOT} className={className} {...props}>
      <g className="ill-sway" style={SWAY_ORIGIN}>
        <g transform="translate(1.8 2.2)">
          <path
            className="ill-pop"
            d={TULIP_STEM}
            fill="none"
            stroke="var(--color-sage)"
            strokeWidth={4}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          {TULIP_LEAVES.map((d) => (
            <path key={d} className="ill-pop" fill="var(--color-sage)" d={d} />
          ))}
          {TULIP_BLOOM.map((d) => (
            <path key={d} className="ill-pop" fill="var(--color-blush)" d={d} />
          ))}
        </g>
        <path className="ill-draw" {...INK} d={TULIP_STEM} />
        {TULIP_LEAVES.map((d) => (
          <path key={d} className="ill-draw" {...INK} d={d} />
        ))}
        {TULIP_BLOOM.map((d) => (
          <path key={d} className="ill-draw" {...INK} d={d} />
        ))}
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* CupBouquet                                                         */
/* ------------------------------------------------------------------ */

/*
 * Four stems leave the cup at almost the same point and fan out, so the eye
 * reads one bunch rather than four separate plants. The saucer is drawn before
 * the cup: its far rim passes behind the cup body, and the cup's white fill is
 * what hides it.
 */
const BOUQUET_STEMS = [
  { d: 'M80 104 C73 84 62 66 49 54', w: 3.4 },
  { d: 'M84 104 C88 80 92 58 97 40', w: 3.4 },
  { d: 'M89 104 C101 96 118 82 130 72', w: 3.4 },
  { d: 'M76 105 C62 101 46 95 34 88', w: 3 },
] as const;
const BOUQUET_LEAVES = [
  'M70 82 C61 77 50 79 45 86 C52 93 64 92 70.4 85.4 Z',
  'M99 66 C107 58 119 56 125 61 C119 70 107 71 99.6 68 Z',
  'M60 98 C52 95 43 97 39 102 C45 108 54 107 60.4 101.6 Z',
] as const;
const CUP_BODY =
  'M44 106 C46 130 52 150 62 157 C74 160.6 92 160.6 104 157 C114 150 120 130 122 106';
const CUP_RIM = 'M44 106 C60 100.4 106 100.4 122 106 C106 111.6 60 111.6 44 106 Z';
const CUP_HANDLE = 'M122.8 115 C136 112 144.6 119.6 142 129.6 C139.4 139.6 128.6 143.8 120 142';
const CUP_FOOT = 'M62 157 C74 160.6 92 160.6 104 157';
const SAUCER = 'M28 165 C50 172.6 116 172.6 138 165 C116 157.4 50 157.4 28 165 Z';

/**
 * The signature piece: a wide coffee cup on its saucer used as a vase, with two
 * daisies, a coffee flower, a bud and three leaves spilling out of it. The rim
 * keeps a clay-soft wash, so the cup still reads as a cup with something in it
 * rather than as an empty pot.
 *
 * Only the bunch sways; the cup and saucer stay put, which is what sells the
 * flowers as loose in the water.
 *
 * viewBox 168×176 (roughly 1:1, a touch taller than wide), sized by width with
 * `h-auto`. The bunch is the wider half, so the cup sits slightly left of the
 * optical centre. Reads from 64px wide; best at 80-180px.
 */
export function CupBouquet({ className, ...props }: FloralProps) {
  return (
    <svg viewBox="0 0 168 176" {...ROOT} className={className} {...props}>
      <g className="ill-sway" style={SWAY_ORIGIN}>
        <g transform="translate(-2 2.4)">
          {BOUQUET_STEMS.map(({ d, w }) => (
            <path
              key={d}
              className="ill-pop"
              d={d}
              fill="none"
              stroke="var(--color-sage)"
              strokeWidth={w}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {BOUQUET_LEAVES.map((d) => (
            <path key={d} className="ill-pop" fill="var(--color-sage)" d={d} />
          ))}
        </g>
        {BOUQUET_STEMS.map(({ d }) => (
          <path key={d} className="ill-draw" {...INK} d={d} />
        ))}
        {BOUQUET_LEAVES.map((d) => (
          <path key={d} className="ill-draw" {...INK} d={d} />
        ))}

        <g transform="translate(29 84) rotate(-58) scale(1.1)">
          <g transform="translate(-1.6 2.4)">
            <path className="ill-pop" fill="var(--color-blush)" d={BUD} />
          </g>
          <path className="ill-draw" {...INK} d={BUD} />
        </g>

        <g transform="translate(44 48) scale(0.98)">
          <DaisyHead offset="translate(1.9 2.4)" />
        </g>
        <g transform="translate(98 34) scale(1.05)">
          <CoffeeFlower offset="translate(1.8 2.3)" eye="var(--color-clay)" />
        </g>
        <g transform="translate(133 68) scale(0.66)">
          <DaisyHead offset="translate(2.7 3.3)" />
        </g>
      </g>

      {/* Saucer first, so the cup covers its far rim. */}
      <g transform="translate(2.2 2.6)">
        <path className="ill-pop" fill="var(--color-sand)" d={SAUCER} />
      </g>
      <path className="ill-draw" {...INK} d={SAUCER} />

      <g transform="translate(2.2 2.6)">
        <path className="ill-pop" fill="var(--color-card)" d={`${CUP_BODY} Z`} />
        <path className="ill-pop" fill="var(--color-clay-soft)" d={CUP_RIM} />
      </g>
      <path className="ill-draw" {...INK} d={CUP_BODY} />
      <path className="ill-draw" {...INK} d={CUP_RIM} />
      <path className="ill-draw" {...INK} d={CUP_HANDLE} />
      <path className="ill-draw" {...INK} d={CUP_FOOT} />
    </svg>
  );
}
