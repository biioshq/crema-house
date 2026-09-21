'use client';

import Link from 'next/link';
import { useRef, type ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { MenuCard } from '@/components/menu/MenuCard';
import { MenuRing } from '@/components/menu/MenuRing';
import { Magnetic } from '@/components/motion/Magnetic';
import { CupBouquet } from '@/components/illustrations/Florals';
import { Bean } from '@/components/illustrations/Doodles';
import { Button } from '@/components/ui/button';
import { gsap, useGsap } from '@/hooks/useGsap';
import { useIsDesktop, useMotionOK } from '@/hooks/useMediaQuery';
import { MENU, menuIndex, toColumns, type MenuItem } from '@/lib/menu';
import type { ImageKey } from '@/lib/media';

/** Each column drifts at its own rate — the section's signature. */
const COLUMN_DRIFT = [-6, 4, -9];
/** And starts at its own height, so the grid never reads as rows. */
const COLUMN_OFFSET = ['lg:mt-0', 'lg:mt-14', 'lg:mt-10'];
/** The two dishes that wear a handwritten "house favourite" sticker. */
const FAVOURITES = new Set<ImageKey>(['cappuccino', 'butter-croissant']);

/**
 * Coffee beans scattered in the gutters, behind the plates. Each drifts at its
 * own parallax rate; the phone keeps only the two that hug the screen edges.
 */
const BEANS = [
  { className: 'top-[9%] left-[2%] w-7 rotate-[-24deg] sm:w-9', float: '36' },
  { className: 'top-[38%] right-[1.5%] w-6 rotate-[32deg] sm:w-8', float: '52' },
  { className: 'top-[62%] left-[31%] hidden w-7 rotate-[70deg] lg:block', float: '28' },
  { className: 'bottom-[14%] right-[33%] hidden w-6 rotate-[-12deg] lg:block', float: '44' },
  { className: 'bottom-[6%] left-[4%] hidden w-8 rotate-[140deg] sm:block', float: '60' },
] as const;

/** Sets the heading's last word in the clay italic accent. */
function withAccent(heading: string): ReactNode {
  const match = /^(.*\s)(\S+?)([.,!?]*)$/.exec(heading);
  if (!match) return heading;
  const [, lead, word, tail] = match;
  return (
    <>
      {lead}
      <em className="accent">{word}</em>
      {tail}
    </>
  );
}

type MenuProps = {
  /** Defaults to the full ten. */
  items?: readonly MenuItem[];
  eyebrow?: string;
  heading?: string;
  aside?: string;
  /** Rendered under the grid; the home page uses it to reach /menu. */
  cta?: { label: string; href: string };
  /** Sub-pages supply their own page header instead. */
  showHeader?: boolean;
  /**
   * How the plates are arranged.
   *
   * `grid` is the vitrine proper — three drifting columns, every dish with its
   * note and its price, which is what a page whose job is *reading the menu*
   * needs. `ring` stands the same plates on a turning cylinder: fewer words,
   * one dish square-on at a time, and the whole list in motion. The home page
   * takes the ring because its job is to make you want the menu, not to be it.
   */
  variant?: 'grid' | 'ring';
  id?: string;
};

/**
 * SECTION 03 — "The Menu"
 *
 * A vitrine. Three columns of floating white plates fill in reading order and
 * then scroll at three different rates, which is what turns a grid into a
 * composition. The cards arrive with depth — rising, un-scaling and
 * un-rotating out of the page rather than fading in — and there is more air
 * between them than there is card.
 *
 * The header's text reveals through the shared RevealRunner (`data-text`): a
 * written eyebrow, a scattered headline, the aside line by line. A coffee cup
 * of flowers stands beside the heading and a few beans drift in the gutters.
 */
export function Menu({
  items = MENU,
  eyebrow = 'The menu',
  heading = 'Ten things, done properly.',
  aside = 'Everything on this list is made in the room, to order. The coffee is single origin and changes with the season, so ask what is on the bar today.',
  cta,
  showHeader = true,
  variant = 'grid',
  id = 'menu',
}: MenuProps) {
  const rootRef = useRef<HTMLElement>(null);
  const motionOK = useMotionOK();
  const isDesktop = useIsDesktop();

  const columns = toColumns(items);

  useGsap(
    () => {
      if (!motionOK) return;

      // The ring brings its own plates on and turns them itself; neither the
      // card entrance nor the column drift below has anything to act on.
      if (variant === 'ring') return;

      // --- Entrance: depth, not opacity ---------------------------------
      gsap.utils.toArray<HTMLElement>('.menu-card').forEach((card) => {
        gsap.set(card, { transformPerspective: 1000 });

        gsap.fromTo(
          card,
          { y: 78, scale: 0.94, rotateX: 16, z: -180, opacity: 0 },
          {
            y: 0,
            scale: 1,
            rotateX: 0,
            z: 0,
            opacity: 1,
            duration: 1.5,
            ease: 'power4.out',
            // Fired as the top edge crosses the fold rather than a little
            // after it: on a phone a card is taller than the screen, so at
            // `top 92%` the first strip of it — chip, sticker — was on screen
            // and still at zero, which reads as a blank band at the bottom of
            // the page while you scroll.
            scrollTrigger: { trigger: card, start: 'top 99%', once: true },
            onComplete: () => gsap.set(card, { clearProps: 'transform,opacity' }),
          }
        );
      });

      // --- Differential column drift (desktop only) ----------------------
      if (!isDesktop) return;

      gsap.utils.toArray<HTMLElement>('.menu-column').forEach((column, index) => {
        const drift = COLUMN_DRIFT[index] ?? 0;
        gsap.fromTo(
          column,
          { yPercent: -drift / 2 },
          {
            yPercent: drift / 2,
            ease: 'none',
            scrollTrigger: {
              trigger: rootRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.1,
            },
          }
        );
      });
    },
    [motionOK, isDesktop, items, variant],
    rootRef
  );

  return (
    <section
      ref={rootRef}
      id={id}
      aria-labelledby={showHeader ? 'menu-heading' : undefined}
      aria-label={showHeader ? undefined : 'Menu'}
      className="relative isolate overflow-x-clip py-section"
    >
      {/* The band the vitrine stands in — a wash of oat, edge to edge, that
          separates the menu from the spread above it without a single line. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full"
        style={{
          background:
            'linear-gradient(180deg, rgb(243 238 229 / 0) 0%, rgb(243 238 229 / 0.72) 14%, rgb(243 238 229 / 0.72) 86%, rgb(243 238 229 / 0) 100%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[16%] -z-10 h-[62%]"
        style={{
          background:
            'radial-gradient(54% 46% at 50% 46%, rgb(252 249 243 / 0.5) 0%, transparent 72%)',
        }}
      />

      {BEANS.map((bean, index) => (
        <Bean
          key={index}
          data-ill
          data-ill-float={bean.float}
          data-ill-delay={String(0.15 * index)}
          className={`pointer-events-none absolute -z-10 h-auto ${bean.className}`}
        />
      ))}

      <div className="shell">
        {showHeader && (
          <header className="menu-head flex flex-col gap-8 lg:flex-row lg:items-end lg:gap-12">
            <div className="w-full lg:max-w-[34rem]">
              <p data-text="write" className="eyebrow">
                {eyebrow}
              </p>
              <h2 id="menu-heading" data-text="scatter" data-text-start="top 84%" className="mt-5 text-h2">
                {withAccent(heading)}
              </h2>
            </div>

            {/* On a phone the bouquet stands small at the end of the aside; from
                lg it moves to the left of the group, right beside the heading,
                and the aside keeps the far right. */}
            <div className="flex items-end gap-5 lg:flex-1 lg:justify-between lg:gap-10">
              <p
                data-text="lines"
                data-text-delay="0.25"
                className="max-w-[38ch] flex-1 font-sans text-body text-mute lg:order-2 lg:flex-none lg:pb-3 lg:text-right"
              >
                {aside}
              </p>
              <CupBouquet
                data-ill
                data-ill-delay="0.2"
                className="h-auto w-20 shrink-0 sm:w-24 lg:order-1 lg:-mb-2 lg:w-40 xl:w-44"
              />
            </div>
          </header>
        )}

        {/* ------------------------------- Ring ------------------------------- */}
        {variant === 'ring' && (
          <div className={showHeader ? 'mt-12 lg:mt-16' : ''}>
            <MenuRing items={items} />
          </div>
        )}

        {/* ------------------------------- Grid ------------------------------- */}
        {variant === 'grid' && (
          <div
            className={[
              'grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-3 lg:gap-x-12 lg:gap-y-14',
              showHeader ? 'mt-10 lg:mt-14' : '',
            ].join(' ')}
          >
            {columns.map((column, columnIndex) => (
              <div
                key={columnIndex}
                className={[
                  'menu-column mx-auto flex w-full max-w-[30rem] flex-col gap-10 md:max-w-[38rem] lg:mx-0 lg:max-w-none lg:gap-14',
                  COLUMN_OFFSET[columnIndex] ?? '',
                ].join(' ')}
              >
                {column.map((item) => (
                  <MenuCard
                    key={item.id}
                    item={item}
                    index={menuIndex(item.id)}
                    priority={columnIndex === 0 && menuIndex(item.id) === 0}
                    favourite={FAVOURITES.has(item.id)}
                  />
                ))}
              </div>
            ))}
          </div>
        )}

        {cta && (
          <div data-text="fade" className="menu-cta mt-12 flex justify-center lg:mt-16">
            <Magnetic strength={0.28} padding={38}>
              <Button asChild size="lg" variant="outline">
                <Link href={cta.href}>
                  {cta.label}
                  <ArrowRight className="size-4" strokeWidth={1.5} />
                </Link>
              </Button>
            </Magnetic>
          </div>
        )}
      </div>
    </section>
  );
}
