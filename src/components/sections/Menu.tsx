'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { MenuCard } from '@/components/menu/MenuCard';
import { SplitHeading } from '@/components/motion/SplitHeading';
import { Magnetic } from '@/components/motion/Magnetic';
import { Button } from '@/components/ui/button';
import { gsap, useGsap } from '@/hooks/useGsap';
import { useIsDesktop, useMotionOK } from '@/hooks/useMediaQuery';
import { MENU, menuIndex, toColumns, type MenuItem } from '@/lib/menu';

/** Each column drifts at its own rate — the section's signature. */
const COLUMN_DRIFT = [-6, 4, -9];
/** And starts at its own height, so the grid never reads as rows. */
const COLUMN_OFFSET = ['lg:mt-0', 'lg:mt-14', 'lg:mt-10'];

type MenuProps = {
  /** Defaults to the full ten. */
  items?: readonly MenuItem[];
  eyebrow?: string;
  heading?: string;
  aside?: string;
  /** Rendered under the grid — the home page uses it to reach /menu. */
  cta?: { label: string; href: string };
  /** Sub-pages supply their own page header instead. */
  showHeader?: boolean;
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
 */
export function Menu({
  items = MENU,
  eyebrow = '03 — The Menu',
  heading = 'Ten things, done properly.',
  aside = 'Everything on this list is made in the room, to order. The coffee is single origin and changes with the season — ask what is on the bar today.',
  cta,
  showHeader = true,
  id = 'menu',
}: MenuProps) {
  const rootRef = useRef<HTMLElement>(null);
  const motionOK = useMotionOK();
  const isDesktop = useIsDesktop();

  const columns = toColumns(items);

  useGsap(
    () => {
      if (!motionOK) return;

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
            scrollTrigger: { trigger: card, start: 'top 92%', once: true },
            onComplete: () => gsap.set(card, { clearProps: 'transform,opacity' }),
          }
        );
      });

      // --- Header -------------------------------------------------------
      if (showHeader) {
        gsap
          .timeline({ scrollTrigger: { trigger: '.menu-head', start: 'top 82%', once: true } })
          .fromTo('.menu-eyebrow', { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.9 }, 0)
          .fromTo('.menu-aside', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1 }, 0.5)
          .fromTo(
            '.menu-rule',
            { scaleX: 0 },
            { scaleX: 1, duration: 1.5, ease: 'power3.inOut' },
            0.35
          );
      }

      if (cta) {
        gsap.fromTo(
          '.menu-cta',
          { opacity: 0, y: 22 },
          {
            opacity: 1,
            y: 0,
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: { trigger: '.menu-cta', start: 'top 94%', once: true },
          }
        );
      }

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
    [motionOK, isDesktop, showHeader, Boolean(cta), items],
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

      <div className="shell">
        {showHeader && (
          <header className="menu-head">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
              <div className="w-full lg:max-w-[34rem]">
                <p className="menu-eyebrow eyebrow reveal">{eyebrow}</p>
                <SplitHeading
                  as="h2"
                  id="menu-heading"
                  mode="chars-scatter"
                  start="top 84%"
                  className="mt-7 text-h2"
                >
                  {heading}
                </SplitHeading>
              </div>

              <p className="menu-aside reveal max-w-[38ch] font-sans text-body text-mute lg:pb-3 lg:text-right">
                {aside}
              </p>
            </div>

            <div className="menu-rule rule-gold mt-9 origin-left lg:mt-12" />
          </header>
        )}

        {/* ------------------------------- Grid ------------------------------- */}
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
                />
              ))}
            </div>
          ))}
        </div>

        {cta && (
          <div className="menu-cta reveal mt-12 flex justify-center lg:mt-16">
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
