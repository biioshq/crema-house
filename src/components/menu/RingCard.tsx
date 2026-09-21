import Image from 'next/image';
import Link from 'next/link';
import { IMAGES } from '@/lib/media';
import type { MenuItem } from '@/lib/menu';
import { formatPrice } from '@/lib/utils';

type RingCardProps = {
  item: MenuItem;
};

/**
 * One plate on the turning ring.
 *
 * Deliberately *not* `MenuCard`. Three things that card does are wrong on a
 * ring, and each of them is load-bearing rather than cosmetic:
 *
 * - Its photograph takes whatever aspect the dish was shot at. In a grid that
 *   variety is the point; on a ring it reads as a wobble, because the eye
 *   measures every plate against the one beside it as they pass.
 * - Its copy is marked `data-text`, so RevealRunner gives each line a
 *   ScrollTrigger measured off that element's own box — and the box of a card
 *   standing at sixty degrees inside a `perspective` is a projection, not a
 *   layout rect. Those triggers fire early, late, or never. Worse, the runner
 *   finishes by calling `clearProps: 'all'`.
 * - Its tilt writes `rotationX`/`rotationY` straight onto `.menu-card-inner`
 *   on every pointermove, which would fight the ring for the same matrix.
 *
 * So this is a square, quiet cousin — the same white plate, the same warm
 * shadow, the same clay price on hover — with nothing animating it but the
 * ring itself. It carries no reveal attributes at all: it is visible from the
 * moment it renders, and the ring is what brings it on.
 */
export function RingCard({ item }: RingCardProps) {
  const asset = IMAGES[item.id];

  return (
    <Link
      href="/menu"
      className="menu-ring-card card-surface block rounded-lg p-2.5 sm:p-3"
      // The visible text is a name and a price with no grammar between them,
      // which a screen reader would announce as two stray fragments. This says
      // the whole thing, and what following the link actually does.
      aria-label={`${item.name}, ${formatPrice(item.price)}. See the full menu`}
    >
      <span className="menu-ring-plate relative block aspect-square overflow-hidden rounded-[calc(var(--radius-lg)-0.625rem)] bg-sand">
        {/* No `priority`: the ring sits well below the fold on the home page,
            and preloading a plate here only competes with the hero.
            `sizes` is generous rather than exact — the ring scales with the
            viewport through a clamp, and whichever plate is nearest the viewer
            is drawn larger than its own box by the perspective. */}
        <Image
          src={asset.src}
          alt=""
          fill
          sizes="(min-width: 1024px) 20vw, (min-width: 640px) 28vw, 46vw"
          placeholder="blur"
          blurDataURL={asset.blurDataURL}
          className="object-cover"
        />
        {/* The same whisper of light the menu plates carry, so a photograph
            never looks pasted onto the card. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'linear-gradient(178deg, rgb(255 255 255 / 0.22) 0%, transparent 24%)',
          }}
        />
      </span>

      {/* Name and price on one row, the price at the right — the same
          arrangement as the menu grid, so a plate met here is recognisable
          when it turns up again on /menu. */}
      {/* The price sits *under* the name, not beside it.

          Sharing a row cost the name about 37px of the plate's 114px inner
          width — the price pill plus its gap — which left roughly eight
          characters a line. Two lines of that turned "Grilled Chicken
          Sandwich" into "Grilled Chicken…" on every phone and tablet, because
          the plate is pinned at its 9rem floor until the viewport reaches
          847px. Stacked, the name has the full width and the same two lines
          hold every dish on the list. */}
      <span className="mt-3 block px-1 pb-0.5">
        {/* Wraps to a second line rather than truncating. A plate on the stand
            is 144px wide on a phone, which is not enough for "Grilled Chicken
            Sandwich" on one line: truncation turned half the list into
            "Chocola…", which is worse than a name set two lines deep.

            The two lines are *reserved* whether the name needs them or not —
            see `.menu-ring-name`. Every plate on a ring has to be the same
            height, and a foot that grew with the name made the stand look like
            it was holding cards of three different sizes. */}
        {/* The type bump waits for `xl`, not `sm`. `--menu-ring-card` is
            `clamp(9rem, 17vw, 15.5rem)`, and 17vw does not overtake the 9rem
            floor until an 847px viewport — so a bump at 640px enlarged the
            name inside a plate that was still exactly 144px wide, which is
            the one combination that truncates. */}
        <span className="menu-ring-name display-face block text-[0.9rem] leading-[1.15] text-ink xl:text-[1.05rem]">
          {item.name}
        </span>
        <span className="menu-ring-price mt-1 block font-sans text-[0.72rem] font-medium tracking-[0.03em] text-mute tabular-nums">
          {formatPrice(item.price)}
        </span>
      </span>
    </Link>
  );
}
