import type { SVGProps } from 'react';

/**
 * Foliage.
 *
 * The green half of the illustration set: the sprig that holds an eyebrow, the
 * cherry-laden coffee branch that gets tucked into a photo corner, and the long
 * vine that stands in for the hairlines this redesign took out. They share the
 * house style with `Doodles` and `Florals`, so the three files can sit on the
 * same page without anything looking imported:
 *
 *   - Outlines are inked at 1.6px with `vector-effect: non-scaling-stroke`, so
 *     a 24px sprig and a full-width vine carry the same pen weight.
 *   - Flat colour sits *behind* the ink and is knocked a couple of viewBox
 *     units off register, like a cheap two-colour print. The offset lives on a
 *     wrapping `<g transform>` rather than on the fill itself, because the
 *     motion runner scales every `.ill-pop` from its own centre and would
 *     otherwise have to fight a transform it did not set.
 *   - Nothing is a `<circle>` or an `<ellipse>`. Every leaf, berry and petal is
 *     a hand-set cubic, generated once from a seeded sketch so no two leaves on
 *     a stem are the same length, angle or fullness.
 *
 * Leaves are drawn as *clumps*: one multi-subpath `d` per group of neighbouring
 * leaves, rather than one path per leaf. A vine carries forty-odd leaves, and
 * forty individually staggered tweens is both a slow reveal and a lot of DOM;
 * six clumps read as the vine growing left to right and cost almost nothing.
 * Each clump pops about its own centre, which is why the leaves are grouped by
 * position along the stem and not, say, by side.
 *
 * Ink colour: outlines stroke `currentColor` and every root `<svg>` sets the
 * presentation attribute `color="var(--color-cocoa)"`. A presentation attribute
 * loses to any class, so the default is cocoa, yet a section can re-ink one
 * piece with a utility such as `text-clay` without a prop. Veins are always
 * sage-deep: they are part of the leaf, not the outline.
 *
 * Motion hooks, all inert until the section puts `data-ill` on the root (see
 * RevealRunner): `.ill-draw` outlines draw on, `.ill-pop` fills scale in,
 * `.ill-sway` groups rock about their base. Without `data-ill` everything
 * renders statically.
 *
 * The roots are `overflow="visible"`: a swaying sprig briefly leaves its
 * viewBox, and a clipped leaf looks like a rendering bug rather than a mark
 * made by hand.
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

/** Veins and the finer stalks, a shade greener than the outline. */
const VEIN = { ...INK, stroke: 'var(--color-sage-deep)' } as const;

/** Defaults every root carries; the caller's props win over all of them. */
const ROOT = {
  'aria-hidden': true,
  focusable: 'false',
  color: 'var(--color-cocoa)',
  overflow: 'visible',
} as const;

/** Sway rocks about the bottom centre of its own group, like a stem in a breeze. */
const SWAY_ORIGIN = { transformOrigin: '50% 100%', transformBox: 'fill-box' } as const;

type FoliageProps = SVGProps<SVGSVGElement>;

/** One clump of neighbouring leaves: the outlines, and their veins. */
type Clump = { leaves: string; ribs: string };

/* ------------------------------------------------------------------ */
/* Sprig                                                              */
/* ------------------------------------------------------------------ */

const SPRIG = {
  stem: 'M4 32 C20 32.5 38 24 63 12.5',
  leaves: 'M9.9 31.8 C15.2 33 19 27.1 17.6 20.1 C11.1 20.6 6.8 26.1 9.9 31.8 Z M13.4 31.4 C11.1 37.5 16.4 42.4 23.8 41.4 C24.2 34.3 19.4 28.8 13.4 31.4 Z M22.3 29.3 C28.5 29.4 31 22.3 27.5 15.3 C21.3 17.5 18.1 24.3 22.3 29.3 Z M26.1 28.1 C24.4 34.3 29.8 38.5 36.8 36.7 C36.4 30.4 31.4 25.6 26.1 28.1 Z M36 24.5 C41.7 24.6 43.8 18.4 40.5 12.2 C34.2 13.8 31.4 19.7 36 24.5 Z M40.4 22.7 C40.2 27.5 45.5 30.1 50.8 28.1 C49.4 22.8 44.3 19.6 40.4 22.7 Z M51.5 17.8 C57.1 16.9 57.9 10.8 53.4 5.6 C48.5 8.4 47.1 14.4 51.5 17.8 Z M63 12.5 C67.1 16.4 72.9 13.6 74.8 7.1 C69.4 4.7 63.3 6.9 63 12.5 Z',
  ribs: 'M9.9 31.8 C12.5 27.7 15.4 23.4 17.3 20.6 M13.4 31.4 C17 34.9 20.9 38.6 23.4 41 M22.3 29.3 C24.1 24.4 26.1 19.2 27.3 15.9 M26.1 28.1 C29.8 31.2 33.8 34.3 36.4 36.4 M36 24.5 C37.6 20.2 39.2 15.6 40.3 12.7 M40.4 22.7 C44 24.6 47.9 26.6 50.4 27.9 M51.5 17.8 C52.2 13.5 52.9 9 53.3 6.1 M63 12.5 C67.1 10.6 71.5 8.6 74.3 7.3',
};

/**
 * A small leafy sprig: seven leaves alternating along a stem that rises from
 * the bottom left, shrinking towards a terminal leaf at the tip. The whole
 * thing sways as one.
 *
 * viewBox 80x42 (roughly 2:1), so a `h-6 w-12` or `h-10 w-20` box fits it
 * with no distortion. Still legible at 20px wide; best at 40-100px. `flip`
 * mirrors it so the tip points left, for the left-hand half of a mirrored
 * pair. The mirror lives on an inner group, leaving the root free for CSS
 * transforms such as a rotate utility.
 */
export function Sprig({ className, flip = false, ...props }: FoliageProps & { flip?: boolean }) {
  return (
    <svg viewBox="0 0 80 42" {...ROOT} className={className} {...props}>
      <g transform={flip ? 'matrix(-1 0 0 1 80 0)' : undefined}>
        <g className="ill-sway" style={SWAY_ORIGIN}>
          <g transform="translate(1.6 -1.6)">
            <path className="ill-pop" fill="var(--color-sage)" d={SPRIG.leaves} />
          </g>
          <path className="ill-draw" {...INK} d={SPRIG.stem} />
          <path className="ill-draw" {...INK} d={SPRIG.leaves} />
          <path className="ill-draw" {...VEIN} d={SPRIG.ribs} />
        </g>
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* CoffeeBranch                                                       */
/* ------------------------------------------------------------------ */

const BRANCH = {
  stem: 'M8 40 C74 46 148 104 230 140',
  nodes: [
    { leaves: 'M36.2 45.4 C53.9 51.5 71.2 32.1 71.4 7.1 C49.4 6.9 30.4 24.7 36.2 45.4 Z M36.2 45.4 C24 57.8 31.3 79.8 50.1 89.7 C57.8 72 52.2 49.3 36.2 45.4 Z', ribs: 'M36.2 45.4 C48.5 32 61.6 17.8 70 8.7 M36.2 45.4 C41 60.9 46.1 77.3 49.6 87.9' },
    { leaves: 'M86.7 65.3 C100.9 73.4 120.3 59.4 125.8 37.8 C106.9 34.7 86.5 47.2 86.7 65.3 Z M86.7 65.3 C73.2 74.8 76.4 95.9 92.4 107.7 C102.6 92.7 101.2 71.3 86.7 65.3 Z', ribs: 'M86.7 65.3 C100.4 55.7 114.9 45.5 124.3 38.9 M86.7 65.3 C88.6 80.2 90.7 95.8 92.2 106' },
    { leaves: 'M140 93.5 C152.2 101.1 169.5 89.4 175 70.5 C158.2 66.7 140 76.9 140 93.5 Z M140 93.5 C128.5 100.6 129.6 119.5 141.6 131.3 C153.2 118.8 153.8 99.8 140 93.5 Z', ribs: 'M140 93.5 C152.2 85.4 165.2 77 173.6 71.5 M140 93.5 C140.6 106.7 141.2 120.7 141.6 129.8' },
    { leaves: 'M193.6 122.6 C204.6 130.2 221.1 120.2 226.9 102.9 C212 99.6 194.9 108.3 193.6 122.6 Z M193.6 122.6 C183.2 129.1 184.1 146.5 195.1 157.4 C203.8 146.1 204.2 128.6 193.6 122.6 Z', ribs: 'M193.6 122.6 C205.3 115.7 217.6 108.5 225.5 103.7 M193.6 122.6 C194.1 134.8 194.6 147.7 195 156' },
  ],
  clusters: [
    {
      stalks: 'M63.2 55.8 C65.2 61.8 67.2 64.8 69.2 69.8 M69.2 69.8 Q66.4 75.3 60.2 78.3 M69.2 69.8 Q73 72.5 76.5 72.8 M69.2 69.8 Q68.6 81.3 70.3 90.3',
      berries: 'M70.7 85.1 C71 87.6 69.9 90.4 68 92 C66.2 93.5 62.2 95.1 59.6 94.5 C57 94 53.7 91.3 52.5 88.9 C51.3 86.4 51.8 82 52.7 79.7 C53.5 77.5 55.1 75.8 57.4 75.4 C59.6 74.9 63.9 75.5 66.2 77.1 C68.4 78.7 70.4 82.6 70.7 85.1 Z M85.5 80 C85.4 82.2 83.5 84.5 81.9 85.9 C80.3 87.2 77.9 88.5 75.7 88.1 C73.6 87.7 69.9 85.9 68.8 83.7 C67.8 81.4 68.3 76.9 69.4 74.8 C70.5 72.6 73.3 71.1 75.4 70.8 C77.6 70.4 80.7 71.1 82.4 72.7 C84 74.2 85.5 77.8 85.5 80 Z M77.3 97.5 C77.1 99.6 75.3 102 73.7 103.2 C72.2 104.4 70 105.4 68 104.8 C66.1 104.3 62.7 101.7 61.7 99.9 C60.8 98.1 61.4 95.7 62.6 93.8 C63.7 92 66.5 89.6 68.6 89 C70.7 88.5 73.7 89.2 75.1 90.6 C76.6 92.1 77.5 95.4 77.3 97.5 Z',
      shines: 'M55.8 83.1 Q55.4 78.5 60.1 77.7 M72.2 77.7 Q71.9 73.6 76.2 72.9 M65.5 95.3 Q65.2 91.5 69.2 90.9',
    },
    {
      stalks: 'M126.4 87 C128.4 93 136.4 96 138.4 101 M138.4 101 Q134.3 106.5 130.8 109.5 M138.4 101 Q140.8 103.8 145.3 104 M138.4 101 Q138.3 112.5 139.5 121.5',
      berries: 'M139.1 115.7 C139.1 118.1 137.8 121.2 135.9 122.9 C134 124.6 130 126.2 127.8 125.8 C125.5 125.4 123.1 122.9 122.1 120.6 C121.2 118.3 121 114.2 121.9 112 C122.9 109.7 125.5 107.6 127.9 107.1 C130.2 106.6 134 107.4 135.9 108.8 C137.8 110.2 139.1 113.4 139.1 115.7 Z M154.7 109.8 C154.7 112 153.5 115.1 151.8 116.7 C150.1 118.4 146.7 119.9 144.4 119.5 C142.1 119.1 139.1 116.2 138.1 114.2 C137.2 112.2 137.6 109.2 138.5 107.3 C139.5 105.4 141.6 103.2 143.9 102.6 C146.1 102 150.2 102.4 152 103.6 C153.8 104.8 154.7 107.6 154.7 109.8 Z M147.4 128.2 C147.2 130.3 145 133.6 143.2 134.9 C141.3 136.2 138.1 136.6 136.3 136 C134.4 135.5 132.6 133.4 131.9 131.6 C131.1 129.9 131.1 127.5 132 125.5 C132.9 123.5 135.3 120.3 137.4 119.7 C139.5 119.2 143.1 120.8 144.7 122.2 C146.4 123.6 147.7 126.1 147.4 128.2 Z',
      shines: 'M125 114.3 Q124.6 109.7 129.3 109 M141.4 109 Q141.1 104.8 145.4 104.1 M134.7 126.6 Q134.4 122.7 138.4 122.1',
    },
  ],
};

/**
 * A coffee branch: four pairs of glossy leaves stepping down a stem that
 * enters from the left, with two clusters of ripe cherries hanging from short
 * peduncles in the axils. Each cluster is three berries on one stalk, so it
 * hangs as a single weight rather than three loose dots.
 *
 * The leaf pairs draw and pop node by node, which reads as the branch
 * unfurling from the cut end outwards. It does not sway: it is usually laid
 * over a photograph, and a moving branch on a still picture looks like a
 * glitch.
 *
 * viewBox 240x168 (10:7), drawn corner to corner. Large by design: best at
 * 140-320px wide, tucked over the corner of a print with a small rotation.
 */
export function CoffeeBranch({ className, ...props }: FoliageProps) {
  return (
    <svg viewBox="0 0 240 168" {...ROOT} className={className} {...props}>
      <g transform="translate(2.4 -2.2)">
        {BRANCH.nodes.map((node: Clump) => (
          <path key={node.leaves} className="ill-pop" fill="var(--color-sage)" d={node.leaves} />
        ))}
      </g>
      <g transform="translate(-2.6 2.4)">
        {BRANCH.clusters.map((cluster) => (
          <path key={cluster.berries} className="ill-pop" fill="var(--color-cherry)" d={cluster.berries} />
        ))}
      </g>

      <path className="ill-draw" {...INK} d={BRANCH.stem} />
      {BRANCH.nodes.map((node: Clump) => (
        <g key={node.leaves}>
          <path className="ill-draw" {...INK} d={node.leaves} />
          <path className="ill-draw" {...VEIN} d={node.ribs} />
        </g>
      ))}
      {BRANCH.clusters.map((cluster) => (
        <g key={cluster.berries}>
          <path className="ill-draw" {...VEIN} d={cluster.stalks} />
          <path className="ill-draw" {...INK} d={cluster.berries} />
          {/* The shine is the one white mark on the branch: it is what makes a
              flat red blob read as a ripe, wet cherry. */}
          <path
            className="ill-pop"
            d={cluster.shines}
            fill="none"
            stroke="var(--color-card)"
            strokeWidth={1.6}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </g>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Vine                                                               */
/* ------------------------------------------------------------------ */

const VINE = {
  stem: 'M9 22 C6 29 16 34 26 33 C86.3 33.2 109.2 49.2 169.5 49.3 C229.8 50 252.7 47 313 46.7 C373.3 47.9 396.2 36.6 456.5 34.7 C516.8 34.4 539.7 22.5 600 21.2 C660.3 22.5 683.2 24.2 743.5 23.5 C803.8 25.9 826.7 33.4 887 33.2 C947.3 33.2 970.2 48.6 1030.5 50.7 C1090.8 50.9 1113.7 51.4 1174 50.6 C1184 49.6 1194 54.6 1191 61.6',
  tendrils: [
    'M586.2 21.7 C595.2 31.7 611.2 35.7 613.2 27.7 C614.7 20.7 605.2 19.7 606.7 26.7',
    'M1010.3 49.4 C1019.3 39.4 1035.3 35.4 1037.3 43.4 C1038.8 50.4 1029.3 51.4 1030.8 44.4',
  ],
  clumps: [
    { leaves: 'M61.7 35.2 C71.5 38.5 78.4 28.8 75.8 16.1 C64.7 16 56.9 24.9 61.7 35.2 Z M101.2 41.9 C91.6 49.8 95.4 62.8 108.3 68.1 C116.1 56.8 113.8 43.3 101.2 41.9 Z M141.9 48.1 C151.6 50.6 159.1 39.8 157.2 26.7 C144.6 26.5 136.1 36.4 141.9 48.1 Z M192.2 49.4 C185.2 58.7 191.4 69.5 204.2 71.3 C208.5 59.6 203.4 48.1 192.2 49.4 Z', ribs: 'M61.7 35.2 C66.7 28.5 71.9 21.4 75.2 16.8 M101.2 41.9 C103.7 51.1 106.3 60.8 108 67.1 M141.9 48.1 C147.2 40.5 152.9 32.6 156.6 27.6 M192.2 49.4 C196.4 57.1 200.8 65.1 203.8 70.4' },
    { leaves: 'M321.4 46.8 C329 49.1 335.3 40.7 334.2 30.3 C324.6 30.1 317.5 37.7 321.4 46.8 Z M366 44.3 C360.4 53.4 367.2 63.7 379.4 65.2 C382.6 53.6 376.8 42.5 366 44.3 Z M404.5 39.1 C412.5 40.4 417.7 31.1 415.2 20.7 C405.6 21.8 399.5 30.5 404.5 39.1 Z M449.4 34.9 C444.4 44.4 451.7 54 463.9 54.4 C465.5 43.5 459 33.1 449.4 34.9 Z', ribs: 'M321.4 46.8 C325.9 40.9 330.6 34.9 333.7 30.9 M366 44.3 C370.7 51.6 375.6 59.3 378.8 64.4 M404.5 39.1 C408.2 32.6 412.2 25.8 414.8 21.4 M449.4 34.9 C454.4 41.8 459.8 49 463.3 53.6' },
    { leaves: 'M497.8 32.5 C507.4 33.8 512.3 23.5 507.8 12 C497 13.7 491.2 23.4 497.8 32.5 Z M536.8 27.1 C533.4 36.2 541.2 43.9 552.2 42.6 C553.3 31.5 546.2 22.9 536.8 27.1 Z M628.8 21.9 C623.8 31.3 631 40.3 642.9 40.1 C644.3 29.5 637.9 19.9 628.8 21.9 Z M669.3 23.1 C678.7 25.6 685.2 15.5 682.5 3.2 C671.2 3.5 663.7 12.8 669.3 23.1 Z', ribs: 'M497.8 32.5 C501.3 25.3 505 17.7 507.4 12.8 M536.8 27.1 C542.2 32.5 547.9 38.3 551.6 42 M628.8 21.9 C633.6 28.3 638.9 35 642.3 39.4 M669.3 23.1 C673.9 16.1 678.8 8.7 682 4' },
    { leaves: 'M801.7 27.9 C796.9 35.5 802.7 45.2 813 47.6 C816 37.3 811.1 27 801.7 27.9 Z M840.3 31.6 C851.2 36 859.7 25.4 857.6 10.6 C845.9 10.7 836.4 20.5 840.3 31.6 Z M887 33.2 C881.7 42.4 888.6 51.9 900.5 52.5 C903.6 41 897.6 30.7 887 33.2 Z M933.7 36.7 C941.7 40.1 949.9 31.7 950.4 20 C939.5 18.3 930.5 25.8 933.7 36.7 Z', ribs: 'M801.7 27.9 C805.6 34.8 809.8 42.1 812.5 46.8 M840.3 31.6 C846.4 24.3 852.8 16.5 856.9 11.4 M887 33.2 C891.7 40 896.8 47.1 900 51.8 M933.7 36.7 C939.5 30.8 945.7 24.6 949.7 20.7' },
    { leaves: 'M972.3 43.8 C964.5 50.9 967.9 63.7 978.9 69.6 C986 58.9 983.7 45.7 972.3 43.8 Z M1065.1 50.9 C1060.7 58.3 1066.5 66.9 1076.3 68.3 C1078.7 58.8 1073.8 49.6 1065.1 50.9 Z M1104.7 51.1 C1112.5 52.7 1117.9 43.8 1115.9 33.6 C1106.8 34.6 1100.6 42.8 1104.7 51.1 Z M1145.2 50.9 C1139.6 58.4 1144.7 69 1155.2 72.4 C1160.4 61.5 1156.4 50.2 1145.2 50.9 Z', ribs: 'M972.3 43.8 C974.7 52.8 977.1 62.4 978.6 68.6 M1065.1 50.9 C1069 57 1073.2 63.5 1075.9 67.6 M1104.7 51.1 C1108.6 44.9 1112.8 38.5 1115.5 34.3 M1145.2 50.9 C1148.8 58.4 1152.5 66.4 1154.8 71.6' },
  ],
  flowers: [
    { stalk: 'M253.8 47.9 Q258.6 39 259.5 34.1', petals: 'M261.8 36.5 C259.7 41.2 264 45.9 270.4 45.9 C271.5 39.7 267.6 34.6 261.8 36.5 Z M257.9 37.1 C252.6 36.4 250 41.5 252.6 47.3 C258.2 46.3 261.4 41.4 257.9 37.1 Z M256.1 33.5 C254.9 28.5 248.8 27.7 243.9 31.6 C246.8 36.9 252.8 38.4 256.1 33.5 Z M259 30.7 C263.3 28.3 262.4 22.9 257.4 19.8 C252.9 23.8 253.1 29.4 259 30.7 Z M262.5 32.5 C266.4 36.1 271.5 33.4 272.9 27.3 C267.6 24.7 262.2 26.8 262.5 32.5 Z', core: 'M262.9 33.5 C262.9 34.6 262.2 36.4 261.1 36.8 C260.1 37.1 257.5 36.4 256.9 35.5 C256.2 34.6 256.3 32.3 257 31.4 C257.8 30.6 260.4 30 261.4 30.4 C262.3 30.7 263 32.4 262.9 33.5 Z' },
    { stalk: 'M736.4 23.6 Q738.9 32.4 742.7 37.2', petals: 'M746 38.1 C746.9 43 753.2 44.5 758.6 41.2 C755.9 35.8 749.7 33.7 746 38.1 Z M742.6 40.6 C737.3 42.3 737.2 48.2 742.1 52.4 C747.1 49.1 747.8 43.2 742.6 40.6 Z M739.4 38.1 C736.2 33.8 730 35.5 727.1 41.4 C732.1 45.3 738.4 44.2 739.4 38.1 Z M740.7 34.5 C743.4 30.2 739.9 25.6 733.8 25.1 C731.8 30.9 734.7 36 740.7 34.5 Z M744.7 34.6 C750.2 36.4 753.7 31.6 751.9 25.2 C745.8 25 741.8 29.3 744.7 34.6 Z', core: 'M746 36.6 C746 37.7 744.3 39.6 743.3 40 C742.3 40.4 740.5 40.1 739.9 39.3 C739.2 38.4 738.7 36.1 739.3 35.1 C740 34.1 742.5 33.2 743.6 33.4 C744.8 33.7 746.1 35.5 746 36.6 Z' },
  ],
};

/**
 * A long hand-drawn vine, for the places a clay hairline used to divide two
 * thoughts: a wandering stem that starts and ends in a small flick, forty-odd
 * leaves alternating along it in six clumps, two tendril curls and two little
 * five-petal flowers on short stalks.
 *
 * It is drawn long rather than stretched. The geometry lives in a 1200x76
 * viewBox and is scaled uniformly, so the waves stay waves at any width and
 * the pen stays 1.6px; there is no `preserveAspectRatio="none"` here.
 * `orientation="vertical"` turns the same drawing a quarter turn into a
 * 76x1200 viewBox, for a column rule.
 *
 * Horizontal: give it a width and `h-auto` (it reads well from about 420px
 * wide; below that the leaves crowd, so prefer a `Squiggle` or a `Sprig`).
 * Vertical: give it a height and `w-auto`.
 */
export function Vine({
  className,
  orientation = 'horizontal',
  ...props
}: FoliageProps & { orientation?: 'horizontal' | 'vertical' }) {
  const vertical = orientation === 'vertical';
  return (
    <svg
      viewBox={vertical ? '0 0 76 1200' : '0 0 1200 76'}
      {...ROOT}
      className={className}
      {...props}
    >
      {/* A quarter turn, not a separate drawing: (x, y) goes to (76 - y, x). */}
      <g transform={vertical ? 'matrix(0 1 -1 0 76 0)' : undefined}>
        <g transform="translate(1.8 -1.8)">
          {VINE.clumps.map((clump: Clump) => (
            <path key={clump.leaves} className="ill-pop" fill="var(--color-sage)" d={clump.leaves} />
          ))}
          {VINE.flowers.map((flower) => (
            <g key={flower.core}>
              <path className="ill-pop" fill="var(--color-card)" d={flower.petals} />
              <path className="ill-pop" fill="var(--color-butter)" d={flower.core} />
            </g>
          ))}
        </g>

        <path className="ill-draw" {...INK} d={VINE.stem} />
        {VINE.tendrils.map((d) => (
          <path key={d} className="ill-draw" {...INK} d={d} />
        ))}
        {VINE.clumps.map((clump: Clump) => (
          <g key={clump.leaves}>
            <path className="ill-draw" {...INK} d={clump.leaves} />
            <path className="ill-draw" {...VEIN} d={clump.ribs} />
          </g>
        ))}
        {VINE.flowers.map((flower) => (
          <g key={flower.core}>
            <path className="ill-draw" {...VEIN} d={flower.stalk} />
            <path className="ill-draw" {...INK} d={flower.petals} />
            <path className="ill-draw" {...INK} d={flower.core} />
          </g>
        ))}
      </g>
    </svg>
  );
}
